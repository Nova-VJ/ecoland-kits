# ECOLAND DAILY — PLAN MAESTRO DE PRODUCTO Y RETENCIÓN
## De Tienda Online a Asistente Diario de Alimentación Saludable y Despensa

---

## 1. VISIÓN GENERAL Y OBJETIVO
El objetivo de **Ecoland Daily** no es añadir más funciones comerciales a la tienda, sino responder a la pregunta clave:
> *«¿Qué motivo tiene una persona para abrir Ecoland esta mañana, aunque hoy no vaya a comprar nada?»*

La respuesta reside en la utilidad recurrente:
**Acompañar la alimentación diaria del usuario, ayudándole a saber qué come, qué tiene en su despensa, qué puede cocinar rápido y qué necesita reponer.**

---

## 2. AUDITORÍA DE FUNCIONALIDADES EXISTENTES VS NUEVAS

| FUNCIONALIDAD | ESTADO EN ECOLAND | ACCIÓN EN ECOLAND DAILY | PRIORIDAD |
| :--- | :--- | :--- | :--- |
| **Ecoland Hoy (Dashboard Diario)** | No existía como pantalla principal | **Crear como pantalla principal del usuario** | **P0 (Inmediato)** |
| **Diario de Calorías y Macros** | Existente dentro de pestaña secundaria de EcoHealth | **Extraer y optimizar con barras visuales y fibra** | **P0 (Inmediato)** |
| **Registro Ultrarrápido Multi-modal** | Existía formulario manual de texto | **Crear diálogo unificado (Búsqueda, EAN, Texto, Voz, Foto)** | **P0 (Inmediato)** |
| **Comidas Habituales (1 toque)** | No existía | **Crear sistema de repetición en 1 clic** | **P0 (Inmediato)** |
| **Completa mi Día** | No existía | **Crear recomendación contextual con despensa** | **P0 (Inmediato)** |
| **Chef IA conectado al Diario** | Generador aislado en pestaña de recetas | **Conectar: Cocinar → Registrar en diario → Despensa** | **P0 (Inmediato)** |
| **Resumen Semanal Amable** | No existía | **Crear análisis semanal constructivo sin culpas** | **P0 (Inmediato)** |
| **Objetivos Personalizados (10 metas)** | Solo perder/mantener/ganar peso | **Crear 10 objetivos (fibra, despensa, presupuesto, etc.)** | **P0 (Inmediato)** |
| **Agua e Hidratación Rápida** | Contador básico en EcoHealth | **Integrar en cabecera de Ecoland Hoy con + / - directo** | **P0 (Inmediato)** |
| **Despensa conectada a Pedidos** | Despensa estática de 4 productos | **Modal post-compra "¿Añadir a despensa?" + consumo diario** | P1 |
| **Qué consumir primero (Anti-desperdicio)** | No existía | **Alertas de consumo preferente y recetas asociadas** | P1 |
| **Planificación Semanal de Cenas** | No existía | **Generador 5 cenas + lista de ingredientes** | P1 |
| **Lista de Compra Inteligente** | Carrito estándar ecommerce | **Lista combinada (faltantes menú + habituales despensa)** | P1 |
| **Nutrición por Euro** | No existía | **Métrica económica: gramos de proteína y fibra por euro** | P1 |
| **Historial y Calendario Diario** | Solo día actual | **Navegador de días anteriores y copiar comidas** | P1 |
| **Notificaciones Amables Opt-in** | No existía | **Panel de preferencias con horarios y cero spam** | P2 |
| **Perfil Familiar / Raciones** | Monousuario | **Selector de comensales (1, 2, 4 personas)** | P2 |
| **Integraciones Apple Health / Google Fit** | No existía | **Preparación de esquemas (para fase futura)** | P2 |

---

## 3. ESPECIFICACIÓN DETALLADA DEL NÚCLEO P0 (FASE 1)

### P0.1 — Pantalla Central: «Ecoland Hoy» (`/hoy`)
- **Propósito:** Ser la primera vista que encuentra el usuario al entrar a la app.
- **Componentes visuales:**
  1. *Saludo personalizado y horario:* "Buenos días, Carlos" / "Buenas tardes, María".
  2. *Resumen calórico y macronutrientes:*
     - Calorías consumidas / Objetivo (ej: 1.480 / 2.050 kcal).
     - Proteína (g), Carbohidratos (g), Grasas (g) y **Fibra dietética (g)** (esencial en dieta bio).
  3. *Control de agua en 1 toque:* Vasos de agua (ej: 5 / 8 vasos) con botones `+` y `-`.
  4. *Cuadrante de Comidas:*
     - Desayuno (con calorías y botón `+ Registrar`).
     - Comida (con calorías y botón `+ Registrar`).
     - Cena (con calorías y botón `+ Registrar`).
     - Snacks / Tentempiés (con calorías y botón `+ Registrar`).
  5. *Acceso rápido a Comidas Habituales:* Carrusel horizontal con 1 toque ("Tu desayuno habitual", "Lo que comiste ayer").
  6. *Módulo «Completa mi día»:* Recomendación inteligente según nutrientes restantes.

