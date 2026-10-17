'use server';

import { BiotaFlowClient } from '@/biotaflow-sdk/core/BiotaFlowClient';
import * as fs from 'fs';
import * as path from 'path';

// Utilidad segura para extraer variables de entorno
const getEnv = (key: string) => {
  const val = process.env[key];
  if (!val) throw new Error(`Falta variable de entorno: ${key}`);
  return val;
};

// [OPEN PAYMENTS / GNAP SESSION STORE PERSISTENTE]
// En Next.js en modo desarrollo, cada Server Action se ejecuta en worker threads aislados de Node.js.
// Persistimos la sesión temporal en .next/cache/biotaflow-sessions/ para compartir estado entre el inicio
// y el callback de redirección de Rafiki (/success).
interface PaymentSession {
  quoteId: string;
  continueUri: string;
  continueToken: string;
  createdAt: number;
  debitAmount?: { value: string; assetCode: string; assetScale: number };
  receiveAmount?: { value: string; assetCode: string; assetScale: number };
  producerName?: string;
  tipoOperacion?: 'financiamiento' | 'recurrente' | 'b2b_ecommerce';
  intervaloRecurrente?: string; // ej. R/2026-10-01T00:00:00Z/P1M
}

const SESSIONS_DIR = path.resolve(process.cwd(), '.next/cache/biotaflow-sessions');

function ensureSessionsDir() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

function saveSession(sessionId: string, session: PaymentSession) {
  ensureSessionsDir();
  const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(session), 'utf8');
}

