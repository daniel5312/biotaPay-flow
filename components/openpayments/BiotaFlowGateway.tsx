'use client';

import { useState } from 'react';
import { iniciarDonacion } from '@/app/actions/biotaflow';
import { ShieldCheck, Zap, RefreshCw, ArrowRight, Lock } from 'lucide-react';

interface BiotaFlowGatewayProps {
  isOpen?: boolean;
  montoCOP: string;
  destinoNombre: string;
  tipoOperacion?: 'financiamiento' | 'recurrente' | 'b2b_ecommerce';
  onClose: () => void;
}

export default function BiotaFlowGateway({
  isOpen = true,
  montoCOP,
  destinoNombre,
  tipoOperacion: tipoInicial = 'financiamiento',
  onClose,
}: BiotaFlowGatewayProps) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Selector de Modalidad: Único vs Recurrente (Recurring Grant)
  const [modalidad, setModalidad] = useState<'unico' | 'recurrente'>(
    tipoInicial === 'recurrente' ? 'recurrente' : 'unico'
  );
  const [frecuencia, setFrecuencia] = useState<'mensual' | 'semanal'>('mensual');

  if (!isOpen) return null;

  const esB2B = tipoInicial === 'b2b_ecommerce';

  const procesarPago = async () => {
    setCargando(true);
    setError('');

    try {
      const tipoParaBackend = esB2B
        ? 'b2b_ecommerce'
        : modalidad === 'recurrente' ? 'recurrente' : 'financiamiento';

      const intervaloIso = frecuencia === 'mensual'
        ? 'R/2026-10-01T00:00:00Z/P1M'
        : 'R/2026-10-01T00:00:00Z/P1W';

      // Llamamos al Server Action con soporte para Pago Único, Recurrente o eCommerce B2B
      const respuesta = await iniciarDonacion(
        montoCOP,
        destinoNombre,
        tipoParaBackend,
        intervaloIso
      );

      if (respuesta.success && respuesta.interactionUrl) {
        // Redirigimos al donante/mayorista al servidor interactivo GNAP de Rafiki Testnet
        window.location.href = respuesta.interactionUrl;
      } else {
        setError(respuesta.error || 'No se pudo iniciar la transacción en la red Interledger');
        setCargando(false);
      }
    } catch (error: unknown) {
      console.error("Fallo capturado en el checkout", error);
      setError('Error de conexión con el nodo Rafiki / Open Payments');
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative border border-slate-100">

        {/* Cabecera estilo Stripe / Wompi ReFi */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>

          <div className="flex justify-center items-center gap-3 mb-1.5">
             <div className="w-10 h-10 bg-white text-emerald-700 rounded-2xl flex items-center justify-center font-black text-2xl shadow-md">
               B
             </div>
             <h2 className="text-2xl font-black tracking-tight">BiotaFlow</h2>
          </div>

          <p className="text-emerald-200 text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Open Payments · GNAP Interactive Consent</span>
          </p>
        </div>

        {/* Selector de Modalidad si no es compra B2B mayorista */}
        {!esB2B && (
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex gap-2">
            <button
              type="button"
              onClick={() => setModalidad('unico')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                modalidad === 'unico'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Aporte Único</span>
            </button>

            <button
              type="button"
              onClick={() => setModalidad('recurrente')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                modalidad === 'recurrente'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-200 animate-spin-slow" />
              <span>Recurring Grant</span>
            </button>
          </div>
        )}

        {/* Cuerpo del Checkout */}
        <div className="p-7 space-y-6">

          {/* Destino y Concepto */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
              {esB2B ? 'Lote Mayorista B2B a Liquidar' : 'Productor o Causa Receptora'}
            </span>
            <p className="text-base font-bold text-slate-800 mt-0.5 leading-snug">{destinoNombre}</p>
          </div>

          {/* Opciones de Frecuencia para Recurring Grants */}
          {modalidad === 'recurrente' && !esB2B && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Suscripción de Apoyo Continuo</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                  ISO 8601
                </span>
              </div>
              <p className="text-emerald-700 text-[11px] leading-relaxed">
                Autorizas un límite máximo de gasto que se renovará automáticamente cada ciclo sin solicitar tu firma repetida.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setFrecuencia('mensual')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    frecuencia === 'mensual'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-emerald-800 border border-emerald-200'
                  }`}
                >
                  Mensual (P1M)
                </button>
                <button
                  type="button"
                  onClick={() => setFrecuencia('semanal')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    frecuencia === 'semanal'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-emerald-800 border border-emerald-200'
                  }`}
                >
                  Semanal (P1W)
                </button>
              </div>
            </div>
          )}

          {/* Total a Pagar en COP */}
          <div className="pb-5 border-b border-slate-100 flex justify-between items-end">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                {modalidad === 'recurrente' ? 'Límite por Periodo (COP)' : 'Total a Pagar / Desembolsar'}
              </p>
              <p className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                ${Number(montoCOP || 0).toLocaleString("es-CO")} <span className="text-base text-slate-400 font-bold">COP</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Aprox. EUR</p>
              <p className="text-sm font-extrabold text-emerald-600">
                ≈ €{(Number(montoCOP || 0) / 4400).toFixed(2)} EUR
              </p>
            </div>
          </div>

          {/* Payment Pointer del Emisor (Donante o Mayorista en Rafiki) */}
          <div className="space-y-1.5">
            <label className="block text-xs text-slate-600 font-bold flex items-center justify-between">
              <span>Billetera Emisora (Payment Pointer)</span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" /> RFC 9421 Signed
              </span>
            </label>
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 px-3.5 py-2.5">
              <span className="text-base mr-2 opacity-60">💳</span>
              <input
                type="text"
                disabled
                value="$ilp.interledger-test.dev/225f757"
                className="w-full bg-transparent outline-none text-slate-700 font-mono text-xs font-semibold"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Cotización y liquidación en tiempo real por Interledger Rafiki Testnet
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          {/* Botón de Ejecución del Grant Interactivo */}
          <button
            onClick={procesarPago}
            disabled={cargando}
            className={`w-full py-4 rounded-2xl font-black text-white transition-all shadow-lg text-base flex items-center justify-center gap-2 cursor-pointer
              ${cargando
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-600/30 hover:-translate-y-0.5"}`}
          >
            {cargando ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Negociando Grant GNAP...</span>
              </>
            ) : (
              <>
                <span>
                  {esB2B
                    ? 'Comprar Lote con Open Payments'
                    : modalidad === 'recurrente'
                      ? 'Autorizar Suscripción Recurrente'
                      : 'Autorizar Financiación (1-Clic)'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Footer Seguro con Co-Branding */}
        <div className="bg-slate-50 px-6 py-4 text-center border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Interledger Protocol (ILP)</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">GNAP RFC 9421</span>
        </div>

      </div>
    </div>
  );
}
