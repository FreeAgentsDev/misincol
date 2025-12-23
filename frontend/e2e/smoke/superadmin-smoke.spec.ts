import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';
import { waitForPageLoad, expectNoConsoleErrors, expectNoCriticalHttpErrors } from '../utils/helpers';

test.describe('Smoke Test - Superadmin', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'superadmin');
  });

  test('Navegación completa por todas las rutas principales', async ({ page }) => {
    const routes = [
      '/superadmin/dashboard',
      '/superadmin/manage',
      '/superadmin/plans-list',
      '/superadmin/plans'
    ];
    
    for (const route of routes) {
      await page.goto(route);
      await waitForPageLoad(page);
      
      // Verificar que la página carga
      expect(page.url()).toContain(route);
      
      // Verificar que no hay errores críticos
      await expectNoConsoleErrors(page, ['deprecation', 'warning']);
      await expectNoCriticalHttpErrors(page);
    }
  });

  test('Dashboard carga y muestra datos', async ({ page }) => {
    await page.goto('/superadmin/dashboard');
    await waitForPageLoad(page);
    
    // Verificar que la página carga
    expect(page.url()).toContain('/superadmin/dashboard');
    
    // Verificar que hay contenido
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(100);
  });

  test('Gestión de equipos carga', async ({ page }) => {
    await page.goto('/superadmin/manage');
    await waitForPageLoad(page);
    
    // Verificar que la página carga
    expect(page.url()).toContain('/superadmin/manage');
    
    // Verificar que no hay errores
    await expectNoConsoleErrors(page);
  });

  test('Lista de planes carga', async ({ page }) => {
    await page.goto('/superadmin/plans-list');
    await waitForPageLoad(page);
    
    // Verificar que la página carga
    expect(page.url()).toContain('/superadmin/plans-list');
    
    // Verificar que no hay errores
    await expectNoConsoleErrors(page);
  });
});



