import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';
import { waitForPageLoad, expectNoConsoleErrors, expectNoCriticalHttpErrors } from '../utils/helpers';
import { getTestUser } from '../fixtures/users';

test.describe('Smoke Test - Leader', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'liderBari');
  });

  test('Navegación completa por todas las rutas principales', async ({ page }) => {
    const user = getTestUser('liderBari');
    const routes = [
      `/leader/dashboard?team=${user.teamId}`,
      `/leader/plans?team=${user.teamId}`,
      `/leader/plans-list?team=${user.teamId}`,
      `/leader/activities?team=${user.teamId}`,
      `/leader/members?team=${user.teamId}`
    ];
    
    for (const route of routes) {
      await page.goto(route);
      await waitForPageLoad(page);
      
      // Verificar que la página carga
      expect(page.url()).toContain(route.split('?')[0]);
      
      // Verificar que no hay errores críticos
      await expectNoConsoleErrors(page, ['deprecation', 'warning']);
      await expectNoCriticalHttpErrors(page);
    }
  });

  test('Dashboard carga y muestra datos', async ({ page }) => {
    const user = getTestUser('liderBari');
    await page.goto(`/leader/dashboard?team=${user.teamId}`);
    await waitForPageLoad(page);
    
    // Verificar que la página carga
    expect(page.url()).toContain('/leader/dashboard');
    
    // Verificar que hay contenido
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(100);
  });

  test('Planes del equipo cargan', async ({ page }) => {
    const user = getTestUser('liderBari');
    await page.goto(`/leader/plans?team=${user.teamId}`);
    await waitForPageLoad(page);
    
    // Verificar que la página carga
    expect(page.url()).toContain('/leader/plans');
    
    // Verificar que no hay errores
    await expectNoConsoleErrors(page);
  });

  test('Actividades cargan', async ({ page }) => {
    const user = getTestUser('liderBari');
    await page.goto(`/leader/activities?team=${user.teamId}`);
    await waitForPageLoad(page);
    
    // Verificar que la página carga
    expect(page.url()).toContain('/leader/activities');
    
    // Verificar que no hay errores
    await expectNoConsoleErrors(page);
  });

  test('Miembros del equipo cargan', async ({ page }) => {
    const user = getTestUser('liderBari');
    await page.goto(`/leader/members?team=${user.teamId}`);
    await waitForPageLoad(page);
    
    // Verificar que la página carga
    expect(page.url()).toContain('/leader/members');
    
    // Verificar que no hay errores
    await expectNoConsoleErrors(page);
  });
});



