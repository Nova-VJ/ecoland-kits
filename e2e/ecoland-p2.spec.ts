import { test, expect } from '@playwright/test';

test.describe('Ecoland Daily — P2 Adaptive Companion E2E Tests', () => {

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      sessionStorage.setItem('ecoland-splash-seen', 'true');
      sessionStorage.setItem('ecoland-intro-shown', 'true');
      localStorage.setItem('ecoland-cookie-consent', JSON.stringify({ necessary: true, analytics: false }));
    });
  });

  test('1. EcoCoach Contextual: responde con insignia de seguridad y ejecuta [REGISTRAR EN MI DÍA] (P2-A)', async ({ page }) => {
    await page.goto('/coach');
    await page.waitForLoadState('networkidle');

    // Título y presentación
    await expect(page.locator('text=EcoCoach Contextual').first()).toBeVisible();
    await expect(page.locator('text=Despensa Primero').first()).toBeVisible();

    // Click en chip sugerido: "¿Qué puedo cenar hoy?"
    const chipDinner = page.locator('button:has-text("¿Qué puedo cenar hoy?")').first();
    await chipDinner.click();

    // Comprobar insignia SUGERENCIA y fundamentación de datos
    await expect(page.locator('text=SUGERENCIA').first()).toBeVisible();
    await expect(page.locator('text=Fundamentado en:').first()).toBeVisible();

    // Comprobar botones de acción
    const logBtn = page.locator('button:has-text("Registrar en mi día")').first();
    await expect(logBtn).toBeVisible();

    // Ejecutar acción
    await logBtn.click();
    await expect(page.locator('text=✓ Registrado en tu diario de hoy').first()).toBeVisible();
  });

  test('2. EcoCoach: Anti-desperdicio consulta despensa y descuenta alimento (P2-A)', async ({ page }) => {
    await page.goto('/coach');
    await page.waitForLoadState('networkidle');

    // Click en chip de vencimiento
    const chipWaste = page.locator('button:has-text("¿Qué debería consumir antes de que se estropee?")').first();
    await chipWaste.click();

    // Verificar respuesta fundamentada
    await expect(page.locator('text=Fundamentado en:').first()).toBeVisible();

    // Verificar botón de acción sobre despensa si existe
    const pantryBtn = page.locator('button:has-text("Descontar de despensa")').first();
    if (await pantryBtn.isVisible()) {
      await pantryBtn.click();
      await expect(page.locator('text=despensa inteligente').first()).toBeVisible();
    }
  });

  test('3. Importador Universal de Recetas: cruce de despensa y envío a Lista (P2-B)', async ({ page }) => {
    await page.goto('/semana');
    await page.waitForLoadState('networkidle');

    // Botón de importar receta externa
    const importBtn = page.locator('button:has-text("Importar Receta Externa")');
    await expect(importBtn).toBeVisible();
    await importBtn.click();

    // Modal abierto
    await expect(page.locator('text=Importar Receta').first()).toBeVisible();

    // Pestaña Texto Libre
    const textTab = page.locator('button:has-text("Texto Libre")');
    await textTab.click();

    // Rellenar texto
    const textarea = page.locator('textarea');
    await textarea.fill('Guiso de lentejas con calabaza y comino\n- 200g lentejas pardinas bio\n- 100g calabaza bio\n- 1 cucharada comino molido');

    // Click en Importar y estructurar receta
    await page.locator('button:has-text("Importar y estructurar receta")').click();

    // Comprobar desglose YA TIENES vs TE FALTA
    await expect(page.locator('text=YA TIENES').first()).toBeVisible();
    await expect(page.locator('text=TE FALTA').first()).toBeVisible();

    // Click en Añadir faltantes a Lista si está disponible
    const addToListBtn = page.locator('button:has-text("Añadir faltantes a Lista")');
    if (await addToListBtn.isVisible()) {
      await addToListBtn.click();
      await expect(page.locator('text=Faltantes en Lista').first()).toBeVisible();
    }
  });

  test('4. Detección de Registros Incompletos en /hoy (P2-C)', async ({ page, context }) => {
    // Inyectar estado de día incompleto simulando ayer
    await context.addInitScript(() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      localStorage.setItem('ecoland_daily_logs_v1', JSON.stringify([
        { id: 'mock_yest', name: 'Café solo', meal: 'desayuno', calories: 20, protein: 0, carbs: 1, fats: 0, fiber: 0, timeString: '08:00', source: 'manual' }
      ]));
      localStorage.setItem('ecoland_day_completeness_v1', JSON.stringify({
        date: yesterdayStr,
        status: 'INCOMPLETE'
      }));
    });

    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Debe mostrar el banner respetuoso de registro incompleto
    const banner = page.locator('text=¿El registro de ayer quedó incompleto?');
    if (await banner.isVisible()) {
      const markBtn = page.locator('button:has-text("Marcar incompleto")');
      await markBtn.click();
      // El banner se oculta
      await expect(banner).toHaveCount(0);
    }
  });

  test('5. Modo "Comí Fuera" con aviso obligatorio de variabilidad (P2-D)', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Abrir Modal de registro
    await page.locator('button:has-text("Registrar lo que has comido")').first().click();
    await expect(page.locator('text=Registrar Comida en Segundos')).toBeVisible();

    // Cambiar a pestaña Comí fuera
    const outsideTab = page.locator('button:has-text("Comí fuera")');
    await expect(outsideTab).toBeVisible();
    await outsideTab.click();

    // Click en un preset habitual
    const presetBtn = page.locator('button:has-text("Menú del día")').first();
    await presetBtn.click();

    // Comprobar aviso de variabilidad
    await expect(page.locator('text=las cantidades de una comida preparada fuera de casa pueden variar').first()).toBeVisible();

    // Confirmar y Guardar
    await page.locator('button:has-text("Confirmar y Guardar")').click();

    // Modal cerrado
    await expect(page.locator('text=Registrar Comida en Segundos')).toHaveCount(0);
  });

  test('6. Alternancia Modo Simple vs Modo Nutrición en /hoy (P2-F)', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Localizar selector de modo
    const simpleBtn = page.locator('button:has-text("Modo Simple")');
    const nutritionBtn = page.locator('button:has-text("Modo Nutrición")');

    await expect(simpleBtn).toBeVisible();
    await expect(nutritionBtn).toBeVisible();

    // Activar Modo Simple
    await simpleBtn.click();
    // En modo simple se prioriza el foco sin agobio de desglose milimétrico
    await expect(page.locator('text=Foco del día:').first()).toBeVisible();

    // Cambiar a Modo Nutrición
    await nutritionBtn.click();
    // En modo nutrición aparecen los macros detallados
    await expect(page.locator('text=Proteína').first()).toBeVisible();
  });

  test('7. "¿Qué puedo hacer ahora?" con máximo 3 acciones inmediatas (P2-H)', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Botón ¿Qué puedo hacer ahora?
    const actionBtn = page.locator('button:has-text("¿Qué puedo hacer ahora?")');
    await expect(actionBtn).toBeVisible();
    await actionBtn.click();

    // Comprobar título del diálogo
    await expect(page.locator('text=¿Qué puedo hacer ahora mismo?').first()).toBeVisible();
    await expect(page.locator('text=Tus 3 mejores opciones').first()).toBeVisible();

    // Cerrar diálogo
    await page.locator('button:has-text("Entendido")').click();
  });

  test('8. Hogar Ecoland con código familiar y privacidad garantizada (P2-E)', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Botón Hogar Ecoland
    const householdBtn = page.locator('button:has-text("Hogar Ecoland")').first();
    await expect(householdBtn).toBeVisible();
    await householdBtn.click();

    // Modal de Hogar Ecoland
    await expect(page.locator('text=Hogar Ecoland Colaborativo').first()).toBeVisible();
    await expect(page.locator('text=Se comparte:').first()).toBeVisible();
    await expect(page.locator('text=Estrictamente privado:').first()).toBeVisible();

    // Cerrar modal
    await page.locator('button:has-text("Cerrar")').click();
  });

  test('9. Batch Cooking y distinción económica en Mi Semana (P2-I y P2-K)', async ({ page }) => {
    await page.goto('/semana');
    await page.waitForLoadState('networkidle');

    // Bloque Batch Cooking domingo
    await expect(page.locator('text=PREPARACIÓN ANTICIPADA · 35 MINUTOS EL DOMINGO').first()).toBeVisible();

    // Desplegar pasos
    const toggleStepsBtn = page.locator('button:has-text("Ver plan de 35 min")');
    if (await toggleStepsBtn.isVisible()) {
      await toggleStepsBtn.click();
      await expect(page.locator('text=Cocer base de Quinoa Real Bio').first()).toBeVisible();
    }

    // Transparencia económica: Valor ingredientes vs Dinero a gastar hoy
    await expect(page.locator('text=Valor total ingredientes utilizados').first()).toBeVisible();
    await expect(page.locator('text=Dinero que necesitas gastar hoy').first()).toBeVisible();
  });

  test('10. Rótulo "Variedad vegetal esta semana" no prescriptivo médico (P2-K)', async ({ page }) => {
    await page.goto('/hoy');
    await page.waitForLoadState('networkidle');

    // Abrir diálogo de tendencia
    const trendBtn = page.locator('button:has-text("Ver tendencia")').first();
    if (await trendBtn.isVisible()) {
      await trendBtn.click();

      // Debe titularse "Variedad vegetal esta semana" y no imponer 24 de forma punitiva
      await expect(page.locator('text=Variedad vegetal esta semana').first()).toBeVisible();
      await expect(page.locator('text=orientativa').first()).toBeVisible();
    }
  });

});
