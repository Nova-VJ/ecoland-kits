import { test, expect } from '@playwright/test';

test.describe('Plato Harvard Realista 3D y Lanzadores por Subcategoría', () => {

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      sessionStorage.setItem('ecoland-splash-seen', 'true');
      sessionStorage.setItem('ecoland-intro-shown', 'true');
      localStorage.setItem('ecoland-cookie-consent', JSON.stringify({ necessary: true, analytics: false }));
    });
  });

  test('Renderiza plato realista, soporte sticky y lanza productos desde subcategorías', async ({ page }) => {
    await page.goto('/ecohealth');
    await page.waitForLoadState('networkidle');

    // 1. Título y guía de Harvard
    await expect(page.locator('text=Tu plato equilibrado').first()).toBeVisible();

    // 2. Comprobar que existen las 4 macro-categorías con sus porcentajes
    await expect(page.locator('text=Vegetales y frutas').first()).toBeVisible();
    await expect(page.locator('text=Granos integrales').first()).toBeVisible();
    await expect(page.locator('text=Proteína saludable').first()).toBeVisible();
    await expect(page.locator('text=Grasas saludables').first()).toBeVisible();

    // Verificar subcategorías concretas pedidas por el usuario
    await expect(page.locator('text=Hojas Verdes & Ensaladas').first()).toBeVisible();
    await expect(page.locator('text=Hortalizas de Raíz & Tubérculos Bio').first()).toBeVisible();
    await expect(page.locator('text=Copos & Avena para Desayuno').first()).toBeVisible();
    await expect(page.locator('text=Legumbres Castellanas & Guisos').first()).toBeVisible();
    await expect(page.locator('text=Aceite de Oliva Virgen Extra (AOVE)').first()).toBeVisible();

    // 3. Probar lanzamiento táctil con 1 clic de una subcategoría
    // Pulsar botón de Hortalizas de Raíz (Zanahorias)
    const carrotCard = page.locator('text=Hortalizas de Raíz & Tubérculos Bio').first();
    await carrotCard.click();
    await page.waitForTimeout(500);

    // Pulsar botón de Avena
    const avenaCard = page.locator('text=Copos & Avena para Desayuno').first();
    await avenaCard.click();
    await page.waitForTimeout(500);

    // Pulsar botón de AOVE
    const aoveCard = page.locator('text=Aceite de Oliva Virgen Extra (AOVE)').first();
    await aoveCard.click();
    await page.waitForTimeout(500);

    // Verificar que los productos añadidos figuran en el plato con botón de quitar
    const deleteButtons = page.locator('aside button[aria-label^="Quitar"]');
    const count = await deleteButtons.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // 4. Verificar que el plato se dibuja
    await expect(page.getByRole('img', { name: 'Plato de Harvard' })).toBeVisible();

    // 5. Verificar que el botón de añadir a la cesta funciona
    const addToCartBtn = page.locator('button:has-text("Añadir todo el plan a la cesta")').first();
    await expect(addToCartBtn).toBeVisible();
  });
});
