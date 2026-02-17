

# Fix: Menú móvil transparente

## Problema

El menú móvil sigue transparente porque los elementos del menú (overlay + panel) están **dentro** del tag `<header>` que tiene la clase `glass`. Esta clase aplica `background: hsl(0 0% 100% / 0.8)` (fondo blanco al 80% de opacidad) con `backdrop-filter: blur(12px)`. Aunque el panel del menú tiene un `backgroundColor` sólido, al estar anidado dentro del header con glass, el efecto de transparencia del padre afecta la visualización.

## Solución

Mover el bloque completo del menú móvil (`AnimatePresence` con el overlay y el panel) **fuera** del tag `<header>`, para que no herede la clase `glass`. De esta forma el panel del menú tendrá su propio fondo sólido sin interferencia.

## Cambios

**Archivo: `src/components/layout/Header.tsx`**

- Reestructurar el JSX para que el `<AnimatePresence>` con el overlay y el panel del menú móvil se renderice como un elemento hermano del `<header>`, no como hijo
- El componente retornará un fragment (`<>...</>`) con dos elementos: el `<header>` y el `<AnimatePresence>` del menú móvil
- El panel del menú mantendrá `style={{ backgroundColor: 'hsl(var(--card))' }}` para un fondo sólido

## Detalle técnico

Estructura actual (simplificada):
```text
<header class="glass">        <-- fondo semi-transparente
  ...nav desktop...
  <AnimatePresence>
    <div class="overlay" />
    <div style="bg:solid">   <-- panel del menú, pero hereda glass del padre
      ...links...
    </div>
  </AnimatePresence>
</header>
```

Estructura nueva:
```text
<>
  <header class="glass">      <-- fondo semi-transparente solo para el header
    ...nav desktop...
  </header>
  <AnimatePresence>            <-- fuera del header
    <div class="overlay" />
    <div style="bg:solid">     <-- panel con fondo sólido, sin interferencia
      ...links...
    </div>
  </AnimatePresence>
</>
```
