# ECOLAND — INFORME MAESTRO DE FUNCIONALIDADES, ARQUITECTURA Y LIMITACIONES

**Fecha de emisión:** Octubre 2026  
**Proyecto:** Ecoland (Tienda Ecológica y Plataforma de Salud Digital)  
**Versión:** 2.4-pro (Catálogo Real + EcoHealth Suite + Chef IA)  
**Ambiente de ejecución local:** `http://localhost:8080`  

---

## 1. RESUMEN EJECUTIVO DEL PROYECTO

**Ecoland** es un ecosistema de comercio electrónico y bienestar integral diseñado para una tienda especializada en alimentación ecológica, cosmética y productos naturales en España, con modelo **omnicanal** (tienda física en Valladolid / Castilla y León + tienda online nacional).

A diferencia de los supermercados generalistas y de las tiendas bio convencionales, Ecoland combina un catálogo real de más de **1.000 referencias biológicas confirmadas** con herramientas interactivas de nutrición preventiva, inteligencia artificial culinaria y planificación presupuestaria basada en evidencia científica.

---

## 2. ARQUITECTURA Y STACK TECNOLÓGICO

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework Frontend** | React 18 + TypeScript | Rendimiento, tipado estricto y cero errores en tiempo de ejecución. |
| **Bundler / Servidor** | Vite 5 (SPA) | Carga ultrarrápida (HMR instantáneo y compilación optimizada). |
| **Estilos & Diseño** | Tailwind CSS v4 + shadcn/ui | Sistema de diseño minimalista inspirado en referentes como Ametller Origen. |
| **Animaciones** | Framer Motion | Microinteracciones táctiles, arrastre al plato y transiciones fluidas. |
| **Estado Global** | React Context (`CartContext`) | Carrito omnicanal persistente con sincronización en `localStorage`. |
| **Iconografía** | Lucide Icons (Minimalista) | Iconos sobrios y modernos, eliminando emojis informales. |
| **Catálogo Central** | Base de datos tipada en TypeScript | 1.075 productos bio confirmados con fotos en Cloudflare CDN. |

---

## 3. AUDITORÍA DETALLADA MÓDULO A MÓDULO

---

### MÓDULO 1: CATÁLOGO Y TIENDA ONLINE (`/tienda`)

#### Qué hace:
1. **Catálogo Real de +1.000 Productos:**
   * Alimentos biológicos oficiales con foto real, peso neto, precio en euros, marca y sellos de calidad.
   * Marcas de referencia: *Drasanvi, Ecosana, Gumendi, El Granero Integral, Clearspring, etc.*
2. **Filtros en Tiempo Real:**
   * Por categoría: Desayunos, Legumbres & Conservas, Aceites Nobles, Superalimentos, Salsas & Cremas y Granel.
   * Por sellos dietéticos: 100% Vegano, Sin Gluten / Celíaco, Bio Certificado, Alto en Proteína.
   * Por rango de precio y ordenación (precio menor/mayor, novedades).
3. **Ficha de Producto de Alta Conversión:**
   * Título limpio y legible del alimento (evita nombres internos de ERP).
   * Acordeones desplegables: Descripción botánica/culinaria, Ingredientes 100% bio, Alérgenos destacados, Modo de conservación y uso culinario.
   * Indicador de disponibilidad en almacén y entrega en 24/48h.
4. **Compra Directa:**
   * Selector de unidades (+ / -) y adición instantánea al carrito con notificación Toast.

#### Qué no hace todavía:
* No permite escribir reseñas de clientes que se guarden en una base de datos central en la nube (las reseñas actuales son estáticas).
* No cuenta con venta al gramo pesada en báscula en vivo (los productos a granel se venden en formatos de 250g, 500g y 1kg).

#### Limitaciones técnicas y operativas:
* El stock mostrado proviene del archivo de catálogo local (`individual-products.ts`); requiere integración con el TPV físico (lector de códigos de barras de la tienda) para sincronización automática de unidades vendidas en mostrador.

---

### MÓDULO 2: SUITE ECOHEALTH (`/ecohealth`)

La suite EcoHealth es el centro neurálgico de diferenciación frente a competidores. Se compone de 8 herramientas interactivas:

