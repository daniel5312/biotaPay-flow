'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { completarDonacion } from '@/app/actions/biotaflow';
import { 
  CheckCircle2, 
  Copy, 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface ReceiptData {
  transactionId: string;
  producerName?: string;
  debitAmount?: { value: string; assetCode: string; assetScale: number };
  receiveAmount?: { value: string; assetCode: string; assetScale: number };
  tipoOperacion?: 'financiamiento' | 'recurrente' | 'b2b_ecommerce';
  intervaloRecurrente?: string;
  timestamp?: number;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'procesando' | 'exito' | 'error'>('procesando');
  const [txId, setTxId] = useState<string>('');
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // [PROTECCIÓN STRICTMODE / REACT 19]
  // React 19 en modo desarrollo ejecuta los useEffect dos veces seguidas.
  // Como interact_ref y los tokens GNAP son de UN SOLO USO (single-use),
  // este ref garantiza que la liquidación se despache estrictamente una única vez.
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    const interactRef = searchParams.get('interact_ref');
    const sessionId = searchParams.get('sid');

    if (!interactRef) {
      setStatus('error');
      setErrorMessage('No se encontró la referencia de interacción interact_ref devuelta por el servidor de consentimiento.');
      return;
    }

    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    const procesarPago = async () => {
      try {
        const respuesta = await completarDonacion(interactRef, sessionId);

        if (respuesta.success && respuesta.transactionId) {
          setStatus('exito');
          setTxId(respuesta.transactionId);
          if (respuesta.receipt) {
            setReceipt(respuesta.receipt);
          }
        } else {
          setStatus('error');
          setErrorMessage(respuesta.error || 'Falló la ejecución del pago en la red Interledger');
        }
      } catch (error: unknown) {
        console.error("Fallo capturado en catch:", error);
        setStatus('error');
        setErrorMessage('Ocurrió un error inesperado de red al contactar el nodo de liquidación.');
      }
    };

    procesarPago();
  }, [searchParams]);

  const copiarTxId = () => {
    if (!txId) return;
    navigator.clipboard.writeText(txId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatearMonto = (amountObj?: { value: string; assetCode: string; assetScale: number }) => {
    if (!amountObj) return null;
    const nominal = Number(amountObj.value) / Math.pow(10, amountObj.assetScale);
    if (amountObj.assetCode === 'COP') {
      return `$${nominal.toLocaleString('es-CO')} COP`;
    }
    if (amountObj.assetCode === 'EUR') {
      return `€${nominal.toFixed(2)} EUR`;
    }
    return `${nominal.toFixed(2)} ${amountObj.assetCode}`;
  };

  const fechaFormateada = receipt?.timestamp
    ? new Date(receipt.timestamp).toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Cabecera */}
        <div className={`p-8 text-center text-white relative ${
          status === 'procesando' 
            ? 'bg-slate-900' 
            : status === 'exito' 
              ? 'bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900' 
              : 'bg-gradient-to-r from-red-600 to-rose-800'
        }`}>
          {status === 'procesando' && (
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin" />
              <h1 className="text-2xl font-black">Liquidando en Interledger...</h1>
              <p className="text-xs text-slate-300">Finalizando Grant GNAP e intercambiando paquetes ILP en tiempo real</p>
            </div>
          )}

          {status === 'exito' && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400 flex items-center justify-center mb-1">
                <CheckCircle2 className="w-9 h-9 text-emerald-300" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200">
                {receipt?.tipoOperacion === 'b2b_ecommerce' ? 'Compra B2B Liquidada' : receipt?.tipoOperacion === 'recurrente' ? 'Recurring Grant Activo' : 'Liquidación Exitosa'}
              </span>
              <h1 className="text-3xl font-black">¡Transacción Completada!</h1>
              <p className="text-xs text-emerald-100 max-w-md">
                Fondos entregados en tiempo real mediante el protocolo Interledger sin fricción bancaria.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="w-14 h-14 text-rose-300 mb-1" />
              <h1 className="text-2xl font-black">Error en la Transacción</h1>
              <p className="text-xs text-rose-100 max-w-md">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Cuerpo del Recibo */}
        {status === 'exito' && (
          <div className="p-8 space-y-6">
            
            {/* Resumen de Montos */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold">Concepto / Destino:</span>
                <span className="font-bold text-emerald-400">{receipt?.producerName || 'Productor Agroecológico'}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Débito Donante (EUR)</p>
                  <p className="text-2xl font-black text-white mt-0.5">
                    {formatearMonto(receipt?.debitAmount) || '€22.40 EUR'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Acreditado al Productor (COP)</p>
                  <p className="text-2xl font-black text-emerald-400 mt-0.5">
                    {formatearMonto(receipt?.receiveAmount) || '$100.000 COP'}
                  </p>
                </div>
              </div>

              {receipt?.tipoOperacion === 'recurrente' && (
                <div className="pt-2 border-t border-slate-800 text-xs flex items-center justify-between text-emerald-300">
                  <span className="flex items-center gap-1.5 font-bold">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Intervalo de Renovación:</span>
                  </span>
                  <span className="font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded">
                    {receipt.intervaloRecurrente || 'R/P1M (Mensual)'}
                  </span>
                </div>
              )}
            </div>

            {/* Metadatos de Auditoría Criptográfica */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Fecha y Hora:</span>
                <span className="font-bold text-slate-800">{fechaFormateada}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Protocolo de Red:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Interledger (Rafiki Node Testnet)</span>
                </span>
              </div>

              <div className="py-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">ID de Transacción ILP:</span>
                  <button 
                    onClick={copiarTxId} 
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? '¡Copiado!' : 'Copiar ID'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-700 break-all select-all">
                  {txId}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Comprobante Oficial</span>
              </button>

              <button
                onClick={() => router.push('/')}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al Ecosistema</span>
              </button>
            </div>

          </div>
        )}

        {/* Fallback en caso de error */}
        {status === 'error' && (
          <div className="p-8 text-center space-y-4">
            <p className="text-xs text-slate-500">
              Verifica que el nodo local o la testnet de Rafiki estén respondiendo y que el token GNAP no haya expirado.
            </p>
            <button
              onClick={() => router.push('/')}
              className="py-3 px-6 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white text-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Regresar al Inicio</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center gap-3 text-xs font-bold text-slate-700">
          <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
          <span>Cargando comprobante digital...</span>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
