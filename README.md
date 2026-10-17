# 🌊 BiotaFlow — Open Payments Gateway

> **Pasarela de financiamiento transfronterizo en tiempo real para comunidades rurales y productores agroforestales mediante Interledger Protocol (ILP) y Open Payments.**

---

## 🚀 Pitch del Proyecto

**BiotaFlow** conecta a donantes e inversionistas globales con campesinos y productores locales en Colombia:
1. **Entrada de Divisas (EUR/USD):** El donante autoriza el débito desde su billetera con el estándar interactivo **GNAP (Grant Negotiation and Authorization Protocol)**.
2. **Liquidación ILP en Tiempo Real:** La red Interledger (**Rafiki Testnet**) cotiza la tasa de cambio y enruta los fondos en milisegundos directamente hacia la cuenta del receptor en **COP (Pesos Colombianos)** sin intermediación bancaria tradicional.
3. **Comprobante Digital Oficial:** Pantalla de recibo (`/success`) con ID criptográfico de transacción, auditoría de débito/crédito y soporte de impresión.

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js `15.1.0` (App Router)
- **Frontend:** React `19.0.0` + Tailwind CSS
- **Lenguaje:** TypeScript `5.7`
- **Protocolo & SDK:** `@interledger/open-payments` `^7.4.0`
- **Firmas HTTP:** RFC 9421 (Message Signatures) & Ed25519 Keys

---

## ⚡ Inicio Rápido en Desarrollo

### 1. Variables de Entorno
Copia la plantilla y configura tus credenciales de Rafiki Testnet:
```bash
cp .env.example .env.local
```

### 2. Ejecutar Servidor Local
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la demostración interactiva.

---

## 📁 Arquitectura del Repositorio

```text
├── app/
│   ├── actions/
│   │   └── biotaflow.ts        # Server Actions (iniciarDonacion, completarDonacion, sesión GNAP)
│   ├── success/
│   │   └── page.tsx            # Pantalla de recibo digital con protección StrictMode React 19
│   ├── layout.tsx              # Layout raíz
│   └── page.tsx                 # Demo interactiva de checkout para la hackathon
├── biotaflow-sdk/              # SDK Core Open Payments
│   ├── auth/                   # Criptografía, JWKS y firmas RFC 9421
│   ├── core/                   # BiotaFlowClient (cliente orientado a objetos)
│   ├── discovery/              # Resolución de Payment Pointers
│   ├── resources/              # IncomingPayment, OutgoingPayment, Quotes
│   └── types/                  # Tipados TypeScript del protocolo
├── components/
│   └── openpayments/
│       └── BiotaFlowGateway.tsx # Modal visual de checkout estilo Stripe/Wompi en COP
└── docs/                       # Documentación técnica y resumen de producto
```

---

## 🔒 Seguridad
- Las llaves privadas criptográficas (`*.pem`) y variables de entorno (`.env*.local`) están estrictamente ignoradas por `.gitignore` y **nunca** se exponen en repositorios públicos.
