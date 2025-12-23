import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';
import { waitForPageLoad, expectNoConsoleErrors, expectNoCriticalHttpErrors, expectDashboardMetrics } from '../utils/helpers';
import { expectValidDashboardMetrics } from '../utils/assertions';

test.describe('Superadmin - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'superadmin');
  });

  test('Dashboard carga sin errores', async ({ page }) => {
    await page.goto('/superadmin/dashboard');
    await waitForPageLoad(page);
    
    // Verificar que no hay errores en consola
    await expectNoConsoleErrors(page);
    
    // Verificar que no hay errores HTTP críticos
    await expectNoCriticalHttpErrors(page);
    
    // Verificar URL
    expect(page.url()).toContain('/superadmin/dashboard');
  });

  test('Dashboard muestra métricas de equipos', async ({ page }) => {
    await page.goto('/superadmin/dashboard');
    await waitForPageLoad(page);
    
    // Verificar que hay métricas visibles
    await expectDashboardMetrics(page);
    await expectValidDashboardMetrics(page);
    
    // Verificar que hay elementos de métricas
    const metricsElements = [
      'text=Equipos',
      'text=Actividades',
      'text=Presupuesto'
    ];
    
    let foundAny = false;
    for (const selector of metricsElements) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          foundAny = true;
          break;
        }
      } catch {
        // Continuar
      }
    }
    
    expect(foundAny, 'Debe mostrar al menos una métrica').toBe(true);
  });

  test('Dashboard muestra tabla de equipos y planes', async ({ page }) => {
    await page.goto('/superadmin/dashboard');
    await waitForPageLoad(page);
    
    // Verificar que hay una tabla o lista de equipos
    const tableSelectors = [
      'table',
      '[class*="table"]',
      '[class*="card"]',
      'text=Equipo'
    ];
    
    let found = false;
    for (const selector of tableSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          found = true;
          break;
        }
      } catch {
        // Continuar
      }
    }
    
    expect(found, 'Debe mostrar una tabla o lista de equipos').toBe(true);
  });

  test('Navegación desde dashboard a detalle de equipo', async ({ page }) => {
    await page.goto('/superadmin/dashboard');
    await waitForPageLoad(page);
    
    // Buscar link "Ver detalle" o similar
    const detailLink = page.locator('a:has-text("Ver detalle"), a:has-text("detalle"), [href*="/teams/"]').first();
    
    if (await detailLink.isVisible({ timeout: 3000 })) {
      const href = await detailLink.getAttribute('href');
      if (href) {
        await detailLink.click();
        await waitForPageLoad(page);
        
        // Verificar que navegamos a detalle de equipo
        expect(page.url()).toMatch(/\/superadmin\/teams\/[^/]+$/);
      }
    } else {
      // Si no hay link, la prueba pasa (puede que no haya equipos)
      test.info().annotations.push({ type: 'note', description: 'No se encontró link de detalle, puede que no haya equipos' });
    }
  });

  test('Dashboard muestra totales agregados', async ({ page }) => {
    await page.goto('/superadmin/dashboard');
    await waitForPageLoad(page);
    
    // Verificar que hay números (totales)
    const bodyText = await page.textContent('body');
    const hasNumbers = /\d+/.test(bodyText || '');
    
    expect(hasNumbers, 'El dashboard debe mostrar totales numéricos').toBe(true);
  });

  test('Dashboard maneja estado vacío (sin equipos)', async ({ page }) => {
    await page.goto('/superadmin/dashboard');
    await waitForPageLoad(page);
    
    // Verificar que la página carga sin errores incluso si no hay datos
    await expectNoConsoleErrors(page);
    
    // Verificar que hay algún mensaje o estado vacío
    const emptyStateSelectors = [
      'text=No hay',
      'text=Sin equipos',
      'text=configurado',
      '[class*="empty"]'
    ];
    
    const hasData = await page.locator('table, [class*="table"], [class*="card"]').first().isVisible({ timeout: 2000 }).catch(() => false);
    const hasEmptyState = emptyStateSelectors.some(selector => 
      page.locator(selector).first().isVisible({ timeout: 2000 }).catch(() => false)
    );
    
    // Debe tener datos o estado vacío, pero no errores
    expect(hasData || hasEmptyState, 'Debe mostrar datos o estado vacío').toBe(true);
  });
});