### P0.2 — Modal de Registro Ultrarrápido Multi-Modal
- **Propósito:** Reducir a menos de 5 segundos el tiempo que tarda un usuario en anotar lo que ha comido.
- **Canales de entrada integrados:**
  1. **⌨️ Texto Natural Inteligente:** El usuario escribe *"He desayunado 2 tostadas integrales con aguacate y café con leche"*. El parser estima automáticamente:
     - Pan integral bio (80g) · 200 kcal · 7g prot.
     - Aguacate fresco (60g) · 100 kcal · 1g prot.
     - Café solo (1 taza) · 2 kcal.
     - Bebida de avena bio (150ml) · 70 kcal · 2g prot.
     - Total: ~372 kcal con desglose de macros editable.
  2. **🎙️ Entrada por Voz (Simulada/Web Speech):** Reconocimiento dictado: *"He comido lentejas con verduras y una manzana"*.
  3. **📷 Reconocimiento Visual de Plato (Foto IA):** Simula el escaneo fotográfico de una ensalada o plato caliente, devolviendo los ingredientes estimados con etiqueta *"Estimación orientativa"* y selector para ajustar porciones.
  4. **▥ Escáner de Código de Barras EAN:** Conecta con los más de 1.000 productos bio del catálogo Ecoland para cargar los datos exactos del fabricante.
  5. **🔍 Buscador Rápido en Catálogo:** Búsqueda en tiempo real por nombre de producto bio o alimento común.

### P0.3 — Sistema de «Comidas Habituales» (1 Toque)
- **Propósito:** El 80% de los desayunos y tentempiés son repetitivos.
- **Funcionamiento:**
  - Registra combinaciones frecuentes en `localStorage` / perfil de usuario.
  - Ofrece tarjetas interactivas: *"Tu desayuno habitual: Copos de avena + Bebida vegetal + Plátano (360 kcal)"*.
  - Un solo toque añade la combinación completa al desayuno de hoy.

### P0.4 — Algoritmo «Completa mi Día»
- **Propósito:** Responder proactivamente a las 19:00 o 20:00: *"¿Qué ceno hoy para compensar el día?"*.
- **Lógica de recomendación:**
  - Si falta fibra: propone platos ricos en legumbres, semillas o verduras verdes.
  - Si falta proteína vegetal: propone quinoa, tofu, frutos secos o legumbres.
  - **Cruce con despensa:** Comprueba qué ingredientes tiene ya el usuario en casa (ej: *"Tienes quinoa y AOVE, te faltan espinacas"*).
  - Ofrece 2-3 opciones prácticas con tiempo estimado de preparación (10-20 min).
  - Botón: *"Cocinar con lo que tengo"* o *"Añadir faltantes a la cesta (3,40 €)"*.

### P0.5 — Conexión Chef IA → Diario Nutricional
- **Propósito:** Que las recetas no se queden en una pantalla decorativa, sino que entren en la vida real del usuario.
- **Acciones en cada receta:**
  - **🍳 Cocinar:** Despliega los pasos de cocina claros y temporizados.
  - **📝 Registrar en mi día:** Selector de raciones (1 ración, media ración, 2 raciones), calculando automáticamente las calorías y macros consumidos y volcándolos a la comida correspondiente.
  - **⭐ Guardar receta:** Guarda en recetario personal para repetir otro día.
  - **🛒 Añadir faltantes a la cesta:** Solo añade al carrito los ingredientes que el usuario no tiene en su despensa.

### P0.6 — «Tu Semana en Ecoland» (Resumen Semanal Amable)
- **Propósito:** Mostrar tendencias globales sin generar culpa ni ansiedad.
- **Métricas constructivas:**
  - Días que registraste comida esta semana (ej. 5 de 7).
  - Promedio calórico y de macronutrientes.
  - Variedad de alimentos vegetales consumidos (objetivo saludable: 20-30 plantas distintas por semana).
  - Vasos de agua promedio.
  - Alimentos de la despensa aprovechados con éxito (cero desperdicio).

### P0.7 — 10 Objetivos de Salud Personalizados
1. **Comer más equilibrado** (Plato de Harvard)
2. **Aumentar fibra dietética** (salud intestinal y microbioma)
3. **Aumentar proteína vegetal** (vitalidad y rendimiento)
4. **Organizar mejor mis comidas** (planificación y tranquilidad)
5. **Aprovechar mi despensa** (ahorro y reducción de desperdicio)
6. **Gastar menos en alimentación** (optimización de presupuesto)
7. **Mantener mi peso actual** (estabilidad y energía constante)
8. **Ganar masa muscular** (superávit controlado y proteína)
9. **Perder peso de forma saludable** (déficit moderado sin restricciones)
10. **Comer 100% ecológico y de temporada** (salud ambiental y de proximidad)

---

## 4. CRITERIOS DE ACEPTACIÓN PARA LA FASE P0
1. El usuario puede acceder a `/hoy` desde el menú principal de navegación (Header) y desde la barra inferior móvil (BottomNav).
2. La pantalla carga instantáneamente desde el almacenamiento local o perfil sin bloqueos de red.
3. Registrar un desayuno habitual requiere exactamente **1 solo clic/toque**.
4. El parser de texto natural descompone frases cotidianas en ingredientes con calorías y macronutrientes reales.
5. El escáner fotográfico simulado y el dictado de voz permiten guardar una comida en menos de 5 segundos con aviso explícito de *"Estimación orientativa"*.
6. La sección *"Completa mi día"* analiza los nutrientes del día y ofrece recetas lógicas cruzadas con la despensa.
7. Una receta de Chef IA puede enviarse directamente al diario nutricional con el selector de raciones.
8. La aplicación no contiene mensajes punitivos, rachas de fuego agresivas ni lenguaje de culpa.
9. `npm run test` y `npm run build` pasan al 100% sin errores de compilación ni regresiones en la suite de 40 tests E2E.
