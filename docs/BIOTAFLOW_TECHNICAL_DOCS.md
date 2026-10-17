# BiotaFlow: Infraestructura ReFi y eCommerce B2B con Open Payments (ILP)

> **Documento Oficial de Arquitectura Técnica y Entrega para Jurados**  
> **Proyecto:** BiotaFlow  
> **Hackathon:** Open Payments Hackathon  
> **Estándar:** Interledger Protocol (ILP) & Open Payments Specification (GNAP / RFC 9421)  

---

## 1. Resumen Ejecutivo de la Presentación (Pitch Framework)

### A. The Challenge (El Desafío)
* **Exclusión Financiera Rural:** Los pequeños agricultores agroforestales y regenerativos en Colombia operan en moneda local (**COP**), excluidos de créditos formales o atados a tasas de interés predatorias.
* **Fricción Transfronteriza:** Conectar capital internacional (**EUR/USD**) con el campo colombiano mediante la banca tradicional (SWIFT) toma entre 3 y 5 días hábiles y destruye entre el **8% y el 12%** del dinero en intermediarios y comisiones cambiarias.
* **Ausencia de Rieles Programables y Recurrentes:** Las pasarelas de pago convencionales son jardines cerrados que no admiten patrocinios periódicos directos (*Recurring Grants*) ni liquidación automatizada y dividida (*Split Payouts*) entre inversores y productores al cosechar.

### B. The User (El Usuario)
1. **Productor Agroforestal (Campesino):** Necesita capital de trabajo para insumos bioorgánicos y restauración sin endeudarse, y cobro directo e instantáneo por sus cosechas (ej. café bajo sombra en Boyacá, cacao fino en Huila).
2. **Financiador Global (ReFi Backer):** Ciudadanos o fondos en Europa/EE.UU. que desean patrocinar la transición ecológica mediante aportes únicos o suscripciones mensuales transparentes con auditoría ReFi (GPS, altitud, % dosel de sombra y métricas de $\text{CO}_2$).
3. **Comprador Mayorista B2B (Tostador / Distribuidor):** Empresas internacionales que adquieren cosechas con trazabilidad de origen y liquidan de forma directa con Open Payments.

### C. The Solution (La Solución: BiotaFlow)
Plataforma descentralizada de finanzas regenerativas (ReFi) y marketplace B2B construida sobre Next.js 15 que cierra el ciclo económico en cuatro fases:
1. **Financiación Pre-Cosecha (Crowdfarming):** Aportes únicos o donaciones recurrentes automáticas.
2. **Auditoría y Trazabilidad:** Monitoreo agronómico en tiempo real de la parcela.
3. **Mercado Mayorista B2B:** Catálogo de lotes con puntaje de calidad (SCA) y pre-financiación trazada.
4. **Reparto Atómico Automatizado (Split Payouts):** Al vender el lote, el pago enrutable de Open Payments divide el capital: retorna el principal + ROI al inversor internacional en EUR y liquida el margen en COP al campesino.

### D. How Open Payments Was Used (Uso del Protocolo)
* **Flujo E2E GNAP (RFC 9421):** Ciclo completo de 8 fases (`walletAddress.get` $\rightarrow$ `grant.request` $\rightarrow$ `incomingPayment.create` $\rightarrow$ `quote.create` $\rightarrow$ `interact` $\rightarrow$ `grant.continue` $\rightarrow$ `outgoingPayment.create`).
* **Recurring Grants con ISO 8601:** Parámetro `interval` (`R/2026-10-01T00:00:00Z/P1M` mensual y `P1W` semanal) para suscripciones de apoyo ecológico que se renuevan automáticamente sin firma manual reiterada.
* **Liquidación Multidivisa en Tiempo Real (EUR $\rightarrow$ COP):** Cotizaciones instantáneas mediante el conector de Rafiki.
* **Firmas Criptográficas HTTP:** Llaves asimétricas Ed25519 custodiadas estrictamente en el backend.

### E. Key Learnings (Aprendizajes Clave)
1. **GNAP es superior a OAuth para transacciones financieras:** El modelo de concesiones (*Grants*) desacopla identidad de consentimiento monetario, permitiendo límites de monto, expiración e intervalos recurrentes sin exponer llaves privadas.
2. **Interledger democratiza las microfinanzas rurales:** La conmutación de paquetes de ILP elimina los costes fijos de transferencias internacionales, haciendo viables aportes desde \$10 o \$20 USD directos al campesino.
3. **Manejo de Idempotencia en Frameworks Modernos:** Resolver el ciclo de vida de tokens de un solo uso (*single-use nonces*) en callbacks asíncronos de React 19 y Next.js 15.

---

## 2. Diagramas de Arquitectura y Flujos