function getSession(sessionId: string): PaymentSession | undefined {
  ensureSessionsDir();
  const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
  if (!fs.existsSync(filePath)) return undefined;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed: PaymentSession = JSON.parse(raw);
    // Validez máxima: 15 minutos (900.000 ms)
    if (Date.now() - parsed.createdAt > 15 * 60 * 1000) {
      fs.unlinkSync(filePath);
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

function deleteSession(sessionId: string) {
  try {
    const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    console.warn("No se pudo eliminar archivo de sesión temporal:", e);
  }
}

// Fallback: busca la sesión activa más reciente en disco si por algún motivo el query param sid no llegó
function getLatestSession(): { sessionId: string; session: PaymentSession } | undefined {
  ensureSessionsDir();
  const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'));
  if (files.length === 0) return undefined;

  let latest: { sessionId: string; session: PaymentSession } | undefined;
  for (const file of files) {
    const sid = file.replace('.json', '');
    const s = getSession(sid);
    if (s && (!latest || s.createdAt > latest.session.createdAt)) {
      latest = { sessionId: sid, session: s };
    }
  }
  return latest;
}

/**
 * PARÁMETROS UNIVERSALES DE PAGO OPEN PAYMENTS
 */
export interface IniciarPagoParams {
  montoCop: string;
  destinoNombre?: string;
  tipoOperacion?: 'financiamiento' | 'recurrente' | 'b2b_ecommerce';
  intervaloIso?: string; // ej. P1M (mensual) o P1W (semanal)
}

/**
 * PASO 1: Genera factura (IncomingPayment), cotización (Quote) y solicita permiso interactivo (GNAP Grant)
 * Soporta tanto pagos únicos en COP, pagos recurrentes con interval ISO 8601, como compras B2B.
 */
export async function iniciarDonacion(
  montoCop: string, 
  destinoNombre?: string, 
  tipoOperacion: 'financiamiento' | 'recurrente' | 'b2b_ecommerce' = 'financiamiento',
  intervaloIso?: string
) {
  try {
    const URL_RECEPTOR = getEnv('BIOTAFLOW_URL_RECEPTOR');
    const URL_DONANTE = getEnv('BIOTAFLOW_URL_DONANTE');
    const KEY_ID_RECEPTOR = getEnv('BIOTAFLOW_KEY_ID_RECEPTOR');
    const KEY_ID_DONANTE = getEnv('BIOTAFLOW_KEY_ID_DONANTE');

    // Leer llaves de forma segura en el backend
    const privateKeyReceptor = fs.readFileSync(path.resolve(process.cwd(), getEnv('BIOTAFLOW_PRIVATE_KEY_PATH_RECEPTOR')), 'utf8');
    const privateKeyDonante = fs.readFileSync(path.resolve(process.cwd(), getEnv('BIOTAFLOW_PRIVATE_KEY_PATH_DONANTE')), 'utf8');

    // 1. Facturación: convertimos monto nominal en COP a unidades menores (assetScale: 2)
    const valorNominal = parseFloat(montoCop);
    if (isNaN(valorNominal) || valorNominal <= 0) {
      throw new Error("El monto de la transacción debe ser un valor numérico positivo en COP.");
    }
    const valorEnEscala = Math.round(valorNominal * 100).toString();

    const clientReceptor = new BiotaFlowClient({
      walletAddressUrl: URL_RECEPTOR,
      privateKey: privateKeyReceptor,
      keyId: KEY_ID_RECEPTOR
    });

    const invoice = await clientReceptor.createChargeInvoice(URL_RECEPTOR, {
      value: valorEnEscala,
      assetCode: 'COP',
      assetScale: 2
    });

    // 2. Cotización y Permiso
    const clientDonante = new BiotaFlowClient({
      walletAddressUrl: URL_DONANTE,
      privateKey: privateKeyDonante,
      keyId: KEY_ID_DONANTE
    });

    const quote = await clientDonante.createQuoteForPayment(invoice.invoiceUrl);

    // 3. Generamos un sessionId único y registramos la sesión compartida entre workers
    const sessionId = crypto.randomUUID();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/success?sid=${sessionId}`;

    const interactiveGrant = await clientDonante.requestInteractivePaymentGrant(quote, redirectUrl);

    saveSession(sessionId, {
      quoteId: quote.id,
      continueUri: interactiveGrant.continueUri,
      continueToken: interactiveGrant.continueToken,
      createdAt: Date.now(),
      debitAmount: quote.debitAmount,
      receiveAmount: quote.receiveAmount,
      producerName: destinoNombre || 'Productor Agroecológico Biota',
      tipoOperacion,
      intervaloRecurrente: tipoOperacion === 'recurrente' ? (intervaloIso || 'R/2026-10-01T00:00:00Z/P1M') : undefined
    });

    return { 
      success: true, 
      interactionUrl: interactiveGrant.interactionUrl,
      sessionId
    };
  } catch (error: unknown) {
    const mensajeDeError = error instanceof Error ? error.message : String(error);
    console.error("Error en iniciarDonacion:", mensajeDeError);
    return { success: false, error: mensajeDeError };
  }
}

/**
 * PASO 2: Finaliza el grant interactivo (GNAP) y liquida el pago saliente en Interledger
 * Se ejecuta en el Servidor (Server Action) cuando el usuario regresa a /success?sid=...&interact_ref=...
 */
export async function completarDonacion(interactRef: string, sessionId?: string | null) {
  try {
    const URL_DONANTE = getEnv('BIOTAFLOW_URL_DONANTE');
    const KEY_ID_DONANTE = getEnv('BIOTAFLOW_KEY_ID_DONANTE');
    const privateKeyDonante = fs.readFileSync(path.resolve(process.cwd(), getEnv('BIOTAFLOW_PRIVATE_KEY_PATH_DONANTE')), 'utf8');

    // Recuperamos la sesión
    let activeSession: PaymentSession | undefined;
    let activeSid: string | undefined;

    if (sessionId) {
      activeSession = getSession(sessionId);
      activeSid = sessionId;
    }

    if (!activeSession) {
      const fallback = getLatestSession();
      if (fallback) {
        activeSession = fallback.session;
        activeSid = fallback.sessionId;
      }
    }

    if (!activeSession) {
      throw new Error("Sesión de pago no encontrada o expiró.");
    }

    const clientDonante = new BiotaFlowClient({
      walletAddressUrl: URL_DONANTE,
      privateKey: privateKeyDonante,
      keyId: KEY_ID_DONANTE
    });

    // Llamada correcta al método del SDK
    const finalAccessToken = await clientDonante.finalizeInteractiveGrant(
      activeSession.continueUri,
      activeSession.continueToken,
      interactRef
    );

    const transactionId = await clientDonante.executePayment(activeSession.quoteId, finalAccessToken);

    if (activeSid) {
      deleteSession(activeSid);
    }

    return {
      success: true,
      transactionId,
      receipt: {
        transactionId,
        producerName: activeSession.producerName,
        debitAmount: activeSession.debitAmount,
        receiveAmount: activeSession.receiveAmount,
        tipoOperacion: activeSession.tipoOperacion || 'financiamiento',
        intervaloRecurrente: activeSession.intervaloRecurrente,
        timestamp: Date.now()
      }
    };
  } catch (error: unknown) {
    const mensajeDeError = error instanceof Error ? error.message : String(error);
    console.error("Error en completarDonacion:", mensajeDeError);
    return { success: false, error: mensajeDeError };
  }
}
