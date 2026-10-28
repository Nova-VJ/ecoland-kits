import { test, expect } from '@playwright/test';

test.describe('Ecoland Hoy — Engagement Diario & Retención Amable (P0 Core)', () => {

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      sessionStorage.setItem('ecoland-splash-seen', 'true');
      sessionStorage.setItem('ecoland-intro-shown', 'true');
      localStorage.setItem('ecoland-cookie-consent', JSON.stringify({ necessary: true, analytics: false }));
    });
  });

  test('1. Acceso a /hoy y renderizado de dashboard diario con saludo y objetivos', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Comprobar presencia de Ecoland Hoy y saludo
    await expect(page.locator('text=Ecoland Hoy').first()).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();

    // Comprobar presencia del botón selector de objetivos de salud
    const goalBtn = page.locator('button:has-text("Tu Objetivo Activo")');
    await expect(goalBtn).toBeVisible();

    // Abrir selector de objetivos y validar que se despliegan metas
    await goalBtn.click();
    await expect(page.locator('text=Comer más equilibrado').first()).toBeVisible();
    await goalBtn.click(); // Cerrar

    // Comprobar presencia del botón de tendencias semanales
    await expect(page.locator('button:has-text("Ver Mi Semana en Ecoland")')).toBeVisible();
  });

  test('2. Registro de comida habitual en 1 solo clic', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Debe existir la tarjeta de comida habitual
    const habitualCard = page.locator('text=Tu desayuno habitual').first();
    await expect(habitualCard).toBeVisible();

    // Click en la comida habitual para registrarla en 1 toque
    await habitualCard.click();

    // Notificación toast de éxito
    await expect(page.locator('text=habitual registrado').first()).toBeVisible({ timeout: 5000 });
  });

  test('3. Contador de agua interactivo', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Comprobar sección de hidratación
    await expect(page.locator('text=Hidratación Diaria').first()).toBeVisible();

    // Click en sumar vaso (+)
    const addWaterBtn = page.locator('button:has-text("Vaso")').first();
    await expect(addWaterBtn).toBeVisible();
    await addWaterBtn.click();
  });

  test('4. Apertura del Modal 5-en-1 de Registro Ultrarrápido', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Click en "+ Registrar lo que has comido"
    const openLogBtn = page.locator('button:has-text("Registrar lo que has comido")').first();
    await openLogBtn.click();

    // Modal debe abrirse con los 5 modos (Escribir, Voz, Foto IA, Código, Catálogo)
    await expect(page.locator('text=Registrar Comida en Segundos')).toBeVisible();
    await expect(page.locator('button:has-text("Escribir")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Voz")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Foto IA")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Código")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Catálogo")').first()).toBeVisible();

    // Probar parseo en modo texto
    const input = page.locator('input[placeholder*="Ej: 2 tostadas"]').first();
    await input.fill('200g de lentejas cocidas');
    await page.locator('button:has-text("Estimar")').first().click();

    // Esperar resultado preliminar
    await expect(page.locator('text=Lentejas').first()).toBeVisible();

    // Confirmar y guardar comida
    const confirmBtn = page.locator('button:has-text("Confirmar y Guardar")').first();
    await confirmBtn.click();
  });

  test('5. Tarjeta "Completa mi día" ofrece sugerencia según despensa', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Debe mostrar la sección Completa mi día
    await expect(page.locator('text=Completa tu día').first()).toBeVisible();
    await expect(page.locator('button:has-text("Cocinar con lo que tengo")').first()).toBeVisible();
  });

  test('6. Diálogo de consistencia semanal amable ("Tu Semana en Ecoland")', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Click en botón "Ver Mi Semana en Ecoland"
    const weeklyBtn = page.locator('button:has-text("Ver Mi Semana en Ecoland")').first();
    await weeklyBtn.scrollIntoViewIfNeeded();
    await weeklyBtn.click();

    // Debe abrirse el diálogo sin culpa punitiva
    await expect(page.locator('text=Consistencia Saludable').first()).toBeVisible();
    await expect(page.locator('text=Tu Semana en Ecoland').first()).toBeVisible();

    // Cerrar diálogo
    const closeBtn = page.locator('button:has-text("Volver a mi día")').first();
    await closeBtn.click();
  });

  test('7. Chef IA en /blog permite registrar receta generada en el diario de hoy', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Buscar generador de recetas Chef IA
    const generateBtn = page.locator('button:has-text("Crear receta mágica con mi nevera")').first();
    await generateBtn.scrollIntoViewIfNeeded();
    await generateBtn.click();

    // Esperar que la receta aparezca
    const logToDayBtn = page.locator('button:has-text("Registrar en mi día")').first();
    await expect(logToDayBtn).toBeVisible({ timeout: 6000 });

    // Registrar en mi día
    await logToDayBtn.click();

    // Debe confirmarse el registro
    await expect(page.locator('text=¡Registrada!').first()).toBeVisible();
  });

});
