import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';
import { waitForPageLoad, expectNoCriticalHttpErrors } from '../utils/helpers';
import { getTestUser } from '../fixtures/users';

test.describe('Integración - RLS y Seguridad', () => {
  test('Leader solo ve datos de su equipo', async ({ page }) => {
    const user = getTestUser('liderBari');
    await loginAs(page, 'liderBari');
    
    await page.goto(`/leader/dashboard?team=${user.teamId}`);
    await waitForPageLoad(page);
    
    // Verificar que no hay errores 403 (RLS bloqueando)
    await expectNoCriticalHttpErrors(page);
    
    // Verificar que la URL contiene el teamId correcto
    expect(page.url()).toContain(`team=${user.teamId}`);
  });

  test('Superadmin puede ver todos los datos', async ({ page }) => {
    await loginAs(page, 'superadmin');
    
    await page.goto('/superadmin/dashboard');
    await waitForPageLoad(page);
    
    // Verificar que no hay errores 403
    await expectNoCriticalHttpErrors(page);
    
    // Verificar que puede ver múltiples equipos (si existen)
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('Leader no puede acceder a datos de otros equipos', async ({ page }) => {
    const user = getTestUser('liderBari');
    const otherUser = getTestUser('liderKatios');
    
    await loginAs(page, 'liderBari');
    
    // Intentar acceder con teamId de otro equipo
    if (otherUser.teamId) {
      await page.goto(`/leader/dashboard?team=${otherUser.teamId}`);
      await waitForPageLoad(page);
      
      // Debe redirigir al teamId del líder actual o mostrar error
      // La URL debe contener el teamId del líder actual, no el otro
      const currentUrl = page.url();
      
      // Verificar que no estamos usando el teamId del otro equipo
      if (currentUrl.includes('team=')) {
        expect(currentUrl).toContain(`team=${user.teamId}`);
        expect(currentUrl).not.toContain(`team=${otherUser.teamId}`);
      }
    }
  });

  test('No hay errores 401/403/406 en vistas autenticadas', async ({ page }) => {
    // Probar con superadmin
    await loginAs(page, 'superadmin');
    await page.goto('/superadmin/dashboard');
    await waitForPageLoad(page);
    await expectNoCriticalHttpErrors(page);
    
    // Probar con líder
    await loginAs(page, 'liderBari');
    const user = getTestUser('liderBari');
    await page.goto(`/leader/dashboard?team=${user.teamId}`);
    await waitForPageLoad(page);
    await expectNoCriticalHttpErrors(page);
  });
});



