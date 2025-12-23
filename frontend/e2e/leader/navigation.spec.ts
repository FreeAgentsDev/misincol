import { test, expect } from '@playwright/test';
import { loginAs, expectAuthenticated } from '../fixtures/auth';
import { expectProtectedRoute } from '../utils/helpers';
import { expectUserRole } from '../utils/assertions';
import { getTestUser } from '../fixtures/users';

test.describe('Leader - Navegación y Rutas Protegidas', () => {
  test('Redirección automática desde login', async ({ page }) => {
    await loginAs(page, 'liderBari');
    
    const user = getTestUser('liderBari');
    
    // Verificar que se redirige al dashboard correcto con teamId
    expect(page.url()).toContain('/leader/dashboard');
    expect(page.url()).toContain(`team=${user.teamId}`);
    await expectAuthenticated(page, 'leader');
  });

  test('Acceso a todas las rutas de líder', async ({ page }) => {
    const user = getTestUser('liderBari');
    await loginAs(page, 'liderBari');
    
    const routes = [
      `/leader/dashboard?team=${user.teamId}`,
      `/leader/plans?team=${user.teamId}`,
      `/leader/plans-list?team=${user.teamId}`,
      `/leader/activities?team=${user.teamId}`,
      `/leader/members?team=${user.teamId}`
    ];
    
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Verificar que estamos en la ruta correcta
      expect(page.url()).toContain(route.split('?')[0]);
      
      // Verificar que no hay redirección a login
      expect(page.url()).not.toContain('/login');
    }
  });

  test('Intento de acceso a rutas de superadmin redirige a líder', async ({ page }) => {
    await loginAs(page, 'liderBari');
    
    const user = getTestUser('liderBari');
    
    // Intentar acceder a ruta de superadmin
    await page.goto('/superadmin/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Debe redirigir a leader dashboard
    expect(page.url()).toContain('/leader');
    expect(page.url()).toContain(`team=${user.teamId}`);
    expect(page.url()).not.toContain('/superadmin');
  });

  test('Rutas protegidas requieren autenticación', async ({ page }) => {
    const user = getTestUser('liderBari');
    
    // Sin login, intentar acceder a ruta protegida
    await expectProtectedRoute(page, `/leader/dashboard?team=${user.teamId}`, true);
  });

  test('Navegación entre páginas mantiene sesión y teamId', async ({ page }) => {
    const user = getTestUser('liderBari');
    await loginAs(page, 'liderBari');
    
    // Navegar entre páginas
    await page.goto(`/leader/dashboard?team=${user.teamId}`);
    await page.goto(`/leader/plans?team=${user.teamId}`);
    await page.goto(`/leader/activities?team=${user.teamId}`);
    
    // Verificar que seguimos autenticados y con teamId
    await expectUserRole(page, 'leader');
    expect(page.url()).toContain('/leader');
    expect(page.url()).toContain(`team=${user.teamId}`);
  });
});



