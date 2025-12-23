import { Page, expect } from '@playwright/test';

/**
 * Helper para esperar a que una página cargue completamente
 */
export async function waitForPageLoad(page: Page, timeout = 30000) {
  await page.waitForLoadState('networkidle', { timeout });
  await page.waitForLoadState('domcontentloaded', { timeout });
}

/**
 * Helper para verificar que no hay errores en consola
 */
export async function expectNoConsoleErrors(page: Page, ignorePatterns: string[] = []) {
  const errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      const shouldIgnore = ignorePatterns.some(pattern => text.includes(pattern));
      if (!shouldIgnore) {
        errors.push(text);
      }
    }
  });
  
  // Esperar un momento para capturar errores
  await page.waitForTimeout(1000);
  
  if (errors.length > 0) {
    throw new Error(`Errores en consola: ${errors.join(', ')}`);
  }
}

/**
 * Helper para verificar respuestas HTTP
 */
export async function expectHttpStatus(
  page: Page,
  urlPattern: string | RegExp,
  expectedStatus: number,
  timeout = 10000
) {
  const responses: { url: string; status: number }[] = [];
  
  page.on('response', response => {
    const url = response.url();
    const matches = typeof urlPattern === 'string' 
      ? url.includes(urlPattern)
      : urlPattern.test(url);
    
    if (matches) {
      responses.push({ url, status: response.status() });
    }
  });
  
  // Esperar a que se complete la navegación
  await page.waitForLoadState('networkidle', { timeout });
  
  const matchingResponse = responses.find(r => r.status === expectedStatus);
  expect(matchingResponse, `No se encontró respuesta con status ${expectedStatus} para ${urlPattern}`).toBeDefined();
}

/**
 * Helper para verificar que no hay errores HTTP críticos
 */
export async function expectNoCriticalHttpErrors(
  page: Page,
  ignorePatterns: string[] = []
) {
  const errors: { url: string; status: number }[] = [];
  
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    
    // Errores críticos: 401, 403, 406, 500, 502, 503
    if ([401, 403, 406, 500, 502, 503].includes(status)) {
      const shouldIgnore = ignorePatterns.some(pattern => url.includes(pattern));
      if (!shouldIgnore) {
        errors.push({ url, status });
      }
    }
  });
  
  // Esperar a que se complete la navegación
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  
  if (errors.length > 0) {
    const errorMessages = errors.map(e => `${e.url}: ${e.status}`).join(', ');
    throw new Error(`Errores HTTP críticos encontrados: ${errorMessages}`);
  }
}

/**
 * Helper para esperar a que un elemento esté visible
 */
export async function waitForVisible(
  page: Page,
  selector: string,
  timeout = 10000
) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Helper para verificar que un elemento contiene texto
 */
export async function expectTextContent(
  page: Page,
  selector: string,
  expectedText: string | RegExp
) {
  const element = page.locator(selector).first();
  await expect(element).toContainText(expectedText);
}

/**
 * Helper para hacer click y esperar navegación
 */
export async function clickAndWaitForNavigation(
  page: Page,
  selector: string,
  expectedUrl?: string | RegExp
) {
  const navigationPromise = page.waitForURL(expectedUrl || /.*/, { timeout: 10000 });
  await page.locator(selector).first().click();
  await navigationPromise;
}

/**
 * Helper para verificar que una ruta está protegida
 */
export async function expectProtectedRoute(
  page: Page,
  route: string,
  shouldRedirectToLogin = true
) {
  await page.goto(route);
  
  if (shouldRedirectToLogin) {
    await page.waitForURL(/login/, { timeout: 5000 });
    expect(page.url()).toContain('/login');
  }
}

/**
 * Helper para verificar métricas en dashboard
 */
export async function expectDashboardMetrics(page: Page) {
  // Verificar que hay elementos de métricas
  const metricsSelectors = [
    'text=Equipos',
    'text=Actividades',
    'text=Presupuesto',
    '[class*="metric"]',
    '[class*="card"]'
  ];
  
  let found = false;
  for (const selector of metricsSelectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        found = true;
        break;
      }
    } catch {
      // Continuar con el siguiente selector
    }
  }
  
  expect(found, 'No se encontraron métricas en el dashboard').toBe(true);
}



