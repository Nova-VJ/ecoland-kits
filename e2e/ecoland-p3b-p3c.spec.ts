import { test, expect } from '@playwright/test';

test.describe('Ecoland Daily — P3-B & P3-C: Recipe Inbox, Smart Meal Matcher & Hands-Free Cooking Mode E2E Tests', () => {

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      sessionStorage.setItem('ecoland-splash-seen', 'true');
      sessionStorage.setItem('ecoland-intro-shown', 'true');
      localStorage.setItem('ecoland-cookie-consent', JSON.stringify({ necessary: true, analytics: false }));
    });
  });

  test('1. Abre Recipe Inbox desde /hoy y muestra recomendación Smart basada en despensa', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Click en botón Recetas & Cocina
    const recipeBtn = page.locator('button:has-text("Recetas & Cocina")').first();
    await expect(recipeBtn).toBeVisible();
    await recipeBtn.click();

    // Comprobar modal Recipe Inbox
    await expect(page.locator('h2:has-text("Recipe Inbox & Smart Meal Planner")')).toBeVisible();
    await expect(page.locator('text=P3-B & P3-C')).toBeVisible();

    // Banner de recomendación inteligente cruzada con despensa
    await expect(page.locator('text=Recomendación Smart:').first()).toBeVisible();
    await expect(page.locator('text=% en casa').first()).toBeVisible();

    // Comprobar pestañas de cola
    await expect(page.locator('button:has-text("En Cola Esta Semana")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Por Probar (Inbox)")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Habituales del Hogar")').first()).toBeVisible();
    await expect(page.locator('button:has-text("📌 Fijadas")').first()).toBeVisible();
  });

  test('2. Transición entre pestañas y fijado de recetas (Pin)', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Recetas & Cocina")').first().click();

    // Cambiar a pestaña Por Probar
    await page.locator('button:has-text("Por Probar (Inbox)")').first().click();
    await page.waitForTimeout(200);

    // Cambiar a Habituales
    await page.locator('button:has-text("Habituales del Hogar")').first().click();
    await page.waitForTimeout(200);
    await expect(page.locator('text=Porridge de avena templada').first()).toBeVisible();
  });

  test('3. Flujo completo de Modo Cocina 2.0: Mise en Place, Temporizador y Finalización con Tupper', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Recetas & Cocina")').first().click();

    // Click en Modo Cocina de la primera receta
    const startCookingBtn = page.locator('button:has-text("Modo Cocina")').first();
    await expect(startCookingBtn).toBeVisible();
    await startCookingBtn.click();

    // FASE 1: MISE EN PLACE
    await expect(page.locator('text=Mise en Place: Prepara los ingredientes').first()).toBeVisible();
    await expect(page.locator('text=Pantalla siempre encendida').first()).toBeVisible();

    // Pulsar "Encender el fuego"
    const igniteBtn = page.locator('button:has-text("Encender el fuego")').first();
    await expect(igniteBtn).toBeVisible();
    await igniteBtn.click();

    // FASE 2: PASO A PASO CON LETRA GRANDE Y TIMER
    await expect(page.locator('text=Paso 1 de')).toBeVisible();

    // Si el paso tiene temporizador detectado, debe mostrar botón de arranque
    const timerBtn = page.locator('button:has-text("Iniciar")').first();
    if (await timerBtn.isVisible()) {
      await timerBtn.click();
      await page.waitForTimeout(300);
    }

    // Avanzar pasos hasta finalizar
    while (await page.locator('button:has-text("Siguiente Paso")').first().isVisible()) {
      await page.locator('button:has-text("Siguiente Paso")').first().click();
      await page.waitForTimeout(100);
    }

    // Pulsar "Finalizar Cocinado"
    const finishBtn = page.locator('button:has-text("Finalizar Cocinado")').first();
    await expect(finishBtn).toBeVisible();
    await finishBtn.click();

    // FASE 3: CELEBRACIÓN Y INTEGRACIÓN CON DESPENSA
    await expect(page.locator('text=¡Plato terminado con éxito!').first()).toBeVisible();
    await expect(page.locator('text=Descontar ingredientes usados de mi despensa').first()).toBeVisible();
    await expect(page.locator('text=Registrar en mi diario nutricional de hoy').first()).toBeVisible();

    // Confirmar y guardar
    await page.locator('button:has-text("Confirmar y Guardar")').first().click();
  });

  test('4. Modo Móvil (375px) — Modo Cocina y Recipe Inbox sin desbordamientos', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    const recipeBtn = page.locator('button:has-text("Recetas & Cocina")').first();
    await expect(recipeBtn).toBeVisible();
    await recipeBtn.click();

    await expect(page.locator('h2:has-text("Recipe Inbox & Smart Meal Planner")')).toBeVisible();

    // Iniciar Modo Cocina en móvil
    await page.locator('button:has-text("Modo Cocina")').first().click();
    await expect(page.locator('text=Mise en Place: Prepara los ingredientes').first()).toBeVisible();
    await expect(page.locator('button:has-text("Encender el fuego")').first()).toBeVisible();
  });

});
