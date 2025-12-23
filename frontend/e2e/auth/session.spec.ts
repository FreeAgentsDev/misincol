import { test, expect } from '@playwright/test';
import { loginAs, expectAuthenticated } from '../fixtures/auth';
import { waitForPageLoad } from '../utils/helpers';

test.describe('Sesión Persistente', () => {
  test('Sesión se mantiene después de recargar página', async ({ page, context }) => {
    // Login
    await loginAs(page, 'superadmin');
    expect(page.url()).toContain('/superadmin/dashboard');
    
    // Recargar página
    await page.reload();
    await waitForPageLoad(page);
    
    // Verificar que la sesión se mantiene
    expect(page.url()).toContain('/superadmin/dashboard');
    await expectAuthenticated(page, 'superadmin');
  });

  test('Sesión se mantiene al navegar entre páginas', async ({ page }) => {
    // Login
    await loginAs(page, 'superadmin');
    
    // Navegar a otra página
    await page.goto('/superadmin/manage');
    await waitForPageLoad(page);
    
    // Verificar que seguimos autenticados
    expect(page.url()).toContain('/superadmin');
    await expectAuthenticated(page, 'superadmin');
    
    // Volver al dashboard
    await page.goto('/superadmin/dashboard');
    await waitForPageLoad(page);
    
    // Verificar que seguimos autenticados
    expect(page.url()).toContain('/superadmin/dashboard');
  });

  test('Sesión de líder se mantiene con teamId', async ({ page }) => {
    // Login como líder
    await loginAs(page, 'liderBari');
    const initialUrl = page.url();
    expect(initialUrl).toContain('/leader/dashboard');
    expect(initialUrl).toContain('team=');
    
    // Recargar página
    await page.reload();
    await waitForPageLoad(page);
    
    // Verificar que la sesión y el teamId se mantienen
    const currentUrl = page.url();
    expect(currentUrl).toContain('/leader/dashboard');
    expect(currentUrl).toContain('team=');
    await expectAuthenticated(page, 'leader');
  });
});



