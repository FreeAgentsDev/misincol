import { test, expect } from '@playwright/test';
import { loginAs, expectAuthenticated } from '../fixtures/auth';
import { expectNoConsoleErrors } from '../utils/helpers';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar sesión antes de cada prueba
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Login exitoso como superadmin', async ({ page }) => {
    await loginAs(page, 'superadmin');
    
    // Verificar redirección
    expect(page.url()).toContain('/superadmin/dashboard');
    
    // Verificar autenticación
    await expectAuthenticated(page, 'superadmin');
    
    // Verificar que no hay errores en consola
    await expectNoConsoleErrors(page);
  });

  test('Login exitoso como líder', async ({ page }) => {
    await loginAs(page, 'liderBari');
    
    // Verificar que termina en una ruta de líder con team en la URL
    const url = page.url();
    expect(url).toContain('/leader/dashboard');
    expect(url).toContain('team=');
    
    // Verificar autenticación
    await expectAuthenticated(page, 'leader');
    
    // Verificar que no hay errores en consola
    await expectNoConsoleErrors(page);
  });

  test('Login con usuario demo - Super Administrador', async ({ page }) => {
    await page.goto('/login');
    
    // Buscar y hacer click en el botón de usuario demo
    const demoButton = page.locator('button:has-text("Super Administrador"), button:has-text("superadmin")').first();
    
    if (await demoButton.isVisible({ timeout: 3000 })) {
      await demoButton.click();
      
      // Verificar que los campos se llenaron
      const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      const usernameValue = await usernameInput.inputValue();
      const passwordValue = await passwordInput.inputValue();
      
      expect(usernameValue).toBeTruthy();
      expect(passwordValue).toBeTruthy();
      
      // Hacer login
      const loginButton = page.locator('button:has-text("Entrar"), button[type="submit"]').first();
      await loginButton.click();
      
      // Verificar redirección
      await page.waitForURL(/superadmin\/dashboard/, { timeout: 10000 });
      expect(page.url()).toContain('/superadmin/dashboard');
    } else {
      // Si no hay botón demo, hacer login manual
      await loginAs(page, 'superadmin');
      expect(page.url()).toContain('/superadmin/dashboard');
    }
  });

  test('Login fallido - credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');
    
    // Llenar formulario con credenciales incorrectas
    const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    await usernameInput.fill('superadmin');
    await passwordInput.fill('contraseña_incorrecta');

    const loginButton = page.locator('button:has-text("Entrar"), button[type="submit"]').first();
    await loginButton.click();

    // Esperar un momento y comprobar que seguimos en /login
    await page.waitForTimeout(2000);
    const url = page.url();
    const hasError = await page
      .locator('text=/inválid|inválido|incorrecta|incorrecto|error/i')
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    expect(url).toContain('/login');
    expect(hasError).toBe(true);
  });

  test('Login fallido - usuario no existe', async ({ page }) => {
    await page.goto('/login');
    
    // Llenar formulario con usuario inexistente
    const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    await usernameInput.fill('usuario_inexistente');
    await passwordInput.fill('password123');

    const loginButton = page.locator('button:has-text("Entrar"), button[type="submit"]').first();
    await loginButton.click();

    // Esperar un momento y comprobar que seguimos en /login
    await page.waitForTimeout(2000);
    const url = page.url();
    const hasError = await page
      .locator('text=/inválid|inválido|incorrect|no existe|error/i')
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    expect(url).toContain('/login');
    expect(hasError).toBe(true);
  });

  test('Validar campos de login', async ({ page }) => {
    await page.goto('/login');
    
    // Verificar que los campos existen
    const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("Entrar"), button[type="submit"]').first();
    
    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
  });
});