#### 2.1. Plato Harvard Interactivo Circular (`/ecohealth` -> Tab Harvard)
* **Qué hace:**
  * **Test de Perfil Rápido y No Intrusivo:** No salta al cargar la página; se sugiere discretamente en la parte superior con sus beneficios. Si el usuario lo abre, puede configurar si su dieta es *Vegana*, *Sin Gluten* u *Omnívora*, y cuántas personas comen en casa.
  * **Visualización Circular del Plato:** Dividido fielmente según la Escuela de Salud Pública de Harvard (50% Vegetales y Frutas, 25% Granos Integrales, 25% Proteínas Limpias y centro para Aceites Nobles / AOVE).
  * **Opciones Universales Representativas:** Botones minimalistas que permiten lanzar conceptos genéricos (*Hoja Verde, Tomate Huerta, Menestra Vapor, Avena Pura, Quinoa Real, Garbanzos Bio, AOVE*); el sistema asigna automáticamente un producto real disponible de Ecoland.
  * **Explorador Completo del Catálogo (+1.000 productos):** Desplegable para explorar todas las referencias con buscador integrado y botones de lanzamiento directo (`+Lanzar`).
  * **Arrastre Real (Drag & Drop):** Las 4 facciones del plato son zonas interactivas que se iluminan al pasar un producto por encima con el ratón o el dedo y lo agregan al soltarlo.
  * **Planificador de Horizonte Temporal (De 1 Semana a 1 Año):** Permite calcular el aprovisionamiento para 1 semana (14 comidas), 1 mes (60 comidas), 1 mes y medio, 2 meses, 3 meses, 6 meses o 1 año.
  * **Barra de Progreso y Cumplimiento:** Mide en kilos reales cuánto llevas acumulado frente al objetivo del periodo (ej. 15 kg de verduras para 1 mes para 2 personas) y te avisa: *«🥦 Ya tienes muchos granos; arroja hortalizas a tus alimentos para tener una dieta balanceada»*.
  * **Cálculo Nutricional Completo:** Suma en vivo calorías (kcal), proteínas (g), fibra prebiótica (g) y verifica 5 micronutrientes esenciales: Vitamina C, Hierro vegetal, Calcio biodisponible, Magnesio/Potasio y Polifenoles/AOVE.
  * **Compra en 1 Clic:** Botón para añadir todos los productos del plato al carrito con el importe total exacto.

#### 2.2. Calculadora de Gasto Energético (TDEE & BMR)
* **Qué hace:**
  * Aplica la fórmula médica de **Mifflin-St Jeor** tomando sexo, edad, peso, altura y 4 niveles de actividad física (sedentario, ligero, moderado, muy activo).
  * Calcula el Metabolismo Basal (BMR) y el Gasto Diario Total (TDEE).
  * Adapta las calorías recomendadas según el objetivo del usuario: Déficit calórico para perder grasa (-400 kcal), Mantenimiento o Superávit para masa muscular (+350 kcal).
  * Permite sincronizar la meta calórica directamente con el Diario Nutricional en un clic.

#### 2.3. Diario Nutricional & Conteo de Calorías
* **Qué hace:**
  * Registro de comidas por tomas: Desayuno, Comida, Cena y Snacks.
  * Barra de progreso calórico frente al objetivo diario.
  * Desglose en tiempo real de los 4 macronutrientes: Proteínas, Carbohidratos, Grasas y Fibra dietética.
  * Registro de consumo de agua con medidor visual (en vasos de 250ml hasta alcanzar 2 litros diarios).
  * Añadir alimentos preconfigurados de Ecoland o registrar comidas personalizadas.

#### 2.4. Optimizador de Presupuesto Saludable
* **Qué hace:**
  * Algoritmo dinámico que genera cestas semanales completas de **8 a 15 alimentos bio esenciales** con la máxima densidad nutricional por euro invertido.
  * Selector libre de presupuesto de 20€ a 150€ con presets rápidos (30€, 50€, 75€, 100€).
  * Configurable para 1, 2 o 4 personas durante 3, 5 o 7 días.
  * Calcula el coste estimado por comida individual y permite eliminar productos puntuales o añadir la cesta completa a la tienda en un solo clic.

