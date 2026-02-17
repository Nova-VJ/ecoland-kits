

# Plan: Sistema Completo de Dietas del Eco-Coach

## Resumen

Transformar el sistema de dietas del Eco-Coach en una plataforma profesional con edicion de dietas, descarga en PDF, suscripciones periodicas con descuentos y notificaciones via PWA y email.

---

## 1. Mejoras en la Interaccion del Eco-Coach

**Cambios en la Edge Function (`eco-coach/index.ts`):**
- Actualizar el system prompt para que Eco-Coach pregunte explicitamente al usuario si desea guardar la dieta al terminarla
- Eco-Coach asignara un nombre descriptivo y unico a cada dieta (ej: "Dieta Proteica Vegana - Febrero 2026")
- Eco-Coach podra editar dietas existentes si el usuario se lo pide, recibiendo el contenido actual como contexto

**Cambios en `EcoCoach.tsx`:**
- Mejorar el boton de "Aceptar dieta" para que el nombre de la dieta venga del contenido generado por Eco-Coach
- Permitir cargar una dieta existente en el chat para que Eco-Coach la modifique

---

## 2. Gestion de Dietas en el Perfil

**Modificacion de la tabla `saved_diets`:**
- Agregar columna `subscription_active` (boolean, default false)
- Agregar columna `subscription_interval` (text, nullable - 'weekly' o 'monthly')
- Agregar columna `subscription_plan` (text, nullable - '3months', '6months', '1year')
- Agregar columna `subscription_start` (timestamp, nullable)
- Agregar columna `subscription_next_order` (timestamp, nullable)
- Permitir UPDATE en la tabla (nueva RLS policy)

**Nuevo componente `SavedDiets.tsx` mejorado:**
- Vista expandida con lista de productos editables (quitar/agregar)
- Cada producto muestra nombre, precio y boton para eliminar de la dieta
- Boton para agregar nuevos productos buscando en el catalogo
- Boton para enviar la dieta al Eco-Coach para que la edite
- Toggle de suscripcion con selector de frecuencia (semanal/mensual) y plan (3, 6 o 12 meses)
- Boton de descarga en PDF
- Indicador visual de descuento aplicado segun plan

---

## 3. Generacion de PDF Profesional

**Nuevo componente `DietPdfGenerator.ts`:**
- Generacion de PDF usando la API nativa del navegador (canvas + print CSS)
- Encabezado con logo de Ecoland, nombre de la dieta y fecha
- Tabla de productos con nombre, cantidad y precio
- Seccion del plan de comidas con formato profesional
- Pie de pagina con datos de contacto de Ecoland
- Disclaimer: "Esta dieta es orientativa y no sustituye el consejo de un profesional"

---

## 4. Sistema de Suscripcion de Dietas

**Descuentos por compromiso:**
- 3 meses: 10% de descuento
- 6 meses: 15% de descuento (valor sugerido para hacerlo atractivo)
- 1 ano: 20% de descuento (valor sugerido)

**UI de suscripcion en cada dieta guardada:**
- Toggle para activar/desactivar suscripcion
- Selector de frecuencia: semanal o mensual
- Selector de plan: 3 meses, 6 meses, 1 ano
- Resumen del precio con descuento aplicado

---

## 5. PWA (Progressive Web App)

**Archivos necesarios:**
- `public/manifest.json` con nombre "Eco Land", iconos del logo de Ecoland en varios tamanos (192x192, 512x512)
- Service Worker basico para notificaciones push
- Registro del SW en `index.html`
- Meta tags para PWA en `index.html` (theme-color, apple-touch-icon)

Esto permite al usuario "instalar" la app en su telefono o PC con el logo de Ecoland como icono.

---

## 6. Notificaciones

**Edge Function `diet-notifications/index.ts`:**
- Logica para verificar dietas con suscripcion activa cuya fecha de siguiente pedido ha llegado
- Enviar notificacion por email (Resend API, ya configurado para pedidos)
- Contenido del email: recordatorio con resumen de la dieta y enlace para hacer la compra

**Notificaciones en la web app:**
- Usar la API de Notifications del navegador para mostrar recordatorios
- Componente de notificaciones en el header o en la cuenta del usuario

---

## 7. Secuencia de Implementacion

1. Migracion de base de datos (columnas nuevas en `saved_diets`, policy de UPDATE)
2. Actualizar Edge Function `eco-coach` con nuevo prompt
3. Mejorar `SavedDiets.tsx` con edicion de productos, suscripcion y PDF
4. Crear generador de PDF
5. Configurar PWA (manifest.json, service worker, meta tags)
6. Crear edge function de notificaciones por email
7. Integrar notificaciones del navegador

---

## Detalles Tecnicos

**Generacion de PDF:**
Se usara una funcion que genera el PDF en el navegador construyendo el documento con `jspdf` (libreria ligera que se anadira como dependencia). Incluira el logo de Ecoland (`/lovable-uploads/b139a0b4-df8f-4943-9f9e-13a41f2dc4e9.png` o el SVG existente), tipografia profesional, colores de marca y tabla de productos.

**PWA Manifest:**
```text
{
  "name": "Eco Land - Productos Ecologicos",
  "short_name": "Eco Land",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#4a8c3f",
  "background_color": "#ffffff",
  "icons": [logo en 192x192 y 512x512]
}
```

**Tablas modificadas:**
- `saved_diets`: 5 columnas nuevas para suscripcion
- Nueva RLS policy para UPDATE en `saved_diets`

**Nuevas dependencias:**
- `jspdf` para generacion de PDF

**Edge Functions:**
- `eco-coach`: prompt actualizado
- `diet-notifications`: nueva funcion para recordatorios por email (cron job opcional)