### Diagrama 1: Modelo de Negocio Circular (BiotaFlow)

```mermaid
flowchart TD
    subgraph S1["1. Financiación Pre-Cosecha"]
        A["Inversor / Backer Global (EUR/USD)"] -->|"Open Payments GNAP (Aporte Único o Recurring Grant)"| B["Parcela Campesino (COP)"]
        B -->|"Siembra agroforestal & restauración ReFi"| C["Cosecha Sostenible Certificada"]
    end

    subgraph S2["2. Mercado Mayorista B2B"]
        C -->|"Trazabilidad SCA & Origen"| D["Lotes en Marketplace BiotaFlow"]
        E["Comprador / Tostador B2B"] -->|"Checkout Open Payments (ILP)"| D
    end

    subgraph S3["3. Reparto Atómico (Split Payout)"]
        D -->|"Liquidación Instantánea"| F{"Motor de Reparto ILP"}
        F -->|"Retorno Capital + ROI (EUR)"| A
        F -->|"Margen / Utilidad Neta (COP)"| B
    end
```

---

### Diagrama 2: Secuencia Técnica de Open Payments & GNAP en BiotaFlow

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Financiador / Comprador B2B
    participant Frontend as BiotaFlow UI (Next.js 15)
    participant Backend as Server Action (biotaflow.ts)
    participant ClientSDK as BiotaFlowClient (SDK ILP)
    participant Rafiki as Nodo Interledger (Rafiki Testnet)

    %% PASO 1: Descubrimiento y Factura
    Usuario->>Frontend: Clic en 'Autorizar Pago' (Único, Recurrente o B2B)
    Frontend->>Backend: iniciarDonacion(montoCop, destino, tipo, intervaloIso)
    Backend->>ClientSDK: Resolver Billetera Receptora
    ClientSDK->>Rafiki: walletAddress.get(URL_RECEPTOR)
    Rafiki-->>ClientSDK: Detalles Billetera (authServer, resourceServer)
    
    Backend->>ClientSDK: Solicitar Grant no interactivo (Incoming Payment)
    ClientSDK->>Rafiki: grant.request({ access_token: { type: 'incoming-payment' } })
    Rafiki-->>ClientSDK: Token no interactivo
    
    Backend->>ClientSDK: Crear Factura Entrante
    ClientSDK->>Rafiki: incomingPayment.create({ incomingAmount: montoCOP })
    Rafiki-->>ClientSDK: incomingPayment.id

    %% PASO 2: Cotización y Grant Interactivo
    Backend->>ClientSDK: Solicitar Grant de Cotización (Quote)
    ClientSDK->>Rafiki: grant.request({ access_token: { type: 'quote' } })
    Rafiki-->>ClientSDK: Token de Quote
    
    Backend->>ClientSDK: Crear Cotización Multidivisa (EUR -> COP)
    ClientSDK->>Rafiki: quote.create({ receiver: incomingPayment.id })
    Rafiki-->>ClientSDK: quote.id + debitAmount (EUR) + receiveAmount (COP)

    Backend->>ClientSDK: Solicitar Grant Interactivo GNAP (Outgoing Payment)
    Note over ClientSDK,Rafiki: Incluye límite de monto y opcionalmente intervalo ISO 8601 (P1M / P1W)
    ClientSDK->>Rafiki: grant.request({ interact, limits: debitAmount, interval })
    Rafiki-->>ClientSDK: interact.redirect (URL de Consentimiento) + continue.uri + continue.token
    
    Backend-->>Frontend: { success: true, interactionUrl }
    
    %% PASO 3: Consentimiento del Usuario
    Usuario->>Rafiki: Redirección al portal interactivo GNAP
    Note over Usuario,Rafiki: El usuario aprueba el débito en su billetera
    Rafiki-->>Frontend: Redirección a /success?interact_ref=...&sid=...

    %% PASO 4: Finalización y Desembolso
    Frontend->>Backend: completarDonacion(interactRef, sessionId)
    Backend->>ClientSDK: Continuar Grant GNAP con interact_ref
    ClientSDK->>Rafiki: grant.continue({ interact_ref }, continue.token)
    Rafiki-->>ClientSDK: Access Token final para Outgoing Payment
    
    Backend->>ClientSDK: Ejecutar Pago Saliente
    ClientSDK->>Rafiki: outgoingPayment.create({ quoteId })
    Rafiki-->>ClientSDK: outgoingPayment.id (Transacción confirmada en ILP)
    Backend-->>Frontend: Recibo digital emitido con ID de liquidación
    Frontend-->>Usuario: Muestra Recibo y Actualiza Balances ReFi
