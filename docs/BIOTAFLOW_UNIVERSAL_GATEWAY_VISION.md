# 🚀 BiotaFlow: La Pasarela de Pagos Universal (Open Payments + Stellar Cash-Out)

> **Documento Estratégico de Arquitectura de Producto para la Hackathon**  
> **Producto:** BiotaFlow SDK & Gateway (Embeddable Widget / NPM Package)  
> **Caso de Éxito / Demo Host:** BiotaFlow (Financiamiento a Productores Agroecológicos)  

---

## 1. Visión del Producto: Pasarela Agnóstica y Universal

**BiotaFlow NO es solo para proyectos agrícolas.**  
BiotaFlow es una **pasarela de pagos transfronteriza y modular** diseñada como un widget / SDK instalable (`<BiotaFlowGateway />` o `import { BiotaFlow } from '@biota/biotaflow'`) que **cualquier dApp, e-commerce, ONG o plataforma digital de la economía real** puede integrar en su checkout.

### ¿Qué problema resuelve BiotaFlow para cualquier negocio?
Permite a cualquier plataforma vender o recaudar fondos a nivel global:
1. **Cobrar en el mundo:** Recibe pagos instantáneos transfronterizos sin fricción bancaria vía **Open Payments (Interledger Protocol - ILP)** en monedas como EUR o USD.
2. **Liquidación automática en riel interoperable:** Mueve el valor a través de **Stellar Network** en activos estables (USDC).
3. **Retiro de efectivo físico en la última milla:** Permite al receptor final (sea un campesino, un artesano, un freelancer o un beneficiario de ayuda humanitaria) retirar **billetes físicos en efectivo (COP)** en más de 400.000 puntos físicos aliados de **MoneyGram Access (GANA, corresponsales bancarios, Efecty)** mediante el estándar **Stellar SEP-24**.

---

## 2. El Rol de BiotaFlow en la Presentación
- **BiotaFlow** = El Producto Central / La Pasarela Universal que se juzga y se premia.
- **BiotaFlow** = La dApp anfitriona (*Showcase / Demo en Vivo*), demostrando cómo un productor rural recibe una donación en EUR y genera su orden de cobro en efectivo físico para ir a la tienda de su vereda.

---

## 3. Hoja de Ruta para el Repositorio Nuevo (Mañana)

```
biotaflow/
├── packages/
│   └── biotaflow-sdk/           # SDK Core agnóstico instalable por cualquier app
│       ├── open-payments/       # Motor ILP / GNAP (Inbound EUR -> COP)
│       └── stellar-moneygram/   # Motor SEP-24 (Outbound Cash-out a GANA)
├── examples/
│   └── demo-checkout/           # Frontend Next.js limpio con el widget y botón de retiro
└── docs/                        # Diagramas de integración y guías de uso
```

---
*Anotado y sellado para arrancar con toda la energía mañana.*
