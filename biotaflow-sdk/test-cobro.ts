import { BiotaFlowClient } from './core/BiotaFlowClient';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// --- CONFIGURACIÓN DE TUS LLAVES ---
const privateKeyReceptor = fs.readFileSync(path.resolve(process.cwd(), './biotaflow-sdk/auth/private-emisor.pem'), 'utf8');
const privateKeyDonante = fs.readFileSync(path.resolve(process.cwd(), './biotaflow-sdk/auth/private.pem'), 'utf8');

// --- TUS DIRECCIONES DE RAFIKI ---
const URL_RECEPTOR_COLOMBIA = 'https://ilp.interledger-test.dev/pagos-entrada';    
const URL_DONANTE_EUROPA = 'https://ilp.interledger-test.dev/225f757';        

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const askQuestion = (query: string): Promise<string> => new Promise(resolve => rl.question(query, resolve));

async function runFullPaymentFlow() {
  console.log("===========================================");
  console.log("🚀 SPRINT 7: PRUEBA DE VOLUMEN (100 EUR -> COP)");
  console.log("===========================================\n");

  try {
    console.log("--- 1. FACTURACIÓN (Cuenta Productor COP) ---");
    const clientReceptor = new BiotaFlowClient({
      walletAddressUrl: URL_RECEPTOR_COLOMBIA,
      privateKey: privateKeyReceptor,
      keyId: '29fbde3d-82b9-42ce-bc76-c0516c6a019c' 
    });

    // 100 EUR son aproximadamente 420,000 COP. 
    // assetScale de COP es 2, así que añadimos dos ceros extra: 42000000
    const invoice = await clientReceptor.createChargeInvoice(URL_RECEPTOR_COLOMBIA, {
      value: '42000000',       // 420,000.00 COP (~100 EUR)
      assetCode: 'COP',   
      assetScale: 2       
    });
    console.log("✅ Factura generada por 420,000.00 COP.\n");


    console.log("--- 2. EL DONANTE PREPARA LOS FONDOS (Cuenta EUR) ---");
    const clientDonante = new BiotaFlowClient({
      walletAddressUrl: URL_DONANTE_EUROPA,
      privateKey: privateKeyDonante,
      keyId: '88f97526-9b67-4703-9807-ddfeb16a7b21'
    });

    console.log(`🔐 [GNAP] Solicitando cotización y permiso INTERACTIVO de usuario...`);
    const quote = await clientDonante.createQuoteForPayment(invoice.invoiceUrl);
    const interactiveGrant = await clientDonante.requestInteractivePaymentGrant(quote, 'http://localhost:3000/success');

    console.log("\n===========================================");
    console.log("🛑 ACCIÓN REQUERIDA (SIMULANDO FRONTEND)");
    console.log(`👉 ${interactiveGrant.interactionUrl}`);
    console.log("===========================================\n");

    const interactRef = await askQuestion("🔑 Pega aquí el código 'interact_ref' que salió en la URL: ");
    rl.close();

    if (!interactRef) throw new Error("Abortado por el usuario.");

    console.log("\n--- 3. EJECUCIÓN (Moviendo el dinero) ---");
    const finalAccessToken = await clientDonante.finalizeInteractiveGrant(
      interactiveGrant.continueUri, 
      interactiveGrant.continueToken, 
      interactRef
    );

    const transactionId = await clientDonante.executePayment(quote.id, finalAccessToken);
    
    console.log(`\n======================================================`);
    console.log(`🏆 ¡PAGO EJECUTADO CON ÉXITO EN LA RED INTERLEDGER! 🏆`);
    console.log(`======================================================`);
    console.log(`URL de la Transacción: ${transactionId}`);

  } catch (error) {
    console.error("🔥 Error crítico en el flujo:", error);
    rl.close();
  }
}

runFullPaymentFlow();
