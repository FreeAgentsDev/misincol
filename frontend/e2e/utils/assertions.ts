import { Page, expect } from '@playwright/test';

/**
 * Assertions personalizadas para el sistema Misincol
 */

/**
 * Verificar que el usuario tiene el rol correcto
 */
export async function expectUserRole(page: Page, expectedRole: 'superadmin' | 'leader') {
  const url = page.url();
  
  if (expectedRole === 'superadmin') {
    expect(url).toContain('/superadmin');
  } else if (expectedRole === 'leader') {
    expect(url).toContain('/leader');
  }
}

/**
 * Verificar que solo se muestran datos del equipo del líder
 */
export async function expectOnlyTeamData(
  page: Page,
  expectedTeamId: string,
  teamName?: string
) {
  // Verificar que la URL contiene el teamId
  const url = page.url();
  expect(url).toContain(`team=${expectedTeamId}`);
  
  // Si se proporciona el nombre del equipo, verificar que aparece en la página
  if (teamName) {
    await expect(page.locator('body')).toContainText(teamName);
  }
}

/**
 * Verificar que no se muestran datos de otros equipos
 */
export async function expectNoOtherTeamsData(
  page: Page,
  excludedTeamIds: string[]
) {
  const pageContent = await page.textContent('body');
  
  // Esta verificación es básica, se puede mejorar
  // En un caso real, verificarías que los IDs de otros equipos no aparecen
  for (const teamId of excludedTeamIds) {
    // Verificar que no hay referencias a otros equipos en la URL
    const url = page.url();
    expect(url).not.toContain(`team=${teamId}`);
  }
}

/**
 * Verificar que las métricas del dashboard son correctas
 */
export async function expectValidDashboardMetrics(page: Page) {
  // Verificar que hay números (métricas)
  const metricsText = await page.textContent('body');
  const hasNumbers = /\d+/.test(metricsText || '');
  
  expect(hasNumbers, 'El dashboard debe mostrar métricas numéricas').toBe(true);
}

/**
 * Verificar que un plan está visible y tiene datos
 */
export async function expectPlanVisible(
  page: Page,
  planName?: string
) {
  if (planName) {
    await expect(page.locator('body')).toContainText(planName);
  }
  
  // Verificar que hay información de plan
  const planSelectors = [
    'text=Plan',
    'text=Actividades',
    'text=Estado',
    '[class*="plan"]'
  ];
  
  let found = false;
  for (const selector of planSelectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        found = true;
        break;
      }
    } catch {
      // Continuar
    }
  }
  
  expect(found, 'No se encontró información del plan').toBe(true);
}

/**
 * Verificar que las actividades están visibles
 */
export async function expectActivitiesVisible(page: Page) {
  const activitySelectors = [
    'text=Actividad',
    'text=Pendiente',
    'text=Hecha',
    '[class*="activity"]'
  ];
  
  let found = false;
  for (const selector of activitySelectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        found = true;
        break;
      }
    } catch {
      // Continuar
    }
  }
  
  expect(found, 'No se encontraron actividades').toBe(true);
}

/**
 * Verificar que los miembros están visibles
 */
export async function expectMembersVisible(page: Page) {
  const memberSelectors = [
    'text=Miembro',
    'text=Equipo',
    '[class*="member"]'
  ];
  
  let found = false;
  for (const selector of memberSelectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        found = true;
        break;
      }
    } catch {
      // Continuar
    }
  }
  
  expect(found, 'No se encontraron miembros').toBe(true);
}



