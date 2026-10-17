import { createAuthenticatedClient, AuthenticatedClient, isFinalizedGrantWithAccessToken, isPendingGrant, Quote } from '@interledger/open-payments';
import * as crypto from 'crypto';

export interface BiotaFlowConfig {
  walletAddressUrl: string; // La dirección origen (Ej: 'https://ilp.rafiki.money/alice')
  privateKey: string;       // El string de tu private.pem
  keyId: string;            // El ID del JWKS
}

export interface WalletAddressDetails {
  id: string;
  publicName?: string;
  assetCode: string;
  assetScale: number;
  authServer: string;
  resourceServer: string;
}

export interface ChargeAmount {
  value: string;
  assetCode: string;
  assetScale: number;
}

/**
 * Interfaz de respuesta al crear un recibo de cobro.
 */
export interface InvoiceResult {
  invoiceUrl: string;
  accessToken: string;
}

export class BiotaFlowClient {
  private config: BiotaFlowConfig;
  private clientPromise: Promise<AuthenticatedClient> | null = null;

  constructor(config: BiotaFlowConfig) {
    this.config = config;
  }

  private async getClient(): Promise<AuthenticatedClient> {
    if (!this.clientPromise) {
      this.clientPromise = createAuthenticatedClient({
        walletAddressUrl: this.config.walletAddressUrl,
        keyId: this.config.keyId,
        privateKey: this.config.privateKey,
        validateResponses: false
      });
    }
    return this.clientPromise;
  }

  public async getWalletDetails(walletUrl: string): Promise<WalletAddressDetails> {
    try {
      const openPaymentsClient = await this.getClient();
      const walletAddress = await openPaymentsClient.walletAddress.get({ url: walletUrl });
      
      return {
        id: walletAddress.id,
        publicName: walletAddress.publicName,
        assetCode: walletAddress.assetCode,
        assetScale: walletAddress.assetScale,
        authServer: walletAddress.authServer,
        resourceServer: walletAddress.resourceServer
      };
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Fallo en el descubrimiento de la billetera (${walletUrl}). Detalle: ${errorMsg}`);
    }
  }

  public async createChargeInvoice(receivingWalletUrl: string, amount: ChargeAmount): Promise<InvoiceResult> {
    try {
      const openPaymentsClient = await this.getClient();
      const receiverDetails = await this.getWalletDetails(receivingWalletUrl);
      
      const grant = await openPaymentsClient.grant.request(
        { url: receiverDetails.authServer },
        { access_token: { access: [{ type: 'incoming-payment', actions: ['list', 'read', 'read-all', 'complete', 'create'] }] } }
      );

      if (!isFinalizedGrantWithAccessToken(grant)) throw new Error('El servidor de autorización denegó el Grant o requiere interacción manual.');
      
      const accessToken = grant.access_token.value;

      const incomingPayment = await openPaymentsClient.incomingPayment.create(
        { url: receiverDetails.resourceServer, accessToken: accessToken },
        {
          walletAddress: receivingWalletUrl,
          incomingAmount: amount,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() 
        }
      );

      return {
        invoiceUrl: incomingPayment.id,
        accessToken: accessToken
      };

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Fallo al crear la factura. Detalle: ${errorMsg}`);
    }
  }

  public async createQuoteForPayment(invoiceUrl: string): Promise<Quote> {
    try {
      const openPaymentsClient = await this.getClient();
      const senderDetails = await this.getWalletDetails(this.config.walletAddressUrl);
      
      const quoteGrant = await openPaymentsClient.grant.request(
        { url: senderDetails.authServer },
        { access_token: { access: [{ type: 'quote', actions: ['create', 'read', 'read-all'] }] } }
      );

      if (!isFinalizedGrantWithAccessToken(quoteGrant)) {
        throw new Error('El servidor denegó el permiso para cotizar.');
      }

      const quote = await openPaymentsClient.quote.create(
        {
          url: senderDetails.resourceServer,
          accessToken: quoteGrant.access_token.value
        },
        {
          method: 'ilp',
          walletAddress: this.config.walletAddressUrl,
          receiver: invoiceUrl
        }
      );

      return quote;

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Fallo en el cálculo de la cotización. Detalle: ${errorMsg}`);
    }
  }

  public async requestInteractivePaymentGrant(quote: Quote, redirectFrontendUrl: string): Promise<{ interactionUrl: string, continueToken: string, continueUri: string }> {
    try {
      const openPaymentsClient = await this.getClient();
      const senderDetails = await this.getWalletDetails(this.config.walletAddressUrl);

      const cryptoNonce = crypto.randomUUID();

      const grant = await openPaymentsClient.grant.request(
        { url: senderDetails.authServer },
        {
          access_token: {
            access: [
              {
                identifier: senderDetails.id,
                type: 'outgoing-payment',
                actions: ['list', 'list-all', 'read', 'read-all', 'create'],
                limits: {
                  debitAmount: {
                    assetCode: quote.debitAmount.assetCode,
                    assetScale: quote.debitAmount.assetScale,
                    value: quote.debitAmount.value
                  }
                }
              }
            ]
          },
          interact: {
            start: ['redirect'],
            finish: {
              method: 'redirect',
              uri: redirectFrontendUrl,
              nonce: cryptoNonce
            }
          }
        }
      );

      if (!isPendingGrant(grant)) {
        throw new Error('El servidor no devolvió una URL interactiva. Rechazado.');
      }

      return {
        interactionUrl: grant.interact.redirect,
        continueToken: grant.continue.access_token.value,
        continueUri: grant.continue.uri
      };

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Fallo en la negociación de pago interactivo. Detalle: ${errorMsg}`);
    }
  }

  public async executePayment(quoteId: string, finalAccessToken: string): Promise<string> {
    try {
      const openPaymentsClient = await this.getClient();
      const senderDetails = await this.getWalletDetails(this.config.walletAddressUrl);

      const outgoingPayment = await openPaymentsClient.outgoingPayment.create(
        {
          url: senderDetails.resourceServer,
          accessToken: finalAccessToken
        },
        {
          walletAddress: this.config.walletAddressUrl,
          quoteId: quoteId
        }
      );

      return outgoingPayment.id;

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Fallo al mover el dinero saliente en Interledger. Detalle: ${errorMsg}`);
    }
  }

  public async finalizeInteractiveGrant(continueUri: string, continueAccessToken: string, interactRef: string): Promise<string> {
    try {
      const openPaymentsClient = await this.getClient();
      
      const continuation = await openPaymentsClient.grant.continue(
        {
          url: continueUri,
          accessToken: continueAccessToken
        },
        {
          interact_ref: interactRef
        }
      );

      if (!isFinalizedGrantWithAccessToken(continuation)) {
        throw new Error('El servidor de pagos no devolvió un Access Token válido tras la autorización.');
      }

      return continuation.access_token.value;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Fallo al finalizar el grant interactivo. Detalle: ${errorMsg}`);
    }
  }
}
