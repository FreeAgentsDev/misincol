# Pruebas E2E - Sistema Misincol

Este directorio contiene las pruebas automatizadas end-to-end (E2E) del sistema Misincol usando Playwright.

## 📁 Estructura

```
e2e/
├── fixtures/          # Datos y helpers reutilizables
│   ├── auth.ts       # Helpers de autenticación
│   ├── users.ts      # Usuarios de prueba
│   └── test-data.ts  # Datos de prueba (futuro)
├── utils/            # Utilidades y assertions
│   ├── helpers.ts    # Funciones helper generales
│   └── assertions.ts # Assertions personalizadas
├── auth/             # Pruebas de autenticación
│   ├── login.spec.ts
│   ├── logout.spec.ts
│   └── session.spec.ts
├── superadmin/       # Pruebas de Superadmin
│   ├── dashboard.spec.ts
│   └── navigation.spec.ts
├── leader/           # Pruebas de Leader
│   ├── dashboard.spec.ts
│   └── navigation.spec.ts
├── integration/      # Pruebas de integración
│   ├── rls-policies.spec.ts
│   └── api-responses.spec.ts
└── smoke/            # Smoke tests rápidos
    ├── superadmin-smoke.spec.ts
    └── leader-smoke.spec.ts
```

## 🚀 Comandos Disponibles

### Ejecutar todas las pruebas
```bash
npm run test:e2e
```

### Ejecutar pruebas en modo UI (interactivo)
```bash
npm run test:e2e:ui
```

### Ejecutar pruebas en modo headed (ver navegador)
```bash
npm run test:e2e:headed
```

### Ejecutar pruebas en modo debug
```bash
npm run test:e2e:debug
```

### Ver reporte HTML
```bash
npm run test:e2e:report
```

### Ejecutar pruebas específicas
```bash
# Ejecutar solo pruebas de autenticación
npm run test:e2e -- auth

# Ejecutar solo pruebas de superadmin
npm run test:e2e -- superadmin

# Ejecutar un archivo específico
npm run test:e2e -- auth/login.spec.ts
```

## 📋 Requisitos Previos

1. **Servidor de desarrollo ejecutándose:**
   ```bash
   npm run dev
   ```
   Las pruebas automáticamente iniciarán el servidor si no está corriendo.

2. **Usuarios de prueba configurados en Supabase:**
   - `superadmin` / `superadmin123`
   - `lider-bari` / `lider123`
   - `lider-katios` / `lider123`

3. **Variables de entorno configuradas:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🧪 Tipos de Pruebas

### Pruebas de Autenticación
- Login exitoso (superadmin y líder)
- Login con usuario demo
- Login fallido
- Logout
- Sesión persistente

### Pruebas de Superadmin
- Dashboard con métricas
- Navegación entre rutas
- Gestión de equipos
- Visualización de planes

### Pruebas de Leader
- Dashboard del equipo
- Aislamiento de datos (solo su equipo)
- Navegación entre rutas
- Visualización de planes y actividades

### Pruebas de Integración
- Validación de RLS (Row Level Security)
- Respuestas HTTP correctas
- Validación de errores 401/403/406

### Smoke Tests
- Navegación rápida por todas las rutas
- Verificación de carga sin errores

## 🔧 Configuración

La configuración de Playwright está en `playwright.config.ts` en la raíz del proyecto frontend.

### Configuración Actual:
- **Base URL:** `http://localhost:3000`
- **Timeout:** 30 segundos por prueba
- **Navegadores:** Chromium, Firefox, WebKit
- **Screenshots:** Solo en fallos
- **Videos:** Solo en fallos

## 📊 Reportes

Después de ejecutar las pruebas, se genera un reporte HTML en `playwright-report/`.

Para ver el reporte:
```bash
npm run test:e2e:report
```

## 🐛 Debugging

### Modo Debug
```bash
npm run test:e2e:debug
```

### Modo Headed (ver navegador)
```bash
npm run test:e2e:headed
```

### Pausar en fallos
```bash
npm run test:e2e -- --pause-on-failure
```

### Ejecutar en un navegador específico
```bash
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

## 📝 Escribir Nuevas Pruebas

### Ejemplo Básico

```typescript
import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';
import { waitForPageLoad } from '../utils/helpers';

test.describe('Mi Nueva Prueba', () => {
  test('debe hacer algo', async ({ page }) => {
    await loginAs(page, 'superadmin');
    await page.goto('/mi-ruta');
    await waitForPageLoad(page);
    
    // Tus assertions aquí
    expect(page.url()).toContain('/mi-ruta');
  });
});
```

### Helpers Disponibles

- `loginAs(page, userKey)` - Login con usuario de prueba
- `logout(page)` - Cerrar sesión
- `waitForPageLoad(page)` - Esperar carga completa
- `expectNoConsoleErrors(page)` - Verificar sin errores en consola
- `expectNoCriticalHttpErrors(page)` - Verificar sin errores HTTP críticos

## ⚠️ Notas Importantes

1. **Datos de Prueba:** Las pruebas asumen que los usuarios de prueba existen en Supabase. Si cambias los usuarios, actualiza `e2e/fixtures/users.ts`.

2. **RLS:** Las pruebas verifican que las políticas RLS funcionan correctamente. Asegúrate de que las políticas estén configuradas en Supabase.

3. **Timeouts:** Si las pruebas fallan por timeout, puede ser que el servidor esté lento o haya problemas de conexión con Supabase.

4. **Paralelización:** Las pruebas se ejecutan en paralelo por defecto. Si hay conflictos, puedes ejecutarlas secuencialmente con `--workers=1`.

## 🔄 CI/CD

Para integrar en CI/CD, agrega:

```yaml
# .github/workflows/e2e.yml
- name: Run E2E tests
  run: npm run test:e2e
```

## 📚 Recursos

- [Documentación de Playwright](https://playwright.dev/)
- [Plan de Pruebas](./docs/PLAN_PRUEBAS_AUTOMATIZADAS.md)
- [Flujo de Pruebas Manuales](./docs/FLUJO_PRUEBAS.md)



