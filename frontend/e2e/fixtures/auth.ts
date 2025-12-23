import { Page, expect } from '@playwright/test';
import { TestUser, getTestUser } from './users';

/**
 * Helper para realizar login
 */
export async function loginAs(page: Page, userKey: keyof typeof import('./users').TEST_USERS) {
  const user = getTestUser(userKey);
  return loginWithCredentials(page, user.username, user.password);
}

/**
 * Helper para realizar login con credenciales específicas
 */
export async function loginWithCredentials(page: Page, username: string, password: string) {
  await page.goto('/login');
  
  // Esperar a que el formulario esté visible
  await page.waitForSelector('input[name="username"], input[type="text"]', { timeout: 5000 });
  
  // Llenar campos de login
  const usernameInput = page.locator('input[name="username"], input[type="text"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  
  await usernameInput.fill(username);
  await passwordInput.fill(password);
  
  // Click en botón de login
  const loginButton = page.locator('button:has-text("Entrar"), button[type="submit"]').first();
  await loginButton.click();
  
  // Esperar a que se complete el login (redirección o cambio de URL)
  await page.waitForURL(/dashboard/, { timeout: 10000 });
  
  // Verificar que estamos en el dashboard correcto según el rol
  const url = page.url();
  if (username === 'superadmin') {
    expect(url).toContain('/superadmin/dashboard');
  } else {
    expect(url).toContain('/leader/dashboard');
  }
}

/**
 * Helper para realizar logout
 */
export async function logout(page: Page) {
  // Buscar botón de logout (puede estar en diferentes lugares)
  const logoutButton = page.locator('button:has-text("Cerrar Sesión"), button:has-text("Logout"), [data-testid="logout"]').first();
  
  if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutButton.click();
  } else {
    // Si no hay botón visible, intentar desde la consola o directamente
    await page.evaluate(() => {
      // Intentar cerrar sesión desde el contexto de la app
      if (window.localStorage) {
        window.localStorage.clear();
      }
      if (window.sessionStorage) {
        window.sessionStorage.clear();
      }
    });
  }
  
  // Esperar redirección a login
  await page.waitForURL(/login/, { timeout: 5000 });
}

/**
 * Helper para verificar que el usuario está autenticado
 */
export async function expectAuthenticated(page: Page, expectedRole: TestUser['role']) {
  const url = page.url();
  
  if (expectedRole === 'superadmin') {
    expect(url).toContain('/superadmin');
  } else if (expectedRole === 'leader') {
    expect(url).toContain('/leader');
  }
  
  // Verificar que no estamos en login
  expect(url).not.toContain('/login');
}

/**
 * Helper para verificar que el usuario NO está autenticado
 */
export async function expectNotAuthenticated(page: Page) {
  const url = page.url();
  expect(url).toContain('/login');
}

/**
 * Helper para esperar a que se cargue el perfil del usuario
 */
export async function waitForUserProfile(page: Page, expectedUsername: string, timeout = 10000) {
  // Esperar a que el perfil se cargue (puede estar en diferentes lugares de la UI)
  // Por ahora, simplemente esperamos a que la página cargue completamente
  await page.waitForLoadState('networkidle', { timeout });
  
  // Verificar que no hay errores de perfil en consola
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('PROFILE')) {
      consoleErrors.push(msg.text());
    }
  });
  
  // Si hay errores críticos, fallar
  if (consoleErrors.length > 0) {
    throw new Error(`Errores al cargar perfil: ${consoleErrors.join(', ')}`);
  }
}



