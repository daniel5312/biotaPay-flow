'use client';

import { useState } from 'react';
import Image from 'next/image';
import BiotaFlowGateway from '@/components/openpayments/BiotaFlowGateway';
import { 
  Sprout, 
  TrendingUp, 
  ShoppingBag, 
  Split, 
  ArrowRight, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  MapPin,
  Layers,
  Award,
  Sun,
  Moon,
  Languages,
  X,
  Compass,
  DollarSign
} from 'lucide-react';

// ==========================================
// TIPOS DE DATOS DETALLADOS (METADATOS REFI)
// ==========================================

interface ProductorDetalle {
  id: string;
  nombre: string;
  finca: string;
  vereda: string;
  municipio: string;
  departamento: string;
  coordenadas: string;
  altitudMsnm: number;
  categoria: 'cafe' | 'cacao' | 'frutas' | 'ganaderia_regenerativa';
  productoPrincipal: string;
  variedades: string[];
  areaTotalHectareas: number;
  areaCultivoHectareas: number;
  tipoProduccion: string;
  sombraPorcentaje: number;
  fuenteAgua: string;
  metaCOP: number;
  recaudadoCOP: number;
  retornoROI: number;
  plazoMeses: number;
  paymentPointer: string;
  fotoFinca: string;
  fotoProductor: string;
  fotoProducto: string;
  avatar: string;
  estado: 'abierto' | 'financiado' | 'cosechado';
  descripcionEs: string;
  descripcionEn: string;
  usoFondosEs: string[];
  usoFondosEn: string[];
  metricasImpacto: {
    arbolesSembrados: number;
    capturaCO2Ton: number;
    familiasBeneficiadas: number;
    biodiversidadIndice: string;
  };
}

