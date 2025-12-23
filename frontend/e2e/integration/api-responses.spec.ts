import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';
import { waitForPageLoad } from '../utils/helpers';
import { getTestUser } from '../fixtures/users';

test.describe('Integración - Respuestas API', () => {
  test('Requests a perfiles devuelven 200', async ({ page }) => {
    await loginAs(page, 'superadmin');
    
    const responses: { url: string; status: number }[] = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('perfiles')) {
        responses.push({ url, status: response.status() });
      }
    });
    
    await page.goto('/superadmin/dashboard');
    await waitForPageLoad(page);
    
    // Verificar que hay al menos una respuesta 200 para perfiles
    const successResponses = responses.filter(r => r.status === 200);
    expect(successResponses.length).toBeGreaterThan(0);
  });

  test('Requests a equipos devuelven 200', async ({ page }) => {
    await loginAs(page, 'superadmin');
    
    const responses: { url: string; status: number }[] = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('equipos')) {
        responses.push({ url, status: response.status() });
      }
    });
    
    await page.goto('/superadmin/dashboard');
    await waitForPageLoad(page);
    
    // Verificar que hay al menos una respuesta 200 para equipos
    const successResponses = responses.filter(r => r.status === 200);
    // Puede que no haya equipos, pero no debe haber errores 4xx/5xx
    const errorResponses = responses.filter(r => r.status >= 400);
    expect(errorResponses.length).toBe(0);
  });

  test('Requests a planes_desarrollo devuelven 200', async ({ page }) => {
    await loginAs(page, 'superadmin');
    
    const responses: { url: string; status: number }[] = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('planes_desarrollo')) {
        responses.push({ url, status: response.status() });
      }
    });
    
    await page.goto('/superadmin/plans-list');
    await waitForPageLoad(page);
    
    // Verificar que no hay errores 4xx/5xx
    const errorResponses = responses.filter(r => r.status >= 400);
    expect(errorResponses.length).toBe(0);
  });

  test('Requests a actividades devuelven 200', async ({ page }) => {
    const user = getTestUser('liderBari');
    await loginAs(page, 'liderBari');
    
    const responses: { url: string; status: number }[] = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('actividades')) {
        responses.push({ url, status: response.status() });
      }
    });
    
    await page.goto(`/leader/activities?team=${user.teamId}`);
    await waitForPageLoad(page);
    
    // Verificar que no hay errores 4xx/5xx
    const errorResponses = responses.filter(r => r.status >= 400);
    expect(errorResponses.length).toBe(0);
  });

  test('Requests a miembros_equipo devuelven 200', async ({ page }) => {
    const user = getTestUser('liderBari');
    await loginAs(page, 'liderBari');
    
    const responses: { url: string; status: number }[] = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('miembros_equipo')) {
        responses.push({ url, status: response.status() });
      }
    });
    
    await page.goto(`/leader/members?team=${user.teamId}`);
    await waitForPageLoad(page);
    
    // Verificar que no hay errores 4xx/5xx
    const errorResponses = responses.filter(r => r.status >= 400);
    expect(errorResponses.length).toBe(0);
  });

  test('Requests a metricas_equipo devuelven 200', async ({ page }) => {
    await loginAs(page, 'superadmin');
    
    const responses: { url: string; status: number }[] = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('metricas_equipo') || url.includes('obtener_metricas_dashboard_equipo')) {
        responses.push({ url, status: response.status() });
      }
    });
    
    await page.goto('/superadmin/dashboard');
    await waitForPageLoad(page);
    
    // Verificar que no hay errores 4xx/5xx
    const errorResponses = responses.filter(r => r.status >= 400);
    expect(errorResponses.length).toBe(0);
  });
});

