import { test, expect } from '@playwright/test';

test.describe('Ecoland P4 — Household Budget, Flexible Planning, Command Palette & Nutritional Export', () => {

  test.beforeEach(async ({ context, page }) => {
    await context.addInitScript(() => {
      sessionStorage.setItem('ecoland-splash-seen', 'true');
      sessionStorage.setItem('ecoland-intro-shown', 'true');
      localStorage.setItem('ecoland-cookie-consent', JSON.stringify({ necessary: true, analytics: false }));
    });

    // Abrir la aplicación
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');
  });

  test('P4-A: Universal Command Palette (⌘K) abre y permite navegar y ejecutar acciones', async ({ page }) => {
    // 1. Abrir con el botón de la barra superior
    const cmdButton = page.locator('button:has-text("Buscar o comando")');
    await expect(cmdButton).toBeVisible();
    await cmdButton.click();

    // 2. Verificar que el modal se abre comprobando el input
    const searchInput = page.locator('input[placeholder*="Escribe un comando"]');
    await expect(searchInput).toBeVisible();

    // 3. Probar filtrado en la barra de búsqueda
    await searchInput.fill('Presupuesto');
    const budgetCmd = page.locator('button:has-text("Ver Presupuesto Familiar")');
    await expect(budgetCmd).toBeVisible();

    // 4. Ejecutar acción de Presupuesto desde el Command Palette
    await budgetCmd.click();

    // 5. Debe haberse abierto el modal de Presupuesto
    await expect(page.getByRole('heading', { name: /Presupuesto Familiar/i })).toBeVisible();
    
    // Cerrar el modal de presupuesto
    await page.locator('button:has-text("Entendido")').click();
    await expect(page.getByRole('heading', { name: /Presupuesto Familiar/i })).not.toBeVisible();

    // 6. Probar apertura mediante atajo de teclado Ctrl+K
    await page.keyboard.press('Control+KeyK');
    await expect(searchInput).toBeVisible();

    // Cerrar pulsando Escape
    await page.keyboard.press('Escape');
    await expect(searchInput).not.toBeVisible();
  });

  test('P4-B: Household Budget Modal muestra coste por ración, ahorro y desglose sin dark patterns', async ({ page }) => {
    // Abrir modal de presupuesto
    const budgetBtn = page.locator('button:has-text("Presupuesto")').first();
    await expect(budgetBtn).toBeVisible();
    await budgetBtn.click();

    // Verificar métricas clave
    await expect(page.getByRole('heading', { name: /Presupuesto Familiar/i })).toBeVisible();
    await expect(page.locator('text=Gastado este mes')).toBeVisible();
    await expect(page.locator('text=Coste medio ración')).toBeVisible();
    await expect(page.locator('text=Ahorro en despensa')).toBeVisible();
    await expect(page.locator('text=Gastos de alimentación registrados')).toBeVisible();

    // Cerrar modal
    await page.locator('button:has-text("Entendido")').click();
    await expect(page.getByRole('heading', { name: /Presupuesto Familiar/i })).not.toBeVisible();
  });

  test('P4-C: Nutritional Export Modal previsualiza datos y muestra descargo médico no clínico obligatorio', async ({ page }) => {
    // Abrir modal de exportación
    const exportBtn = page.locator('button:has-text("Exportar Informe")').first();
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    // Verificar título y estructura
    await expect(page.locator('text=Exportar Informe de Hábitos para Profesionales')).toBeVisible();
    await expect(page.locator('text=Calorías Medias')).toBeVisible();
    await expect(page.locator('text=Fibra Diaria')).toBeVisible();

    // Verificar descargo ético y médico no clínico
    await expect(page.locator('text=Aviso Ético y Legal (No Diagnóstico)')).toBeVisible();
    await expect(page.locator('text=NO constituye un diagnóstico médico')).toBeVisible();

    // Verificar botones de acción (Copiar y Descargar CSV)
    await expect(page.locator('button:has-text("Copiar Texto")')).toBeVisible();
    await expect(page.locator('button:has-text("Descargar CSV")')).toBeVisible();

    // Cerrar modal haciendo clic en el botón X
    const closeBtn = page.locator('button.rounded-full:has(svg.lucide-x)');
    await closeBtn.first().click();
    await expect(page.locator('text=Exportar Informe de Hábitos para Profesionales')).not.toBeVisible();
  });

  test('P4-D: Mi Semana permite seleccionar Días Flexibles (Comer Fuera, Sobras) sin penalización ni culpa', async ({ page }) => {
    // Navegar a Mi Semana
    await page.goto('/semana');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1:has-text("Mi Semana")')).toBeVisible();

    // Botón de presupuesto presente en Mi Semana
    const budgetBtn = page.locator('button:has-text("Presupuesto")');
    await expect(budgetBtn).toBeVisible();

    // Buscar el selector de flexibilidad del primer día
    const flexibilitySelect = page.locator('select').first();
    await expect(flexibilitySelect).toBeVisible();

    // Cambiar a "Comer fuera"
    await flexibilitySelect.selectOption('COMER_FUERA');

    // Verificar que el selector refleja comer fuera
    await expect(flexibilitySelect).toHaveValue('COMER_FUERA');

    // Cambiar a "Día de sobras"
    await flexibilitySelect.selectOption('DIA_SOBRAS');
    await expect(flexibilitySelect).toHaveValue('DIA_SOBRAS');
  });

  test('P4-E: Adaptabilidad Responsive móvil 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Verificar que la barra de botones y atajo son interactuables en pantalla pequeña
    const cmdButton = page.locator('button:has-text("Buscar o comando")');
    await expect(cmdButton).toBeVisible();
    await cmdButton.click();

    const searchInput = page.locator('input[placeholder*="Escribe un comando"]');
    await expect(searchInput).toBeVisible();
    await page.keyboard.press('Escape');
  });

});
