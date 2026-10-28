import { test, expect } from '@playwright/test';

test.describe('Ecoland Daily — P3-D & P3-E: Zero-Friction Pantry & Resilient Offline Core E2E Tests', () => {

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      sessionStorage.setItem('ecoland-splash-seen', 'true');
      sessionStorage.setItem('ecoland-intro-shown', 'true');
      localStorage.setItem('ecoland-cookie-consent', JSON.stringify({ necessary: true, analytics: false }));
    });
  });

  test('1. /hoy muestra el indicador discreto de sincronización offline', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Indicador discreto
    const indicator = page.locator('text=Todo sincronizado').first();
    await expect(indicator).toBeVisible();
  });

  test('2. Abre Despensa Zero-Friction y visualiza prompt de pedido entregado', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Pulsar botón Mi Despensa
    const pantryBtn = page.locator('button:has-text("Mi Despensa")').first();
    await expect(pantryBtn).toBeVisible();
    await pantryBtn.click();

    // Modal abierto
    await expect(page.locator('h2:has-text("Despensa Zero-Friction")')).toBeVisible();
    await expect(page.locator('text=P3-D Core')).toBeVisible();

    // Prompt de pedido Ecoland entregado
    await expect(page.locator('text=Tu pedido Ecoland #ECO-DELIV-908 ha llegado')).toBeVisible();
    await expect(page.locator('button:has-text("Añadir todo")')).toBeVisible();

    // Comprobar checkbox de auto-importación futura (Opt-in)
    const autoImportLabel = page.locator('text=Añadir automáticamente futuros pedidos (Opt-in)');
    await expect(autoImportLabel).toBeVisible();
  });

  test('3. Honestidad de fechas: muestra "Fecha no registrada" cuando no existe fecha de etiqueta', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Mi Despensa")').first().click();

    // Los tomates frescos ecológicos no tienen fecha real -> "Fecha no registrada"
    await expect(page.locator('text=Fecha no registrada').first()).toBeVisible();

    // Los huevos o avena tienen fecha real
    await expect(page.locator('text=Caduca: 2026-12-15').first()).toBeVisible();
  });

  test('4. Estados rápidos (1-tap): marca "Consumí esto (+diario)" y cierra modal', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Mi Despensa")').first().click();

    // Pulsar botón Consumí esto (+diario)
    const consumeBtn = page.locator('button:has-text("Consumí esto (+diario)")').first();
    await expect(consumeBtn).toBeVisible();
    await consumeBtn.click();

    await page.waitForTimeout(300);

    // Cerrar modal
    await page.locator('.fixed button:has-text("X"), .fixed button:has(.lucide-x)').first().click();
  });

  test('5. Auditoría rápida ("Revisar mi despensa") flujo de tarjetas', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Mi Despensa")').first().click();

    // Click en "Revisar mi despensa"
    const auditBtn = page.locator('button:has-text("Revisar mi despensa")').first();
    await expect(auditBtn).toBeVisible();
    await auditBtn.click();

    // Modo auditoría activo con los 4 botones
    await expect(page.locator('text=Auditoría Rápida (1 de')).toBeVisible();
    await expect(page.locator('button:has-text("Está bien")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Queda poco")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Se acabó")').first()).toBeVisible();
    await expect(page.locator('button:has-text("No lo tengo")').first()).toBeVisible();

    // Confirmar primer item
    await page.locator('button:has-text("Está bien")').first().click();
    await page.waitForTimeout(200);

    // Finalizar auditoría
    await page.locator('button:has-text("Finalizar")').first().click();
  });

  test('6. Modo Móvil (375px) — Despensa Zero-Friction y navegación sin desbordamientos', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Indicador y botón visibles en móvil
    await expect(page.locator('text=Todo sincronizado').first()).toBeVisible();

    const pantryBtn = page.locator('button:has-text("Mi Despensa")').first();
    await expect(pantryBtn).toBeVisible();
    await pantryBtn.click();

    await expect(page.locator('h2:has-text("Despensa Zero-Friction")')).toBeVisible();

    // Botones de filtro de ubicación scrolleables/visibles
    await expect(page.locator('button:has-text("Todas")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Nevera")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Congelador")').first()).toBeVisible();
  });

});
