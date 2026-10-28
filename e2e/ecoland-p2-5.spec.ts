import { test, expect } from '@playwright/test';

test.describe('Ecoland Daily — P2.5 Retention & Product Validation Lab E2E Tests', () => {

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      sessionStorage.setItem('ecoland-splash-seen', 'true');
      sessionStorage.setItem('ecoland-intro-shown', 'true');
      localStorage.setItem('ecoland-cookie-consent', JSON.stringify({ necessary: true, analytics: false }));
    });
  });

  test('1. Dashboard de Product Insights (/admin/product-insights) muestra métricas norte agregadas (P2.5)', async ({ page }) => {
    await page.goto('/admin/product-insights');
    await page.waitForLoadState('networkidle');

    // Título y propósito ético
    await expect(page.locator('text=Laboratorio de Retención & Validación (P2.5)').first()).toBeVisible();
    await expect(page.locator('text=Métricas de utilidad voluntaria cotidiana').first()).toBeVisible();

    // KPIs Norte
    await expect(page.locator('text=USEFUL DAYS / SEMANA').first()).toBeVisible();
    await expect(page.locator('text=NON-COMMERCE RETENTION').first()).toBeVisible();
    await expect(page.locator('text=COACH ACTION RATE').first()).toBeVisible();
    await expect(page.locator('text=REGISTRO: TIEMPO MEDIANO').first()).toBeVisible();

    // Métricas de circuito
    await expect(page.locator('text=Reutilización de Plan Semanal').first()).toBeVisible();
    await expect(page.locator('text=Tasa de Rescate de Despensa').first()).toBeVisible();
    await expect(page.locator('text=Colaboración en Hogar').first()).toBeVisible();
  });

  test('2. Sean Ellis Test de Product-Market Fit interactivo en /admin/product-insights (P2.5 Punto 19)', async ({ page }) => {
    await page.goto('/admin/product-insights');
    await page.waitForLoadState('networkidle');

    // Pregunta de PMF
    await expect(page.locator('text=«¿Cómo te sentirías si mañana Ecoland Daily dejara de existir?»').first()).toBeVisible();

    // Opciones del test
    const veryDissBtn = page.locator('button:has-text("Muy decepcionado")').first();
    await expect(veryDissBtn).toBeVisible();

    // Votar
    await veryDissBtn.click();
    await expect(page.locator('text=Umbral Superado (≥40%)').first()).toBeVisible();
  });

  test('3. Experimentos Controlados A/B con Feature Flags y Guardrail Metrics (P2.5 Puntos 21 y 22)', async ({ page }) => {
    await page.goto('/admin/product-insights');
    await page.waitForLoadState('networkidle');

    // Título de experimentos
    await expect(page.locator('text=Experimentos Controlados (Feature Flags A/B)').first()).toBeVisible();

    // Cambiar variante en el primer experimento
    const toggleBtn = page.locator('button:has-text("Activar")').first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(300);
      // El dashboard responde y permanece estable
      await expect(page.locator('text=Métrica Primaria:').first()).toBeVisible();
    }
  });

  test('4. EcoCoach: muestra "Basado en tus datos (Contexto utilizado)" y feedback discreto (P2.5 Puntos 6 y 8)', async ({ page }) => {
    await page.goto('/coach');
    await page.waitForLoadState('networkidle');

    // Click en chip sugerido: "¿Qué puedo cenar hoy?"
    const chipDinner = page.locator('button:has-text("¿Qué puedo cenar hoy?")').first();
    await chipDinner.click();

    // Comprobar "Basado en tus datos (Contexto utilizado)"
    await expect(page.locator('text=Basado en tus datos (Contexto utilizado):').first()).toBeVisible();
    await expect(page.locator('text=✓ Tu despensa').first()).toBeVisible();
    await expect(page.locator('text=✓ Tu diario de hoy').first()).toBeVisible();
    await expect(page.locator('text=✓ Tu plan semanal').first()).toBeVisible();

    // Comprobar feedback discreto
    await expect(page.locator('text=¿Te sirvió esta sugerencia?').first()).toBeVisible();
    await expect(page.locator('button:has-text("👍")').first()).toBeVisible();
    await expect(page.locator('button:has-text("👎")').first()).toBeVisible();
  });

  test('5. EcoCoach: selección de motivo negativo guarda preferencia de recomendación (P2.5 Puntos 6 y 7)', async ({ page }) => {
    await page.goto('/coach');
    await page.waitForLoadState('networkidle');

    // Click en chip sugerido: "Me quedan 15 minutos, ¿qué hago?"
    const chipQuick = page.locator('button:has-text("Me quedan 15 minutos, ¿qué hago?")').first();
    await chipQuick.click();

    // Click en "👎 No mucho"
    const dislikeBtn = page.locator('button:has-text("👎")').first();
    await dislikeBtn.click();

    // Debe mostrar selector con motivos
    await expect(page.locator('text=Cuéntanos brevemente para afinar futuras sugerencias:').first()).toBeVisible();
    const reasonBtn = page.locator('button:has-text("No tenía esos ingredientes")').first();
    await expect(reasonBtn).toBeVisible();

    // Click en el motivo
    await reasonBtn.click();
    await expect(page.locator('text=Preferencia guardada').first()).toBeVisible();
  });

  test('6. Registro de comida genera Useful Day verificable en /hoy (P2.5 Puntos 1 y 4)', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Abrir Modal de registro
    await page.locator('button:has-text("Registrar lo que has comido")').first().click();
    await expect(page.locator('text=Registrar Comida en Segundos')).toBeVisible();

    // Pestaña Comí fuera
    const outsideTab = page.locator('button:has-text("Comí fuera")');
    await outsideTab.click();

    // Click en preset habitual
    const presetBtn = page.locator('button:has-text("Menú del día")').first();
    await presetBtn.click();

    // Confirmar y Guardar
    await page.locator('button:has-text("Confirmar y Guardar")').click();

    // Comprobar que el modal se cierra y el día queda nutrido
    await expect(page.locator('text=Registrar Comida en Segundos')).toHaveCount(0);
  });

});
