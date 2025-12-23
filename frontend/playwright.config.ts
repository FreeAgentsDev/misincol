import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para pruebas E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  
  /* Tiempo máximo para una prueba */
  timeout: 30 * 1000,
  
  /* Tiempo de espera para expect */
  expect: {
    timeout: 5000
  },
  
  /* Ejecutar pruebas en paralelo */
  fullyParallel: true,
  
  /* Falla el build en CI si accidentalmente dejaste test.only en el código */
  forbidOnly: !!process.env.CI,
  
  /* Reintentos en CI */
  retries: process.env.CI ? 2 : 0,
  
  /* Workers en CI vs local */
  workers: process.env.CI ? 1 : undefined,
  
  /* Configuración del reporter */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  /* Configuración compartida para todos los proyectos */
  use: {
    /* URL base para usar en navegación */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    /* Recopilar trace cuando se repite una prueba fallida */
    trace: 'on-first-retry',
    
    /* Screenshots solo en fallos */
    screenshot: 'only-on-failure',
    
    /* Videos solo en fallos */
    video: 'retain-on-failure',
    
    /* Timeout para acciones */
    actionTimeout: 10000,
    
    /* Timeout para navegación */
    navigationTimeout: 30000,
  },

  /* Configurar proyectos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test contra navegadores móviles */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Ejecutar servidor de desarrollo local antes de las pruebas */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});



