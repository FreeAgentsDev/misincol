import { test, expect } from '@playwright/test';
import { loginAs, logout, expectNotAuthenticated } from '../fixtures/auth';
import { expectProtectedRoute } from '../utils/helpers';

test.describe('Logout', () => {
  test('Logout desde dashboard superadmin', async ({ page }) => {
    // Login
    await loginAs(page, 'superadmin');
    expect(page.url()).toContain('/superadmin/dashboard');
    
    // Logout
    await logout(page);
    
    // Verificar redirección a login
    await expectNotAuthenticated(page);
  });

  test('Logout desde dashboard líder', async ({ page }) => {
    // Login
    await loginAs(page, 'liderBari');
    expect(page.url()).toContain('/leader/dashboard');
    
    // Logout
    await logout(page);
    
    // Verificar redirección a login
    await expectNotAuthenticated(page);
  });

  test('No se puede acceder a rutas protegidas después de logout', async ({ page }) => {
    // Login
    await loginAs(page, 'superadmin');
    
    // Logout
    await logout(page);
    
    // Intentar acceder a ruta protegida
    await expectProtectedRoute(page, '/superadmin/dashboard', true);
  });
});



