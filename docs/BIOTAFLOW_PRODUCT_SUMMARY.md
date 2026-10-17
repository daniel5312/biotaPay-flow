# 🌿 BiotaFlow: Resumen Ejecutivo y Pitch para el Equipo

## 1. El Problema que Resolvemos en 30 Segundos
En **BiotaFlow**, los proyectos de agricultura regenerativa están en el campo colombiano y necesitan **Pesos Colombianos (COP)** para comprar semillas, bioinsumos y herramientas. Sin embargo, los donantes, ONGs e inversionistas de impacto están en Europa y Estados Unidos manejando **Euros (EUR) o Dólares (USD)**.
- **La banca tradicional** cobra entre 5% y 12% por cambio de divisa y demora de 2 a 5 días hábiles.
- **Las soluciones cripto convencionales** obligan al agricultor a lidiar con gas, redes blockchain y puentes difíciles de cambiar a dinero real.

---

## 2. Nuestra Solución: BiotaFlow
Integramos **Open Payments** sobre el protocolo **Interledger (ILP)**:
- El donante entra a BiotaFlow, elige un productor y paga en **Euros (EUR)**.
- El protocolo calcula el cambio exacto en tiempo real sin spreads bancarios ocultos.
- El agricultor recibe **Pesos Colombianos (COP)** directamente en su cuenta/billetera.
- Todo ocurre en segundos, con autorización bancaria abierta (estándar GNAP) y recibo digital auditable.

---

## 3. ¿Qué Construimos y Qué Tenemos Listo?
1. **SDK Oficial de Open Payments**: Módulo TypeScript nativo (`biotaflow-sdk`) que firma criptográficamente cada petición con llaves Ed25519 (estándar RFC 9421).
2. **Checkout Integrado en la dApp**: Modal estilo Stripe/Wompi (`BiotaFlowGateway`) integrado en la ficha de cada productor.
3. **Flujo de Permisos GNAP**: El usuario autoriza de forma segura en su billetera sin compartir sus llaves privadas ni su contraseña.
4. **Comprobante Digital Oficial**: Pantalla de éxito (`/success`) con desglose de la cotización, monto en COP acreditado, monto en EUR debitado, fecha y comprobante imprimible.
5. **Código Limpio y Protegido**: Toda la rama de desarrollo (`feat/biotaflow-open-payments`) está versionada y subida a GitHub con cero exposición de credenciales privadas.

---

## 4. Diferenciales para el Jurado de la Hackathon
- **Interoperabilidad Real**: No encerramos al usuario en un solo token; unimos Web3 (Celo + Superfluid) con Finanzas Abiertas (Open Payments).
- **Inclusión Financiera Rural**: El campesino no necesita entender de blockchain para recibir microdonaciones globales en su moneda local.
- **Arquitectura de Nivel Financiero**: Autenticación criptográfica, sesiones idempotentes y cero almacenamiento de llaves del usuario en el navegador.