interface LoteEcommerce {
  id: string;
  tituloEs: string;
  tituloEn: string;
  productorOriginal: string;
  financiadorOriginal: string;
  categoria: string;
  variedad: string;
  puntajeSCA?: number;
  certificacion: string;
  pesoKg: number;
  precioEUR: number;
  precioCOP: number;
  rendimientoFinanciadorEUR: number;
  pagoNetoProductorCOP: number;
  fotoLote: string;
  origen: string;
  estado: 'disponible' | 'vendido';
}

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<'es' | 'en'>('es');

  const [tabActiva, setTabActiva] = useState<'financiador' | 'campesino' | 'mayorista' | 'split'>('financiador');

  const [modalOpen, setModalOpen] = useState(false);
  const [montoCheckoutCOP, setMontoCheckoutCOP] = useState('50000');
  const [destinoCheckoutNombre, setDestinoCheckoutNombre] = useState('Don Pedro - Café Agroforestal Boyacá');
  const [tipoOperacionCheckout, setTipoOperacionCheckout] = useState<'financiamiento' | 'recurrente' | 'b2b_ecommerce'>('financiamiento');

  const [productorSeleccionado, setProductorSeleccionado] = useState<ProductorDetalle | null>(null);

  const [splitSimulado, setSplitSimulado] = useState(false);

  const productoresData: ProductorDetalle[] = [
    {
      id: 'proj-1',
      nombre: 'Don Pedro Pablo Gil',
      finca: 'Finca El Roble Ancestral',
      vereda: 'Vereda La Colorada',
      municipio: 'Villa de Leyva',
      departamento: 'Boyacá, Colombia',
      coordenadas: '5.6322° N, 73.5244° W',
      altitudMsnm: 1780,
      categoria: 'cafe',
      productoPrincipal: 'Café Especial Bajo Sombra de Guamos y Robles',
      variedades: ['Geisha 100% Arábica', 'Borbón Rosado'],
      areaTotalHectareas: 4.5,
      areaCultivoHectareas: 3.2,
      tipoProduccion: 'Agroforestería Regenerativa y Abono Bocashi',
      sombraPorcentaje: 65,
      fuenteAgua: 'Nacimiento protegido Quebrada Honda',
      metaCOP: 8000000,
      recaudadoCOP: 5400000,
      retornoROI: 14.5,
      plazoMeses: 5,
      paymentPointer: '$ilp.interledger-test.dev/pagos-entrada',
      avatar: '🌱',
      fotoFinca: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
      fotoProductor: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=400&q=80',
      fotoProducto: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80',
      estado: 'abierto',
      descripcionEs: 'Apalancamiento para adquisición de biopreparados, enmiendas orgánicas y pago de 24 jornales de desyerbe manual sin glifosato para renovación de cafetales bajo dosel forestal.',
      descripcionEn: 'Pre-financing for organic bio-preparations, compost amendments, and 24 manual weeding workdays without glyphosate to regenerate shade-grown specialty coffee lots.',
      usoFondosEs: [
        'Adquisición de 4 toneladas de compost orgánico y harina de rocas ($2.800.000 COP)',
        'Pago de jornales campesinos justos a mujeres recolectoras ($3.200.000 COP)',
        'Mantenimiento de secaderos parabólicos solares ($2.000.000 COP)'
      ],
      usoFondosEn: [
        '4 tons of organic compost & rock dust minerals ($2.800.000 COP)',
        'Fair wage workdays for local women harvest teams ($3.200.000 COP)',
        'Maintenance of solar parabolic drying beds ($2.000.000 COP)'
      ],
      metricasImpacto: {
        arbolesSembrados: 420,
        capturaCO2Ton: 18.5,
        familiasBeneficiadas: 3,
        biodiversidadIndice: 'Alta (24 aves nativas avistadas)'
      }
    },
    {
      id: 'proj-2',
      nombre: 'Coop. Mujeres Cacaoteras del Catatumbo',
      finca: 'Parcela Comunitaria La Esperanza',
      vereda: 'Vereda Campo Dos',
      municipio: 'Tibú',
      departamento: 'Norte de Santander, Colombia',
      coordenadas: '8.6389° N, 72.7358° W',
      altitudMsnm: 420,
      categoria: 'cacao',
      productoPrincipal: 'Cacao Fino de Aroma de Paz',
      variedades: ['Criollo Nativo', 'Trinitario', 'CCN-51'],
      areaTotalHectareas: 12.0,
      areaCultivoHectareas: 8.5,
      tipoProduccion: 'Sistemas Agroforestales con Plátano y Maderables',
      sombraPorcentaje: 50,
      fuenteAgua: 'Río Tibú (Ronda hídrica reforestada)',
      metaCOP: 12000000,
      recaudadoCOP: 12000000,
      retornoROI: 16.0,
      plazoMeses: 6,
      paymentPointer: '$ilp.interledger-test.dev/coop-cacao',
      avatar: '🍫',
      fotoFinca: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80',
      fotoProductor: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      fotoProducto: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=600&q=80',
      estado: 'financiado',
      descripcionEs: 'Proyecto modelo de sustitución pacífica de economías ilícitas por cacao fino de aroma. Financiamiento de cajones de fermentación en madera laurel y marquesinas con termómetros digitales.',
      descripcionEn: 'Model peace-building project substituting illicit crops with fine flavor aroma cacao. Financed laurel-wood fermentation boxes and digital temperature drying canopies.',
      usoFondosEs: [
        'Construcción de 6 cajones de fermentación en cascada ($4.500.000 COP)',
        'Capacitación técnica en perfiles de taza de cacao ($3.000.000 COP)',
        'Capital rotatorio para pago anticipado a 18 madres cabeza de hogar ($4.500.000 COP)'
      ],
      usoFondosEn: [
        'Construction of 6 cascade fermentation wood boxes ($4.500.000 COP)',
        'Technical training in cacao sensory cup profiles ($3.000.000 COP)',
        'Revolving fund for cash advance to 18 female heads of household ($4.500.000 COP)'
      ],
      metricasImpacto: {
        arbolesSembrados: 1250,
        capturaCO2Ton: 45.0,
        familiasBeneficiadas: 18,
        biodiversidadIndice: 'Restauración corredor biológico'
      }
    },
    {
      id: 'proj-3',
      nombre: 'Don Hernando & Familia (Ganadería Regenerativa)',
      finca: 'Reserva El Samán',
      vereda: 'Vereda El Totumo',
      municipio: 'Puerto Boyacá',
      departamento: 'Magdalena Medio, Colombia',
      coordenadas: '5.9758° N, 74.5886° W',
      altitudMsnm: 145,
      categoria: 'ganaderia_regenerativa',
      productoPrincipal: 'Carne y Lácteos Regenerativos de Pastoreo Racional Voisin (PRV)',
      variedades: ['Bovinos Criollo Sanmartinero & Blanco Orejinegro (BON)'],
      areaTotalHectareas: 25.0,
      areaCultivoHectareas: 20.0,
      tipoProduccion: 'Silvopastoreo Intensivo con Cercas Vivas y Botón de Oro',
      sombraPorcentaje: 40,
      fuenteAgua: 'Aljibes solares con bebederos móviles',
      metaCOP: 15000000,
      recaudadoCOP: 7500000,
      retornoROI: 15.0,
      plazoMeses: 7,
      paymentPointer: '$ilp.interledger-test.dev/el-saman',
      avatar: '🐄',
      fotoFinca: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80',
      fotoProductor: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      fotoProducto: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80',
      estado: 'abierto',
      descripcionEs: 'Transición de ganadería extensiva tradicional a pastoreo silvopastoril con 54 potreros rotacionales. Permite infiltrar agua, cero ivermectinas y regenerar suelos degradados.',
      descripcionEn: 'Transition from traditional cattle ranching to intensive silvopastoral Voisin grazing across 54 rotational paddocks. Soil regeneration, zero ivermectins, and solar mobile water troughs.',
      usoFondosEs: [
        'Cercas eléctricas solares móviles de alta eficiencia ($5.500.000 COP)',
        'Siembra de 3.000 árboles forrajeros de Matarratón y Botón de Oro ($4.500.000 COP)',
        'Líneas de conducción de agua a potreros con bomba solar ($5.000.000 COP)'
      ],
      usoFondosEn: [
        'Mobile high-efficiency solar electric fences ($5.500.000 COP)',
        'Planting 3,000 native fodder trees for cattle forage ($4.500.000 COP)',
        'Solar powered water pipeline network to all paddocks ($5.000.000 COP)'
      ],
      metricasImpacto: {
        arbolesSembrados: 3000,
        capturaCO2Ton: 82.0,
        familiasBeneficiadas: 5,
        biodiversidadIndice: 'Suelo vivo (incremento 3.2% M.O.)'
      }
    },
    {
      id: 'proj-4',
      nombre: 'Doña Elena & Huerta Agroecológica',
      finca: 'Finca Los Cítricos y Frutales',
      vereda: 'Vereda Minca Alta',
      municipio: 'Santa Marta',
      departamento: 'Sierra Nevada de Santa Marta, Colombia',
      coordenadas: '11.1444° N, 74.1189° W',
      altitudMsnm: 850,
      categoria: 'frutas',
      productoPrincipal: 'Aguacate Hass & Maracuyá Orgánico de Exportación',
      variedades: ['Aguacate Hass', 'Maracuyá Morado', 'Mandarina Oneco'],
      areaTotalHectareas: 3.5,
      areaCultivoHectareas: 2.8,
      tipoProduccion: 'Agricultura Biodinámica con Microorganismos Nativos de Montaña',
      sombraPorcentaje: 35,
      fuenteAgua: 'Río Gaira (Captación por gravedad)',
      metaCOP: 6500000,
      recaudadoCOP: 2100000,
      retornoROI: 13.5,
      plazoMeses: 4,
      paymentPointer: '$ilp.interledger-test.dev/elena-sierra',
      avatar: '🥑',
      fotoFinca: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80',
      fotoProductor: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      fotoProducto: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80',
      estado: 'abierto',
      descripcionEs: 'Cosecha escalonada de aguacate orgánico sin pesticidas de síntesis química. Implementación de bioles foliares para exportación a tostadurías y tiendas saludables europeas.',
      descripcionEn: 'Staggered harvest of organic avocado and passion fruit without synthetic pesticides. Mountain microorganism foliar bio-fertilizers for European ethical markets.',
      usoFondosEs: [
        'Tanques biodigestores para purines y microorganismos de montaña ($2.200.000 COP)',
        'Mallas y canastillas de cosecha certificada BPA ($1.800.000 COP)',
        'Jornales de cosecha y selección en finca ($2.500.000 COP)'
      ],
      usoFondosEn: [
        'Bio-digester tanks for mountain microorganisms ($2.200.000 COP)',
        'Certified BPA harvest crates and transport netting ($1.800.000 COP)',
        'Farm harvest labor and quality grading wages ($2.500.000 COP)'
      ],
      metricasImpacto: {
        arbolesSembrados: 650,
        capturaCO2Ton: 22.0,
        familiasBeneficiadas: 2,
        biodiversidadIndice: 'Polinizadores (12 colmenas Meliponas)'
      }
    }
  ];

  const lotesMarketplace: LoteEcommerce[] = [
    {
      id: 'lote-101',
      tituloEs: 'Micro-Lote Geisha 86.5 SCA - Finca El Roble',
      tituloEn: 'Micro-Lot Geisha 86.5 SCA - El Roble Estate',
      productorOriginal: 'Don Pedro Pablo Gil (Boyacá)',
      financiadorOriginal: 'Sarah Lindemann (Múnich, DE)',
      categoria: 'Café Especial',
      variedad: 'Geisha Lavado',
      puntajeSCA: 86.5,
      certificacion: 'Agroforestería Regenerativa',
      pesoKg: 350,
      precioEUR: 2800,
      precioCOP: 12320000,
      rendimientoFinanciadorEUR: 1150,
      pagoNetoProductorCOP: 7260000,
      fotoLote: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80',
      origen: 'Villa de Leyva, Boyacá (1.780 msnm)',
      estado: 'disponible'
    },
    {
      id: 'lote-102',
      tituloEs: 'Lote Cacao Fino de Aroma 70% Fermentación Controlada',
      tituloEn: 'Fine Flavor Cacao 70% Controlled Fermentation Lot',
      productorOriginal: 'Coop. Mujeres del Catatumbo',
      financiadorOriginal: 'GreenCapital ReFi Pool (Zúrich, CH)',
      categoria: 'Cacao Gourmet',
      variedad: 'Criollo & Trinitario de Paz',
      puntajeSCA: 88.0,
      certificacion: 'Comercio Justo Directo',
      pesoKg: 500,
      precioEUR: 4100,
      precioCOP: 18040000,
      rendimientoFinanciadorEUR: 2320,
      pagoNetoProductorCOP: 7850000,
      fotoLote: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
      origen: 'Tibú, Norte de Santander (420 msnm)',
      estado: 'disponible'
    },
    {
      id: 'lote-103',
      tituloEs: 'Contenedor Pallet Aguacate Hass Orgánico Certificado',
      tituloEn: 'Pallet Container Certified Organic Hass Avocado',
      productorOriginal: 'Doña Elena & Familia (Sierra Nevada)',
      financiadorOriginal: 'BioFund Impact BV (Ámsterdam, NL)',
      categoria: 'Frutas Frescas',
      variedad: 'Hass Calibre 16-18',
      certificacion: 'GlobalG.A.P. & Rainforest',
      pesoKg: 800,
      precioEUR: 3200,
      precioCOP: 14080000,
      rendimientoFinanciadorEUR: 1540,
      pagoNetoProductorCOP: 8120000,
      fotoLote: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80',
      origen: 'Minca, Sierra Nevada de Santa Marta (850 msnm)',
      estado: 'disponible'
    }
  ];

  const abrirCheckoutUniversal = (
    montoCOPStr: string, 
    nombreDestino: string, 
    tipo: 'financiamiento' | 'recurrente' | 'b2b_ecommerce' = 'financiamiento'
  ) => {
    setMontoCheckoutCOP(montoCOPStr);
    setDestinoCheckoutNombre(nombreDestino);
    setTipoOperacionCheckout(tipo);
    setModalOpen(true);
  };

  const t = {
    es: {
      tagline: 'Ecosistema Agro-Financiero Open Payments (ILP / GNAP)',
      tabFinanciador: '1. Financiador Global',
      tabCampesino: '2. Campesino / Parcela',
      tabMayorista: '3. Mercado B2B',
      tabSplit: '4. Reparto (Split ILP)',
      checkoutBtn: 'Checkout Testnet',
      fase1Badge: 'Fase 1: Pre-Financiación de Cosechas',
      heroTitle1: 'Invierte en Campesinos Colombianos con ',
      heroTitle2: 'Open Payments',
      heroDesc: 'Conecta tu capital global en EUR/USD directamente a productores de café, cacao, frutas y ganadería regenerativa. Liquidación instantánea en COP vía Interledger Protocol (ILP) sin intermediarios bancarios predatorios. Retorno automático de capital + ROI al venderse el lote en el mercado B2B.',
      abiertosTitle: 'Proyectos y Fincas Listas para Apalancar',
      verDetalle: 'Ver Ficha y Metadatos de la Parcela',
      apalancarBtn: 'Apalancar con Open Payments',
      metaAlcanzada: 'Meta Alcanzada (En Producción)',
      retornoEst: 'Retorno Est.',
      plazo: 'Plazo Cosecha',
      progreso: 'Progreso',
      meta: 'Meta',
      panelProductor: 'Panel del Productor: Don Pedro Pablo Gil',
      desembolsado: 'Desembolsado en tu cuenta (COP)',
      metaRestante: 'Fondo restante para meta',
      estadoCultivo: 'Estado del Cultivo',
      historialPagos: 'Registro de Pagos Transfronterizos Recibidos (ILP Incoming Payments)',
      catB2B: 'Catálogo Mayorista: Café, Cacao y Frutas de Especialidad',
      catDesc: 'Lotes cosechados directamente de parcelas pre-financiadas. Compra ética B2B con liquidación instantánea por Open Payments.',
      comprarLote: 'Comprar Lote con Open Payments',
      splitterTitle: 'El Payment Splitter Atómico de Open Payments',
      splitterDesc: 'Un solo pago comercial del comprador mayorista en EUR se dispersa automáticamente en tiempo real entre el financiador europeo (EUR) y el campesino colombiano (COP).',
      simularSplit: 'Simular Ejecución de Split ILP',
      reiniciarSplit: 'Reiniciar Demostración',
      pagoB2BEmitido: 'Total Pagado por Mayorista (Ámsterdam): €2.800 EUR',
      retornoFinanciador: 'Retorno Financiador',
      margenCampesino: 'Margen Neto Campesino',
      splitExitoso: 'Split ILP Ejecutado con Éxito: Ambas billeteras recibieron los fondos en sus respectivas divisas sin demoras SWIFT.'
    },
    en: {
      tagline: 'Open Payments Agro-Finance Ecosystem (ILP / GNAP)',
      tabFinanciador: '1. Global Backer',
      tabCampesino: '2. Farmer / Farmstead',
      tabMayorista: '3. B2B Market',
      tabSplit: '4. Split Payout (ILP)',
      checkoutBtn: 'Testnet Checkout',
      fase1Badge: 'Phase 1: Harvest Pre-Financing',
      heroTitle1: 'Invest in Colombian Farmers via ',
      heroTitle2: 'Open Payments',
      heroDesc: 'Direct your global EUR/USD capital straight to regenerative coffee, cacao, fruit, and rotational cattle producers. Instant COP settlement through Interledger Protocol without predatory SWIFT fees. Automated return of capital + ROI upon B2B harvest wholesale sales.',
      abiertosTitle: 'Verified Farms & Projects Ready for Financing',
      verDetalle: 'View Farm Metadata & Deep Dive',
      apalancarBtn: 'Back with Open Payments',
      metaAlcanzada: 'Target Reached (In Production)',
      retornoEst: 'Est. Return',
      plazo: 'Harvest Term',
      progreso: 'Progress',
      meta: 'Target',
      panelProductor: 'Producer Dashboard: Don Pedro Pablo Gil',
      desembolsado: 'Settled to your account (COP)',
      metaRestante: 'Remaining to reach target',
      estadoCultivo: 'Crop Biological Stage',
      historialPagos: 'Cross-Border Payments Received (ILP Incoming Payments)',
      catB2B: 'Wholesale Catalog: Specialty Coffee, Cacao & Exotic Fruits',
      catDesc: 'Harvest lots sourced directly from pre-financed family farms. Direct B2B ethical trade with instant Open Payments settlement.',
      comprarLote: 'Buy Lot with Open Payments',
      splitterTitle: 'Atomic Payment Splitter via Open Payments',
      splitterDesc: 'A single B2B wholesale settlement in EUR automatically splits in real time between the European backer (EUR) and the Colombian farmer (COP).',
      simularSplit: 'Simulate ILP Split Execution',
      reiniciarSplit: 'Reset Demonstration',
      pagoB2BEmitido: 'Total Paid by Wholesaler (Amsterdam): €2.800 EUR',
      retornoFinanciador: 'Backer Principal + ROI',
      margenCampesino: 'Farmer Net Cash Margin',
      splitExitoso: 'ILP Split Successfully Settled: Both wallets received settlement in their native currency with zero SWIFT friction.'
    }
  }[lang];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* 1. APP SHELL NAVBAR SUPERIOR */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isDark 
          ? 'bg-slate-900/90 border-slate-800 text-white' 
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-md shadow-emerald-500/20">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight">Biota<span className="text-emerald-500">Flow</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  ILP / GNAP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {t.tagline}
              </p>
            </div>
          </div>

          <nav className={`flex items-center p-1 rounded-xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setTabActiva('financiador')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tabActiva === 'financiador'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.tabFinanciador}</span>
              <span className="md:hidden">1</span>
            </button>

            <button
              onClick={() => setTabActiva('campesino')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tabActiva === 'campesino'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.tabCampesino}</span>
              <span className="md:hidden">2</span>
            </button>

            <button
              onClick={() => setTabActiva('mayorista')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tabActiva === 'mayorista'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.tabMayorista}</span>
              <span className="md:hidden">3</span>
            </button>

            <button
              onClick={() => setTabActiva('split')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tabActiva === 'split'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.tabSplit}</span>
              <span className="md:hidden">4</span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              title={isDark ? 'Modo Día' : 'Modo Noche'}
              className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              title="Cambiar Idioma / Switch Language"
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang.toUpperCase()}</span>
            </button>

            <button
              onClick={() => abrirCheckoutUniversal('100000', 'Don Pedro - Café Agroforestal Boyacá', 'financiamiento')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t.checkoutBtn}</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. SUB-BARRA DE ESTADO DEL PROTOCOLO */}
      <div className={`border-b py-2.5 px-4 sm:px-6 transition-colors ${
        isDark ? 'bg-slate-900/40 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">Testnet:</span> Rafiki ILP Node
            <span className="opacity-40">|</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">Rate:</span> 1 EUR ≈ 4.400 COP
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium opacity-90">
            <span>🇪🇺 <strong>EUR (Global)</strong> ➔ 🇨🇴 <strong>COP (Boyacá/Sierra)</strong> ➔ 🇳🇱 <strong>EUR B2B (Ámsterdam)</strong></span>
          </div>
        </div>
      </div>

      {/* 3. CONTENIDO PRINCIPAL POR ROL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* VISTA 1: FINANCIADOR GLOBAL */}
        {tabActiva === 'financiador' && (
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-500/20 text-white relative overflow-hidden shadow-xl">
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.fase1Badge}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black">
                  {t.heroTitle1}<span className="text-emerald-400">{t.heroTitle2}</span>
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {t.heroDesc}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-500" />
                  <span>{t.abiertosTitle}</span>
                </h2>
                <span className="text-xs text-slate-500">4 parcelas campesinas auditadas</span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {productoresData.map((p) => {
                  const porcentaje = Math.min(100, Math.round((p.recaudadoCOP / p.metaCOP) * 100));
                  const esFinanciado = p.estado === 'financiado';

                  return (
                    <div 
                      key={p.id}
                      className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between shadow-lg group"
                    >
                      <div className="space-y-3.5">
                        <div className="relative h-36 rounded-xl overflow-hidden bg-slate-800">
                          <Image unoptimized 
                            src={p.fotoFinca} 
                            alt={p.finca}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <span className="absolute top-2 left-2 text-2xl drop-shadow-md">{p.avatar}</span>
                          <span className={`absolute top-2 right-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            esFinanciado 
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          }`}>
                            {p.estado}
                          </span>
                          <div className="absolute bottom-2 left-2 right-2 text-xs">
                            <p className="font-extrabold text-white text-sm truncate">{p.nombre}</p>
                            <p className="text-slate-300 text-[11px] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{p.municipio}, {p.departamento}</span>
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-emerald-400 truncate">{p.productoPrincipal}</p>
                          <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                            {lang === 'es' ? p.descripcionEs : p.descripcionEn}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold">{t.retornoEst}</span>
                            <p className="text-emerald-400 font-extrabold text-sm">+{p.retornoROI}% ROI</p>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold">{t.plazo}</span>
                            <p className="text-slate-200 font-bold text-sm flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {p.plazoMeses} m
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">{t.progreso}:</span>
                            <span className="font-bold text-slate-200">{porcentaje}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${esFinanciado ? 'bg-blue-500' : 'bg-emerald-500'}`}
                              style={{ width: `${porcentaje}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                            <span>${(p.recaudadoCOP / 1000000).toFixed(1)}M</span>
                            <span>{t.meta}: ${(p.metaCOP / 1000000).toFixed(1)}M</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        <button
                          onClick={() => setProductorSeleccionado(p)}
                          className="w-full py-2 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{t.verDetalle}</span>
                        </button>

                        {esFinanciado ? (
                          <button
                            disabled
                            className="w-full py-2.5 rounded-xl font-bold bg-slate-800 text-slate-500 text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{t.metaAlcanzada}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => abrirCheckoutUniversal('100000', `${p.nombre} - ${p.finca}`, 'financiamiento')}
                            className="w-full py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>{t.apalancarBtn}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VISTA 2: CAMPESINO / PRODUCTOR */}
        {tabActiva === 'campesino' && (
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-teal-950/90 via-slate-900 to-slate-900 border border-teal-500/20 text-white shadow-xl">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs font-semibold">
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Fase 2: Monitoreo & Cuenta Receptora</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black">
                  {t.panelProductor}
                </h1>
                <p className="text-slate-300 text-sm">
                  Finca El Roble Ancestral · Villa de Leyva, Boyacá · Payment Pointer vinculado: <code className="text-emerald-400 bg-slate-950 px-2 py-0.5 rounded text-xs">$ilp.interledger-test.dev/pagos-entrada</code>
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-lg">
                <p className="text-xs text-slate-400 uppercase font-bold">{t.desembolsado}</p>
                <p className="text-3xl font-black text-emerald-400 mt-2">$5.400.000 <span className="text-sm text-slate-400 font-semibold">COP</span></p>
                <p className="text-[11px] text-slate-500 mt-1">Recibido en tiempo real vía Interledger</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-lg">
                <p className="text-xs text-slate-400 uppercase font-bold">{t.metaRestante}</p>
                <p className="text-3xl font-black text-white mt-2">$2.600.000 <span className="text-sm text-slate-400 font-semibold">COP</span></p>
                <p className="text-[11px] text-slate-500 mt-1">Meta total: $8.000.000 COP</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-lg">
                <p className="text-xs text-slate-400 uppercase font-bold">{t.estadoCultivo}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <p className="text-xl font-bold text-white">Etapa de Maduración</p>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Cosecha estimada en 60 días (350 kg)</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-lg">
              <h3 className="text-base font-bold mb-4">{t.historialPagos}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase">
                    <tr>
                      <th className="pb-3">Fecha</th>
                      <th className="pb-3">Financiador</th>
                      <th className="pb-3">Moneda Origen</th>
                      <th className="pb-3">Monto Liquidado (COP)</th>
                      <th className="pb-3">Hash ILP</th>
                      <th className="pb-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-3 font-medium">Hoy, 15:30</td>
                      <td>Sarah Lindemann (Alemania)</td>
                      <td className="text-emerald-400">€22.40 EUR</td>
                      <td className="font-bold text-white">$100.000 COP</td>
                      <td className="font-mono text-[11px] text-slate-500">ilp-tx-9941a8...</td>
                      <td><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Liquidado</span></td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium">Ayer, 09:15</td>
                      <td>GreenCapital ReFi Pool (Suiza)</td>
                      <td className="text-emerald-400">€560.00 EUR</td>
                      <td className="font-bold text-white">$2.500.000 COP</td>
                      <td className="font-mono text-[11px] text-slate-500">ilp-tx-7712bc...</td>
                      <td><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Liquidado</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 3: MERCADO B2B E-COMMERCE */}
        {tabActiva === 'mayorista' && (
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-950/90 via-slate-900 to-slate-900 border border-blue-500/20 text-white shadow-xl">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Fase 3: Marketplace B2B & Exportación Directa</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black">
                  {t.catB2B}
                </h1>
                <p className="text-slate-300 text-sm">
                  {t.catDesc}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {lotesMarketplace.map((lote) => (
                <div key={lote.id} className="rounded-3xl bg-slate-900 text-white border border-slate-800 overflow-hidden flex flex-col justify-between shadow-xl">
                  
                  <div className="relative h-48 bg-slate-800">
                    <Image unoptimized 
                      src={lote.fotoLote} 
                      alt={lote.tituloEs}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-md">
                      {lote.categoria}
                    </span>
                    {lote.puntajeSCA && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs">
                        ⭐ {lote.puntajeSCA} SCA
                      </span>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{lote.variedad} · {lote.pesoKg} Kg</span>
                      <h3 className="text-lg font-bold text-white mt-1 leading-snug">
                        {lang === 'es' ? lote.tituloEs : lote.tituloEn}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">{lote.origen}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cultivado por:</span>
                        <span className="font-semibold text-white">{lote.productorOriginal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pre-financiado por:</span>
                        <span className="font-semibold text-emerald-400">{lote.financiadorOriginal}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-baseline justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Precio del Lote B2B</p>
                        <p className="text-2xl font-black text-white">€{lote.precioEUR.toLocaleString()} <span className="text-xs font-semibold text-slate-400">EUR</span></p>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">≈ ${(lote.precioCOP / 1000000).toFixed(2)}M COP</p>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-950/60 border-t border-slate-800">
                    <button
                      onClick={() => abrirCheckoutUniversal(
                        lote.precioCOP.toString(),
                        `Compra Lote B2B: ${lang === 'es' ? lote.tituloEs : lote.tituloEn}`,
                        'b2b_ecommerce'
                      )}
                      className="w-full py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t.comprarLote}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA 4: REPARTO AUTOMÁTICO (SPLIT) */}
        {tabActiva === 'split' && (
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-slate-900 border border-cyan-500/20 text-white shadow-xl">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                  <Split className="w-3.5 h-3.5" />
                  <span>Fase 4: Liquidación & Retorno de Ganancias</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black">
                  {t.splitterTitle}
                </h1>
                <p className="text-slate-300 text-sm">
                  {t.splitterDesc}
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold">Transacción B2B: Lote Geisha Finca El Roble</h3>
                  <p className="text-xs text-slate-400">{t.pagoB2BEmitido}</p>
                </div>

                <button
                  onClick={() => setSplitSimulado(!splitSimulado)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer ${
                    splitSimulado 
                      ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30' 
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>{splitSimulado ? t.reiniciarSplit : t.simularSplit}</span>
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6 relative">
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Entrada de Fondos</span>
                    <h4 className="text-base font-bold text-white mt-1">Mayorista (Ámsterdam)</h4>
                    <p className="text-xs text-slate-400 mt-2">Billetera Rafiki Europa</p>
                  </div>
                  <div className="pt-4 border-t border-slate-800/80">
                    <p className="text-2xl font-black text-cyan-400">€2.800 EUR</p>
                    <p className="text-[11px] text-slate-500">Pago comercial único B2B</p>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl transition-all border ${
                  splitSimulado 
                    ? 'bg-emerald-950/20 border-emerald-500 shadow-xl shadow-emerald-500/10' 
                    : 'bg-slate-950 border-slate-800'
                } flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{t.retornoFinanciador}</span>
                      {splitSimulado && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <h4 className="text-base font-bold text-white mt-1">Sarah Lindemann (Alemania)</h4>
                    <p className="text-xs text-slate-400 mt-1">Capital inicial (€1.000) + 15% ROI</p>
                  </div>
                  <div className="pt-4 border-t border-slate-800/80">
                    <p className="text-2xl font-black text-emerald-400">€1.150 EUR</p>
                    <p className="text-[11px] text-slate-500">Enviado a Payment Pointer EUR</p>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl transition-all border ${
                  splitSimulado 
                    ? 'bg-teal-950/20 border-teal-500 shadow-xl shadow-teal-500/10' 
                    : 'bg-slate-950 border-slate-800'
                } flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">{t.margenCampesino}</span>
                      {splitSimulado && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                    </div>
                    <h4 className="text-base font-bold text-white mt-1">Don Pedro (Boyacá)</h4>
                    <p className="text-xs text-slate-400 mt-1">Ganancia neta por la cosecha</p>
                  </div>
                  <div className="pt-4 border-t border-slate-800/80">
                    <p className="text-2xl font-black text-teal-400">$7.260.000 COP</p>
                    <p className="text-[11px] text-slate-500">Liquidado en tiempo real en COP</p>
                  </div>
                </div>
              </div>

              {splitSimulado && (
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span><strong>{t.splitExitoso}</strong></span>
                  </div>
                  <span className="font-mono text-[11px] text-cyan-400 hidden sm:inline">Hash: ilp-split-89b2c...</span>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* MODAL DE METADATOS Y DETALLE COMPLETO DEL PRODUCTOR */}
      {productorSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 text-white w-full max-w-3xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-8 relative">
            
            <div className="relative h-56 bg-slate-800">
              <Image unoptimized 
                src={productorSeleccionado.fotoFinca} 
                alt={productorSeleccionado.finca}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <button 
                onClick={() => setProductorSeleccionado(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {productorSeleccionado.finca}
                  </span>
                  <h2 className="text-2xl font-black text-white mt-1">{productorSeleccionado.nombre}</h2>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{productorSeleccionado.vereda}, {productorSeleccionado.municipio}, {productorSeleccionado.departamento}</span>
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Retorno Estimado</p>
                  <p className="text-2xl font-black text-emerald-400">+{productorSeleccionado.retornoROI}% ROI</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Compass className="w-3 h-3 text-emerald-400" /> Coordenadas
                  </span>
                  <p className="font-mono text-white mt-1 text-[11px]">{productorSeleccionado.coordenadas}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Layers className="w-3 h-3 text-teal-400" /> Altitud
                  </span>
                  <p className="font-bold text-white mt-1">{productorSeleccionado.altitudMsnm} msnm</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Sprout className="w-3 h-3 text-cyan-400" /> Área Cultivo
                  </span>
                  <p className="font-bold text-white mt-1">{productorSeleccionado.areaCultivoHectareas} Ha (de {productorSeleccionado.areaTotalHectareas} Ha)</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" /> Cobertura Sombra
                  </span>
                  <p className="font-bold text-white mt-1">{productorSeleccionado.sombraPorcentaje}% Dosel</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <p className="text-slate-400 uppercase font-bold text-[10px]">Modelo Agroecológico de Producción:</p>
                <p className="text-white font-semibold text-sm">{productorSeleccionado.tipoProduccion}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {productorSeleccionado.variedades.map((v, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium">
                      {v}
                    </span>
                  ))}
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px] font-medium">
                    💧 {productorSeleccionado.fuenteAgua}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Desglose Auditado del Uso del Financiamiento:</span>
                </h4>
                <div className="space-y-2 text-xs">
                  {(lang === 'es' ? productorSeleccionado.usoFondosEs : productorSeleccionado.usoFondosEn).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 grid sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-emerald-400 text-[10px] uppercase font-bold">Árboles Restaurados</span>
                  <p className="text-lg font-black text-white mt-0.5">{productorSeleccionado.metricasImpacto.arbolesSembrados} árboles</p>
                </div>
                <div>
                  <span className="text-teal-400 text-[10px] uppercase font-bold">Captura Estimada CO2</span>
                  <p className="text-lg font-black text-white mt-0.5">{productorSeleccionado.metricasImpacto.capturaCO2Ton} Toneladas</p>
                </div>
                <div>
                  <span className="text-cyan-400 text-[10px] uppercase font-bold">Biodiversidad</span>
                  <p className="text-xs font-semibold text-white mt-0.5">{productorSeleccionado.metricasImpacto.biodiversidadIndice}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Payment Pointer (Open Payments ILP)</p>
                  <code className="text-emerald-400 font-mono text-xs">{productorSeleccionado.paymentPointer}</code>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold">
                  Verificado
                </span>
              </div>
            </div>

            <div className="p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                onClick={() => setProductorSeleccionado(null)}
                className="px-4 py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
              >
                Cerrar Ficha
              </button>

              <button
                onClick={() => {
                  const nombre = `${productorSeleccionado.nombre} - ${productorSeleccionado.finca}`;
                  setProductorSeleccionado(null);
                  abrirCheckoutUniversal('100000', nombre, 'financiamiento');
                }}
                className="px-6 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
              >
                <span>Apalancar Parcela ({productorSeleccionado.retornoROI}% ROI)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. MODAL EMUTRABLE DE OPEN PAYMENTS */}
      {modalOpen && (
        <BiotaFlowGateway
          isOpen={modalOpen}
          montoCOP={montoCheckoutCOP}
          destinoNombre={destinoCheckoutNombre}
          tipoOperacion={tipoOperacionCheckout}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* 5. FOOTER */}
      <footer className={`border-t mt-20 py-8 text-center text-xs transition-colors ${
        isDark ? 'border-slate-900 text-slate-500' : 'border-slate-200 text-slate-500 bg-white'
      }`}>
        <p>BiotaFlow · Built for the Open Payments & Interledger Hackathon</p>
        <p className="mt-1">Cross-Border Agroforestry Protocol · Colombia ➔ Global ReFi Markets</p>
      </footer>
    </div>
  );
}
