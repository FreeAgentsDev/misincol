import { test, expect } from '@playwright/test';
import { loginAs, expectAuthenticated } from '../fixtures/auth';
import { expectProtectedRoute } from '../utils/helpers';
import { expectUserRole } from '../utils/assertions';

test.describe('Superadmin - Navegación y Rutas Protegidas', () => {
  test('Redirección automática desde login', async ({ page }) => {
    await loginAs(page, 'superadmin');
    
    // Verificar que se redirige al dashboard correcto
    expect(page.url()).toContain('/superadmin/dashboard');
    await expectAuthenticated(page, 'superadmin');
  });

  test('Acceso a todas las rutas de superadmin', async ({ page }) => {
    await loginAs(page, 'superadmin');
    
    const routes = [
      '/superadmin/dashboard',
      '/superadmin/manage',
      '/superadmin/plans-list',
      '/superadmin/plans'
    ];
    
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Verificar que estamos en la ruta correcta
      expect(page.url()).toContain(route);
      
      // Verificar que no hay redirección a login
      expect(page.url()).not.toContain('/login');
    }
  });

  test('Intento de acceso a rutas de líder redirige a superadmin', async ({ page }) => {
    await loginAs(page, 'superadmin');
    
    // Intentar acceder a ruta de líder
    await page.goto('/leader/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Debe redirigir a superadmin dashboard
    expect(page.url()).toContain('/superadmin');
    expect(page.url()).not.toContain('/leader');
  });

  test('Rutas protegidas requieren autenticación', async ({ page }) => {
    // Sin login, intentar acceder a ruta protegida
    await expectProtectedRoute(page, '/superadmin/dashboard', true);
  });

  test('Navegación entre páginas mantiene sesión', async ({ page }) => {
    await loginAs(page, 'superadmin');
    
    // Navegar entre páginas
    await page.goto('/superadmin/dashboard');
    await page.goto('/superadmin/manage');
    await page.goto('/superadmin/plans-list');
    
    // Verificar que seguimos autenticados
    await expectUserRole(page, 'superadmin');
    expect(page.url()).toContain('/superadmin');
  });
});