#### 2.5. Escáner EAN de Código de Barras
* **Qué hace:**
  * Búsqueda por número de código de barras o apertura de la cámara web/móvil para escanear productos.
  * Muestra ficha nutricional rápida, grado de procesamiento y alternativas biológicas de Ecoland sin aditivos ni azúcares añadidos.

#### 2.6. Comparador Nutricional Cara a Cara
* **Qué hace:**
  * Enfrenta dos productos (un ultraprocesado convencional frente a una alternativa biológica de Ecoland, por ejemplo galletas convencionales vs. galletas bio de espelta sin azúcares añadidos).
  * Destaca diferencias en ingredientes, aditivos químicos, tipo de grasas (palma vs. AOVE) y precio por kilo.

#### 2.7. Despensa Inteligente & Alertas de Caducidad
* **Qué hace:**
  * Inventario de alimentos comprados con días restantes de consumo preferente.
  * Semáforo visual: Verde (óptimo), Amarillo (próximo a caducar) y Rojo (consumir ya).
  * Botón directo de recompra para reponer productos que se están agotando.

#### Limitaciones de la Suite EcoHealth:
* Los datos del diario, despensa y perfil se almacenan localmente en el navegador (`localStorage`). Si el usuario limpia las cookies o entra desde otro ordenador, los datos no se sincronizan automáticamente sin una cuenta en base de datos.
* La cámara del escáner EAN depende de la luz ambiental y la resolución de la lente del usuario.

---

### MÓDULO 3: CHEF IA & RECETAS SALUDABLES (`/blog`)

#### Qué hace:
1. **Chef IA: ¿Qué tienes en tu nevera? (Cero Desperdicio):**
   * Selector rápido de ingredientes comunes de despensa (*Garbanzos, Avena, Lentejas, Tomate, Espinacas, Quinoa, AOVE, Ajo, etc.*) + campo libre para escribir cualquier alimento sobrante.
   * Filtros de preferencia: 100% Vegana, Sin Gluten, Alta en Proteína o Rápida.
   * **Generación algorítmica de recetas en 1 segundo:**
     * Título gastronómico atractivo, tiempo de preparación (10-20 min), calorías y proteínas.
     * Lista de ingredientes que ya tienes en casa (en verde ✓).
     * **Identificación de ingredientes complementarios de Ecoland:** Muestra qué producto bio te falta con foto y precio.
     * Botón: *«Añadir los ingredientes que me faltan al carrito por X.XX€»*.
     * Instrucciones de cocinado saludables paso a paso.
2. **Recetario Curado Oficial:**
   * Recetas destacadas creadas por nutricionistas (ej. *Buddha Bowl Proteico, Crema de Calabaza y Cúrcuma, Porridge de Avena y Chía*).
   * Enlaces directos a los productos del catálogo para cocinarlas.

#### Qué no hace todavía:
* No guarda un cuaderno de recetas favoritas del usuario en la nube.
* No permite a la comunidad de clientes subir fotos de sus propios platos.

---

### MÓDULO 4: CESTAS Y PACKS TEMÁTICOS (`/packs`)

#### Qué hace:
* Agrupaciones inteligentes listas para comprar: Cesta Inicio Bio, Cesta Gourmet Castilla y León, Pack Proteico Natural, Vegano Fácil, Sin Gluten Seguro, etc.
* Muestra el precio del lote y el ahorro porcentual respecto a la compra de productos individuales.
* Adición del pack entero a la cesta en un solo clic.

#### Limitaciones:
* Los productos del pack son fijos; no se pueden sustituir ingredientes individuales por otros dentro de la misma cesta sin editar el carrito.

---

### MÓDULO 5: TEST NUTRICIONAL GUIADO (`/quiz`)

#### Qué hace:
* Asistente interactivo de 5 preguntas sobre hábitos de vida, alergias, objetivos de salud y nivel de actividad.
* Genera una recomendación de productos afines para empezar a cuidarse.

#### Limitaciones:
* No envía el informe en PDF por correo electrónico de forma automática (solo se visualiza en pantalla).

---

### MÓDULO 6: SUSCRIPCIONES Y COMPRA RECURRENTE (`/suscripcion`)

#### Qué hace:
* Permite seleccionar productos de consumo habitual (bebidas vegetales, copos de avena, legumbres cocidas, aceites) y programar su entrega con un 10% de descuento.
* Frecuencias configurables: Semanal, Quincenal o Mensual.
* Interfaz para pausar o saltar entregas.