```

---

### Diagrama 3: Arquitectura del *Split Payout* Automatizado

```mermaid
flowchart LR
    A["Pago Entrante Mayorista B2B (EUR/USD)"] --> B["Router de Liquidación BiotaFlow"]
    
    subgraph Split["División Atómica de Fondos"]
        B -->|"60% Capital + ROI"| C["Billetera Inversor Global (EUR)"]
        B -->|"40% Margen Cosecha"| D["Billetera Campesino Productor (COP)"]
    end
    
    C --> E["Recibo de Liquidación Inversor"]
    D --> F["Abono en Tiempo Real Parcela"]
```

---

## 3. Mapeo de Funciones de BiotaFlow con Open Payments SDK

| Función en `BiotaFlow` | Método Oficial Open Payments | Propósito en el Modelo de Negocio |
| :--- | :--- | :--- |
| **`resolverBilletera`** | `client.walletAddress.get()` | Valida el Payment Pointer del campesino o de la tienda mayorista y obtiene los endpoints del servidor GNAP. |
| **`crearFacturaEntrante`** | `client.incomingPayment.create()` | Genera la orden de cobro en Pesos Colombianos (COP) para la parcela o el lote B2B. |
| **`crearCotizacion`** | `client.quote.create()` | Calcula la tasa de cambio en tiempo real y el monto que saldrá de la billetera del financiador en EUR. |
| **`solicitarGrantInteractivo`** | `client.grant.request({ interact, interval })` | Negocia con GNAP el permiso de débito; soporta **Aportes Únicos** o **Recurring Grants** (ISO 8601 `P1M`). |
| **`finalizarConsentimiento`** | `client.grant.continue({ interact_ref })` | Canjea el código de autorización devuelto por Rafiki por el token final de liquidación. |
| **`ejecutarPagoSaliente`** | `client.outgoingPayment.create()` | Despacha los paquetes de valor por la red Interledger para liquidar la transacción de forma irrevocable. |

---

## 4. Ingeniería de Seguridad y Retos Técnicos Resueltos

### A. Firmas Criptográficas RFC 9421 y Desacoplamiento de CORS
* **Problema:** El estándar Open Payments requiere firmar digitalmente cada cabecera HTTP usando pares de llaves asimétricas **Ed25519**. Si el frontend intentaba invocar a Rafiki directamente con JavaScript:
  1. El navegador bloqueaba las llamadas por directivas de **CORS**.
  2. Exponer llaves privadas en el bundle de JavaScript violaba los principios de seguridad de la Web.
* **Solución:** Implementación de **Next.js Server Actions (`'use server'`)**. El frontend únicamente solicita intenciones de pago; la firma criptográfica, la lectura de claves `.pem` y la comunicación con el servidor GNAP ocurren de forma hermética de Servidor a Servidor.

### B. Cerrojo de Idempotencia contra React 19 StrictMode (Single-Use Nonces)
* **Problema:** En Next.js y React 19 en modo desarrollo, los componentes ejecutan el ciclo `useEffect` dos veces seguidas (*StrictMode*). El parámetro `interact_ref` devuelto por Rafiki es un **token criptográfico de un solo uso**. La primera llamada ejecutaba el pago correctamente, pero la segunda llamada inmediata enviaba el mismo token ya consumido, provocando un error `400 Bad Request: interaction reference already consumed` que sobreescribía la interfaz mostrando un falso error.
* **Solución:** Implementación de un cerrojo de ejecución mutable mediante `useRef(false)` en [`app/success/page.tsx`](file:///home/danivargashermosa/web3/hackayon_openPayment/app/success/page.tsx), garantizando que el canje del grant se despache estrictamente una única vez:
  ```typescript
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;
    completarDonacion(interactRef, sessionId);
  }, [searchParams]);
  ```

### C. Almacén de Estado Asíncrono de Sesiones GNAP
* En Next.js App Router, las Server Actions corren en worker threads independientes.
* Implementamos un gestor de sesión temporal con TTL de 15 minutos en `.next/cache/openpayments-gnap-state/` para preservar el `continue.uri`, `continue.token` y cotizaciones entre el inicio de la transacción y el callback de redirección sin exponer datos sensibles en cookies del navegador.

---

## 5. Especificación de Endpoints y Billeteras en Rafiki Testnet

* **Billetera Emisora (Donante / Mayorista):**
  `$ilp.interledger-test.dev/225f757` (Moneda: `EUR`, assetScale: `2`)
* **Billetera Receptora (Parcelas / Productores):**
  `$ilp.interledger-test.dev/pagos-entrada` (Moneda: `COP`, assetScale: `2`)
* **Servidor de Autorización GNAP:**
  `https://auth.interledger-test.dev/`
* **Estándar de Recurrencia:**
  ISO 8601 Repeater Syntax (`R/{startTime}/{interval}`) ej. `R/2026-10-01T00:00:00Z/P1M`
