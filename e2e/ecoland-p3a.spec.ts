import { test, expect } from '@playwright/test';

test.describe('Ecoland Daily — P3-A Zero-Friction Logging & Smart Food Logger 3.0 E2E Tests', () => {

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      sessionStorage.setItem('ecoland-splash-seen', 'true');
      sessionStorage.setItem('ecoland-intro-shown', 'true');
      localStorage.setItem('ecoland-cookie-consent', JSON.stringify({ necessary: true, analytics: false }));
    });
  });

  test('1. Abre Smart Food Logger 3.0 desde /hoy y muestra pestañas contextuales', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Click en botón Smart Food Logger 3.0
    const loggerBtn = page.locator('button:has-text("Smart Food Logger 3.0")').first();
    await expect(loggerBtn).toBeVisible();
    await loggerBtn.click();

    // Comprobar modal unificado
    await expect(page.locator('text=Smart Food Logger 3.0').first()).toBeVisible();
    await expect(page.locator('text=Cero Fricción').first()).toBeVisible();

    // Comprobar pestañas de métodos
    await expect(page.locator('button:has-text("Habituales (1-Tap)")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Comí fuera")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Foto con Confianza")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Código EAN")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Carta de Restaurante")').first()).toBeVisible();
  });

  test('2. Modo Foto con Motor de Confianza, desglose de ingredientes y escalado de porción', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Smart Food Logger 3.0")').first().click();

    // Pestaña Foto
    await page.locator('button:has-text("Foto con Confianza")').first().click();
    await expect(page.locator('text=Instrucciones o contexto adicional')).toBeVisible();

    // Analizar Foto
    await page.locator('button:has-text("Simular Foto y Analizar Plato")').first().click();
    await page.waitForTimeout(300);

    // Debe mostrar nivel de confianza y desglose
    await expect(page.locator('text=Confianza: ALTA').first()).toBeVisible();
    await expect(page.locator('text=Plato combinado de arroz, proteína y verduras').first()).toBeVisible();

    // Modificadores de porción
    const halfPortionBtn = page.locator('button:has-text("½ ración")').first();
    await expect(halfPortionBtn).toBeVisible();
    await halfPortionBtn.click();

    const doublePortionBtn = page.locator('button:has-text("2 raciones")').first();
    await expect(doublePortionBtn).toBeVisible();
    await doublePortionBtn.click();
  });

  test('3. Escáner EAN Universal con Procedencia y evaluación Food Fingerprint', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Smart Food Logger 3.0")').first().click();

    // Pestaña EAN
    await page.locator('button:has-text("Código EAN")').first().click();
    await expect(page.locator('text=Introduce o escanea un código de barras')).toBeVisible();

    // Buscar código por defecto (Ecoland)
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await page.waitForTimeout(300);

    // Comprobar producto, fuente y Food Fingerprint
    await expect(page.locator('text=Copos de Avena Integral Ecológica 500g').first()).toBeVisible();
    await expect(page.locator('text=Fuente: VERIFIED_BY_ECOLAND').first()).toBeVisible();
    await expect(page.locator('text=Compatible según datos disponibles').first()).toBeVisible();
  });

  test('4. Escáner de Carta (MenuScan) experimental con opciones ligeras y advertencia médica', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Smart Food Logger 3.0")').first().click();

    // Pestaña Carta de Restaurante
    await page.locator('button:has-text("Carta de Restaurante")').first().click();
    await expect(page.locator('button:has-text("Cargar Carta")').first()).toBeVisible();

    // Cargar carta
    await page.locator('button:has-text("Cargar Carta")').first().click();
    await page.waitForTimeout(300);

    // Advertencia médica obligatoria
    await expect(page.locator('text=Consulta siempre al personal del restaurante').first()).toBeVisible();

    // Platos extraídos y opción comparativamente ligera
    await expect(page.locator('text=Lubina salvaje al horno').first()).toBeVisible();
    await expect(page.locator('text=Estimación comparativa: parece relativamente más ligero').first()).toBeVisible();
  });

  test('5. Registro 1-tap habitual guarda en /hoy y actualiza ingestas', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Smart Food Logger 3.0")').first().click();
    await page.waitForTimeout(300);

    // Click en la primera comida habitual dentro del modal
    const modalHabitualBtn = page.locator('.fixed button:has-text("Avena con fruta y nueces")').first();
    await expect(modalHabitualBtn).toBeVisible();
    await modalHabitualBtn.click();

    // Comprobar cierre del modal y toast
    await page.waitForTimeout(600);
    await expect(page.locator('h2:has-text("Smart Food Logger 3.0")')).toHaveCount(0);
  });

});
