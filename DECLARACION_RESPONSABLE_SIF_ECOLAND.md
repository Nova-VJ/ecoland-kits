# DECLARACIÓN RESPONSABLE DEL SISTEMA INFORMÁTICO DE FACTURACIÓN (SIF)
## Conforme al Artículo 13 del Real Decreto 1007/2023 (Reglamento RRSIF) y Orden HAC/1177/2024

**Fecha de emisión:** 28 de octubre de 2026  
**Lugar de expedición:** Valladolid, España  
**Régimen tributario aplicable:** Ley 58/2003 General Tributaria (art. 29.2.j), Real Decreto 1007/2023 y Orden Ministerial HAC/1177/2024.

---

### 1. DATOS IDENTIFICATIVOS DE LA ENTIDAD PRODUCTORA Y DEL SOFTWARE

| Campo Requerido por RD 1007/2023 | Detalle Oficial Registrado |
| :--- | :--- |
| **Razón Social de la Productora:** | Ecoland Bio S.L. |
| **NIF de la Entidad:** | B-47000001 (Formato AEAT: B47000001) |
| **Domicilio Fiscal y Tienda Física:** | Calle Santiago 14, 47001 Valladolid (Castilla y León, España) |
| **Nombre Comercial del Sistema (SIF):** | Ecoland Omnichannel Billing Engine (`Ecoland-SIF`) |
| **Versión del Software Auditada:** | `v2.4.0-verifactu` (Commit Git: `18f6d97`) |
| **Entorno Tecnológico:** | PostgreSQL 15+ (Row-Level Security, Hash Chaining SHA-256) + Node.js/Edge Runtime |
| **Contacto de Cumplimiento Normativo:** | cumplimiento@ecoland.es |

---

### 2. ELECCIÓN FORMAL DE MODALIDAD OPERATIVA: SISTEMA «VERI*FACTU»

De conformidad con lo dispuesto en el **artículo 16 del Real Decreto 1007/2023**, la entidad declara formalmente que el sistema informático **Ecoland Omnichannel Billing Engine opera bajo la MODALIDAD DE REMISIÓN CONTINUA («VERI\*FACTU»)**.

#### Consecuencias jurídicas y técnicas de esta elección:
1. **Exención de Firma Electrónica Individual de Registro:** En virtud del **artículo 12.2 del Real Decreto 1007/2023**, los sistemas informáticos que envíen de forma continuada todos los registros de facturación a la Agencia Estatal de Administración Tributaria (AEAT) quedan **legalmente eximidos de estampar firma electrónica en cada registro individual**, simplificando la carga criptográfica transaccional sin menoscabo de la seguridad.
2. **Autenticación mTLS de Canal Seguro:** El certificado digital de la empresa (sello de persona jurídica o certificado cualificado expedido por prestador de servicios de confianza admitido por la FNMT) se emplea para autenticar la conexión segura **mTLS (Mutual TLS 1.3)** con el endpoint oficial de recepción de la AEAT (`https://sede.agenciatributaria.gob.es/`).
3. **Impresión del Indicativo Legal:** Toda factura simplificada o completa emitida por el sistema incorpora de forma indeleble y visible el distintivo:  
   **«Factura verificable en la sede electrónica de la AEAT» / «VERI\*FACTU»**.

---

### 3. DECLARACIÓN DE CUMPLIMIENTO EXPRESO (ART. 29.2.j LGT)

El representante legal y el director de ingeniería de Ecoland Bio S.L. **DECLARAN BAJO SU EXCLUSIVA RESPONSABILIDAD** que el software `Ecoland-SIF v2.4.0-verifactu`:

1. **Garantiza la Integridad, Inalterabilidad y Trazabilidad:**
   - Todo registro de facturación de alta (`alta_factura`) genera un hash criptográfico **SHA-256** encadenado de forma lineal con el registro anterior (`huella_registro_anterior`).
   - El esquema de base de datos prohíbe de forma absoluta sentencias de actualización (`UPDATE`) o borrado (`DELETE`) sobre la tabla auditada `invoices` mediante políticas estrictas de seguridad (Row-Level Security en PostgreSQL) y permisos restringidos exclusivamente a `service_role`.
   - Cualquier modificación comercial se tramita inexcusablemente mediante factura rectificativa (serie `R2026-XXXX`).

2. **Garantiza la Legibilidad y Conservación:**
   - La base de datos almacena los registros en formato estructurado JSON/XML conforme al esquema oficial XSD de la AEAT.
   - Los datos se replican en tres zonas geográficas cifradas con clave AES-256 en reposo.

3. **Garantiza la Accesibilidad:**
   - Los registros de auditoría y facturación son exportables de manera inmediata a requerimiento de la Inspección de los Tributos.

4. **Incorpora Código QR Conforme a la Orden HAC/1177/2024:**
   - Cada factura emitida lleva asociado un código QR normalizado de dimensiones mínimas de 30x30 mm con codificación UTF-8, cuya URL apunta a la sede oficial de la AEAT con los parámetros:
     `https://sede.agenciatributaria.gob.es/qr/factura?nif=B47998877&num=FRA-2026-XXXX&fec=DD-MM-YYYY&tot=XX.XX`

5. **Inexistencia de Funcionalidades de Ocultación o Doble Uso:**
   - El código fuente no contiene puertas traseras, comandos de sobrescritura oculta, doble contabilidad, ni ningún módulo que permita interpolar, retrasar o desviar transacciones mercantiles del registro oficial.

---

### 4. DISPONIBILIDAD DE ESTA DECLARACIÓN

En cumplimiento del **artículo 13.2 del RRSIF**, la presente declaración responsable:
- Se encuentra integrada en el código fuente del sistema en formato inmutable.
- Está permanentemente a disposición de los clientes y adquirentes en la sección de transparencia del portal web.
- Se facilitará de forma inmediata a la Administración Tributaria ante cualquier solicitud o inspección reglamentaria.

Firmado digitalmente en Valladolid a 28 de octubre de 2026, por:  
**Dirección Técnica y Representación Legal de Ecoland Bio S.L.**
