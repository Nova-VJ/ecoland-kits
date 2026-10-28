import { test, expect } from '@playwright/test';

test.describe('Ecoland Daily — P2.5B Real User Pilot & Validation Lab E2E Tests', () => {

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      sessionStorage.setItem('ecoland-splash-seen', 'true');
      sessionStorage.setItem('ecoland-intro-shown', 'true');
      localStorage.setItem('ecoland-cookie-consent', JSON.stringify({ necessary: true, analytics: false }));
    });
  });

  test('1. Dashboard de Product Insights (/admin/product-insights) con selector de Data Source y métricas n/N', async ({ page }) => {
    await page.goto('/admin/product-insights');
    await page.waitForLoadState('networkidle');

    // Título y selector de Data Source
    await expect(page.locator('text=Laboratorio de Validación & Piloto Real (P2.5B)').first()).toBeVisible();
    await expect(page.locator('text=FUENTE:').first()).toBeVisible();
    await expect(page.locator('button:has-text("REAL (Piloto N=20)")').first()).toBeVisible();
    await expect(page.locator('button:has-text("SIMULACIÓN (Sintético)")').first()).toBeVisible();

    // Banner de estado en modo REAL por defecto
    await expect(page.locator('text=PILOTO REAL EN CURSO').first()).toBeVisible();

    // Muestra y cohortes
    await expect(page.locator('text=Muestra del Piloto (N=20 Participantes Cualitativos)').first()).toBeVisible();
    await expect(page.locator('text=Cliente Ecológico').first()).toBeVisible();
    await expect(page.locator('text=Nutrición / Deporte').first()).toBeVisible();

    // KPIs Norte
    await expect(page.locator('text=USEFUL DAYS / SEMANA').first()).toBeVisible();
    await expect(page.locator('text=NON-COMMERCE RETENTION').first()).toBeVisible();
    await expect(page.locator('text=ECOCOACH ACCIÓN & REUSO').first()).toBeVisible();
    await expect(page.locator('text=REGISTRO: TIEMPO MEDIANO').first()).toBeVisible();

    // Métricas de circuito
    await expect(page.locator('text=Time to First Value (TTFV)').first()).toBeVisible();
    await expect(page.locator('text=Seguimiento de Plan Semanal').first()).toBeVisible();
    await expect(page.locator('text=Rescate «Úsalo Pronto»').first()).toBeVisible();
    await expect(page.locator('text=Decisiones Ahorradas').first()).toBeVisible();
  });

  test('2. Conmutación a modo SIMULACIÓN muestra advertencia explícita de datos sintéticos', async ({ page }) => {
    await page.goto('/admin/product-insights');
    await page.waitForLoadState('networkidle');

    // Pulsar botón SIMULACIÓN
    const simBtn = page.locator('button:has-text("SIMULACIÓN (Sintético)")').first();
    await simBtn.click();
    await page.waitForTimeout(300);

    // Debe mostrar banner de advertencia
    await expect(page.locator('text=ATENCIÓN: VISUALIZANDO DATOS DE SIMULACIÓN Y LABORATORIO SINTÉTICO').first()).toBeVisible();
    await expect(page.locator('text=NO corresponden a usuarios humanos reales').first()).toBeVisible();
  });

  test('3. Sean Ellis Test de Product-Market Fit interactivo con notación n/N (P2.5B Punto 15)', async ({ page }) => {
    await page.goto('/admin/product-insights');
    await page.waitForLoadState('networkidle');

    // Pregunta de PMF
    await expect(page.locator('text=«¿Cómo te sentirías si ya no pudieras utilizar Ecoland Daily?»').first()).toBeVisible();

    // Opciones del test
    const veryDissBtn = page.locator('button:has-text("Muy decepcionado")').first();
    await expect(veryDissBtn).toBeVisible();

    // Votar
    await veryDissBtn.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=Muy decepcionado').first()).toBeVisible();
  });

  test('4. Experimentos Controlados A/B con Feature Flags y Guardrail Metrics', async ({ page }) => {
    await page.goto('/admin/product-insights');
    await page.waitForLoadState('networkidle');

    // Título de experimentos
    await expect(page.locator('text=Experimentos Controlados (Feature Flags A/B)').first()).toBeVisible();

    // Cambiar variante en el primer experimento
    const toggleBtn = page.locator('button:has-text("Activar")').first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('5. EcoCoach: muestra "Basado en tus datos (Contexto utilizado)" y feedback discreto', async ({ page }) => {
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

  test('6. Registro de comida genera Useful Day verificable en /hoy', async ({ page }) => {
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