#### Limitaciones:
* La recurrencia bancaria está simulada en frontend; para hacer cargos periódicos en la tarjeta del cliente cada 30 días se requiere conectar Stripe Billing o Redsys suscripciones.

---

### MÓDULO 7: CLUB ECOLAND & FIDELIZACIÓN (`/club`)

#### Qué hace:
* Gamificación con 3 niveles de socio (*Semilla*, *Brote*, *Árbol Bio*).
* Acumulación de puntos por compras, por reciclar envases y por traer bolsa propia a la tienda física.
* Cupones y recompensas canjeables.

#### Limitaciones:
* Para que un cliente acumule puntos al comprar en el mostrador físico de Valladolid, el TPV físico debe compartir la misma base de datos de usuarios que la web.

---

### MÓDULO 8: CARRITO Y PASARELA DE CHECKOUT

#### Qué hace:
* Cajón lateral deslizable (*Drawer*) accesible desde cualquier página.
* Cálculo en vivo de subtotal, impuestos y barra de envío gratuito (gratis a partir de 49€).
* Modalidad de entrega dual (Omnicanal):
  1. **Envío a domicilio en 24/48h** (con embalaje ecológico y refrigerado si procede).
  2. **Recogida gratuita en tienda física (Click & Collect)** en Valladolid.
* Formulario completo con validación de datos de envío y facturación con NIF/CIF.

#### Limitaciones:
* El cobro en dinero real está en modo simulación de prueba; no procesa cobros reales hasta que la empresa introduzca las credenciales bancarias de producción (TPV Redsys / Stripe).
* No envía correo electrónico de confirmación automático (requiere configurar el servidor SMTP con Resend o SendGrid).

---

## 4. CUADRO RESUMEN DE ESTADO DEL PROYECTO

| Área / Módulo | Estado Actual | ¿Operativo en Localhost? | Requisito para Producción Comercial |
| :--- | :---: | :---: | :--- |
| **Catálogo Real (+1.000 productos)** | Terminado | SÍ | Conectar con ERP/TPV para inventario en vivo. |
| **Plato Harvard Interactivo** | Terminado | SÍ | Listo para producción. |
| **Planificador por Horizontes (Semana a Año)** | Terminado | SÍ | Listo para producción. |
| **Chef IA de la Nevera** | Terminado | SÍ | Listo para producción. |
| **Calculadora TDEE Mifflin-St Jeor** | Terminado | SÍ | Listo para producción. |
| **Diario Nutricional y Macros** | Terminado | SÍ | Migrar persistencia de `localStorage` a Supabase/PostgreSQL. |
| **Optimizador de Presupuesto** | Terminado | SÍ | Listo para producción. |
| **Carrito y Click & Collect** | Terminado | SÍ | Listo para producción. |
| **Pasarela Bancaria Real** | Simulación | SÍ | Introducir credenciales bancarias de Stripe/Redsys. |
| **Correos Transaccionales** | Pendiente | NO | Activar servidor de correo (Resend / SendGrid). |

---

## 5. GUÍA PARA EL USUARIO: CÓMO PROBAR LA APLICACIÓN

1. Abre tu navegador en **`http://localhost:8080`**.
2. **Plato Harvard y Planificador:** Entra en **EcoHealth** (`/ecohealth`).
   * Verás el banner no intrusivo para configurar tu perfil.
   * Cambia el horizonte a **1 Mes** o **1 Semana** y observa cómo la barra calcula las raciones totales para tu hogar.
   * Pulsa **«Abrir todo el catálogo (+1.000)»** para ver todos los alimentos y arrástralos al plato.
3. **Chef IA de la Nevera:** Entra en **Recetas** (`/blog`).
   * Marca los ingredientes que tienes en casa y pulsa **«Crear receta mágica con mi nevera»**.
   * Revisa la receta generada y prueba el botón de añadir los ingredientes que faltan a la cesta.
4. **Carrito:** Pulsa el icono de la bolsa de la esquina superior derecha para ver el desglose económico y la opción de recogida en tienda física.

---
*Informe generado automáticamente por el equipo de ingeniería de Antigravity.*
