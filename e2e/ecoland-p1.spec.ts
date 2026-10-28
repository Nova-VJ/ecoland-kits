import { test, expect } from '@playwright/test';

test.describe('Ecoland Daily — P1 Daily Intelligence E2E Tests', () => {

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      sessionStorage.setItem('ecoland-splash-seen', 'true');
      sessionStorage.setItem('ecoland-intro-shown', 'true');
      localStorage.setItem('ecoland-cookie-consent', JSON.stringify({ necessary: true, analytics: false }));
      localStorage.removeItem('ecoland_pantry_v1'); // Asegurar estado limpio de despensa
    });
  });

  test('1. Contextual Adaptive UI en /hoy y rótulo "FIBRA" (P1-A Puntos 1 y 2)', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Debe mostrar Ecoland Hoy y saludo contextual
    await expect(page.locator('text=Ecoland Hoy').first()).toBeVisible();

    // Comprobar que el rótulo es exactamente "FIBRA" y NO "Fibra Prebiótica"
    await expect(page.locator('text=Fibra Prebiótica')).toHaveCount(0);
    await expect(page.locator('text=Fibra').first()).toBeVisible();

    // Barra de acciones rápidas de ayer (Repetir con 1 toque o copiar día)
    await expect(page.locator('text=Repetir con 1 toque:').first()).toBeVisible();
    await expect(page.locator('button:has-text("Copiar día completo")')).toBeVisible();
  });

  test('2. Comidas Guardadas y Estimación con Confianza IA (P1-A Puntos 4, 5 y 6)', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Abrir Modal de registro
    await page.locator('button:has-text("Registrar lo que has comido")').first().click();
    await expect(page.locator('text=Registrar Comida en Segundos')).toBeVisible();

    // Probar modo Foto IA con advertencia de aliño/aceite
    const photoTab = page.locator('button:has-text("Foto IA")').first();
    await photoTab.click();
    
    // Seleccionar preset de Bowl Quinoa
    const quinoaPreset = page.locator('button:has-text("Bowl Quinoa")');
    await quinoaPreset.click();

    // Comprobar aviso de confianza sobre aliño/aceite
    await expect(page.locator('text=aliño (aceite)').first()).toBeVisible();

    // Comprobar opción de guardar como comida favorita
    await expect(page.locator('text=comida guardada favorita').first()).toBeVisible();

    // Confirmar y guardar comida
    const confirmBtn = page.locator('button:has-text("Confirmar y Guardar")');
    await confirmBtn.click();

    // Debe cerrarse el modal
    await expect(page.locator('text=Registrar Comida en Segundos')).toHaveCount(0);
  });

  test('3. Completa mi Día 2.0 y Tarjeta "Úsalo pronto" (P1-B Puntos 7 y 8)', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Completa mi día 2.0 con badges y efecto estimado
    await expect(page.locator('text=COMPLETA TU DÍA 2.0').first()).toBeVisible();
    await expect(page.locator('button:has-text("Cocinar con lo que tengo")').first()).toBeVisible();
    await expect(page.locator('text=Impacto estimado en tu día:').first()).toBeVisible();

    // Tarjeta "Evita Desperdicio · Úsalo Pronto"
    await expect(page.locator('text=Evita Desperdicio · Úsalo Pronto').first()).toBeVisible();
    await expect(page.locator('text=Dame ideas con estos alimentos').first()).toBeVisible();
  });

  test('4. Mi Semana (/semana) — Planificador Semanal y Nutrición por Euro (P1-D Puntos 11, 13 y 14)', async ({ page }) => {
    await page.goto('/semana');
    await page.waitForLoadState('networkidle');

    // Comprobar título del planificador semanal
    await expect(page.locator('h1:has-text("Mi Semana en Ecoland")')).toBeVisible();

    // Cambiar selector de comensales (2 personas)
    const twoPersonsBtn = page.locator('button:text-is("2")');
    await expect(twoPersonsBtn).toBeVisible();
    await twoPersonsBtn.click();

    // Cambiar modos de planificación (Solo Cenas)
    const dinnersBtn = page.locator('button:has-text("Solo Cenas")');
    await expect(dinnersBtn).toBeVisible();
    await dinnersBtn.click();

    // Verificar métricas de "Nutrición por Euro"
    await expect(page.locator('text=Nutrición por Euro').first()).toBeVisible();
    await expect(page.locator('text=prot/€').first()).toBeVisible();
    await expect(page.locator('text=fibra/€').first()).toBeVisible();
    await expect(page.locator('text=Coste medio / ración').first()).toBeVisible();
  });

  test('5. Lista de Compra Inteligente con deducción de despensa e inserción en cesta (P1-E Punto 12)', async ({ page }) => {
    await page.goto('/semana');
    await page.waitForLoadState('networkidle');

    // Abrir modal de lista de compra inteligente
    const openListBtn = page.locator('button:has-text("Lista de Compra")').first();
    await expect(openListBtn).toBeVisible();
    await openListBtn.click();

    // Validar visualización modal y separación "Te falta comprar" vs "Ya tienes en casa"
    await expect(page.locator('text=Lista de la Compra de Tu Semana')).toBeVisible();
    await expect(page.locator('text=Te falta comprar')).toBeVisible();
    await expect(page.locator('text=Ya tienes en casa').first()).toBeVisible();

    // Añadir faltantes al carrito de Ecoland
    const addToCartBtn = page.locator('button:has-text("Añadir faltantes al carrito")');
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // Debe mostrar toast de confirmación
    await expect(page.locator('text=añadidos a tu cesta').first()).toBeVisible({ timeout: 5000 });
  });

  test('6. Resumen Semanal 2.0 con variedad de plantas (P1-F Puntos 15 y 16)', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Abrir diálogo de progreso semanal
    const weeklyBtn = page.locator('button:has-text("Ver Mi Semana en Ecoland")');
    await expect(weeklyBtn).toBeVisible();
    await weeklyBtn.click();

    // Validar las 3 preguntas clave del progreso semanal
    await expect(page.locator('text=1. ¿Qué hiciste esta semana?')).toBeVisible();
    await expect(page.locator('text=2. ¿Qué cambió respecto a tu propia media?')).toBeVisible();
    await expect(page.locator('text=3. ¿Qué puedes probar la próxima semana?')).toBeVisible();

    // Validar indicador de variedad vegetal (plantas diferentes)
    await expect(page.locator('text=Variedad vegetal esta semana')).toBeVisible();
    await expect(page.locator('text=plantas').first()).toBeVisible();
  });

  test('7. Seguimiento Opcional de Peso con Tendencia Suavizada (P1-F Puntos 17 y 18)', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Activar el seguimiento de peso si está desactivado
    const activateBtn = page.locator('button:has-text("Activar registro")');
    if (await activateBtn.isVisible()) {
      await activateBtn.click();
    }

    // Comprobar que ahora se ve la tarjeta de peso con tendencia suavizada
    await expect(page.locator('text=Evolución y Tendencia de Peso')).toBeVisible();

    // Añadir un nuevo registro de peso
    const weightInput = page.locator('input[placeholder*="Peso de hoy en kg"]');
    await weightInput.fill('70.5');
    await page.locator('button:text-is("Anotar")').click();

    // Debe mostrar toast de registro
    await expect(page.locator('text=Peso anotado').first()).toBeVisible({ timeout: 5000 });
  });

  test('8. Checkout: Pedidos → Despensa Inteligente (P1-C Punto 10)', async ({ page }) => {
    // Añadir un producto al carrito visitando /tienda
    await page.goto('/tienda');
    await page.waitForLoadState('networkidle');

    // Añadir primer producto al carrito
    const addBtn = page.locator('button:has-text("Añadir")').first();
    await addBtn.click();
    await page.waitForTimeout(500);

    // Ir a Checkout
    const checkoutLink = page.locator('a[href="/checkout"]').first();
    if (await checkoutLink.isVisible()) {
      await checkoutLink.click();
    } else {
      await page.goto('/checkout');
    }
    await page.waitForLoadState('networkidle');

    // Rellenar datos obligatorios
    await page.fill('input[placeholder="Ej: Laura"]', 'Carlos');
    await page.fill('input[placeholder="Ej: Martín Gómez"]', 'García');
    await page.fill('input[placeholder="tu@email.com"]', 'test@ecoland.es');
    await page.fill('input[placeholder="600 000 000"]', '611223344');

    // Paso 1: Seleccionar recogida Click & Collect
    const clickCollectBox = page.locator('text=Recogida en Tienda');
    if (await clickCollectBox.isVisible()) {
      await clickCollectBox.click();
    } else {
      await page.fill('input[placeholder="Calle, número, piso, puerta"]', 'Calle Mayor 12');
    }

    // Avanzar a paso 2 (Pago)
    const nextBtn = page.locator('button:has-text("Continuar al Pago Seguro")');
    await nextBtn.click();

    // Paso 2: Confirmar pedido simulado
    const confirmOrderBtn = page.locator('button:has-text("Pagar")');
    await confirmOrderBtn.click();

    // Esperar pantalla de confirmación exitosa
    await expect(page.locator('text=Transacción Confirmada y Facturada')).toBeVisible({ timeout: 10000 });

    // Validar presencia del prompt explícito: "¿Añadir estos productos a tu despensa inteligente?"
    await expect(page.locator('text=¿Añadir estos productos a tu despensa inteligente?')).toBeVisible();
    await expect(page.locator('button:has-text("Añadir a mi despensa")')).toBeVisible();
    await expect(page.locator('button:has-text("No ahora")')).toBeVisible();

    // Click en "Añadir a mi despensa"
    await page.locator('button:has-text("Añadir a mi despensa")').click();

    // Comprobar mensaje de confirmación
    await expect(page.locator('text=Productos añadidos a tu despensa con fecha de compra de hoy')).toBeVisible();
  });

});
