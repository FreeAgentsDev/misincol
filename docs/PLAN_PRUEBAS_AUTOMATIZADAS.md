# Plan de Pruebas Automatizadas - Sistema Misincol

**Fecha:** 2025-01-13  
**Versión:** 1.0  
**Objetivo:** Automatizar el flujo completo de pruebas para agilizar el desarrollo y garantizar la calidad del sistema

---

## 📋 Índice

1. [Análisis del Sistema](#análisis-del-sistema)
2. [Estrategia de Pruebas](#estrategia-de-pruebas)
3. [Estructura de Pruebas](#estructura-de-pruebas)
4. [Casos de Prueba Detallados](#casos-de-prueba-detallados)
5. [Configuración Técnica](#configuración-técnica)
6. [Ejecución y Reportes](#ejecución-y-reportes)

---

## 🔍 Análisis del Sistema

### Frontend (Next.js 14)

**Rutas Principales:**

#### Autenticación
- `/login` - Página de login con usuarios demo

#### Superadmin
- `/superadmin/dashboard` - Dashboard global con métricas de todos los equipos
- `/superadmin/manage` - Gestión de equipos (lista)
- `/superadmin/teams/[teamId]` - Detalle de equipo
- `/superadmin/teams/create` - Crear nuevo equipo
- `/superadmin/plans` - Historial de planes
- `/superadmin/plans-list` - Lista de planes
- `/superadmin/plans/[planId]` - Detalle de plan
- `/superadmin/plans/[planId]/activities/[activityId]` - Detalle de actividad

#### Leader
- `/leader/dashboard` - Dashboard del equipo del líder
- `/leader/plans` - Planes del equipo
- `/leader/plans-list` - Lista de planes del equipo
- `/leader/plans/[planId]` - Detalle de plan
- `/leader/plans/[planId]/activities/[activityId]` - Detalle de actividad
- `/leader/activities` - Actividades del plan activo
- `/leader/members` - Miembros del equipo
- `/leader/category/[category]` - Vista por categoría (Investigación, Encarnación, etc.)

### Backend (Supabase)

**Tablas Principales:**
- `perfiles` - Perfiles de usuario (username, rol, id_equipo)
- `equipos` - Equipos con líder y presupuesto
- `planes_desarrollo` - Planes de desarrollo por equipo
- `actividades` - Actividades de los planes
- `miembros_equipo` - Relación miembros-equipos
- `metricas_equipo` - Métricas eclesiales de cada equipo
- `objetivos_area` - Objetivos por área de los planes
- `asignaciones_actividad` - Asignaciones de miembros a actividades
- `actualizaciones_actividad` - Historial de actualizaciones

**Funciones RPC:**
- `obtener_metricas_dashboard_equipo()` - Métricas agregadas para dashboard

**Políticas RLS:**
- Superadmin: Acceso total
- Leader: Solo su equipo (`id_equipo = get_user_team_id()`)
- Member: Solo lectura de su equipo y asignaciones

### Usuarios de Prueba

```typescript
const TEST_USERS = {
  superadmin: {
    username: 'superadmin',
    password: 'superadmin123',
    email: 'superadmin@misincol.local',
    role: 'superadmin',
    teamId: undefined
  },
  liderBari: {
    username: 'lider-bari',
    password: 'lider123',
    email: 'lider-bari@misincol.local',
    role: 'leader',
    teamId: '11111111-1111-1111-1111-111111111111'
  },
  liderKatios: {
    username: 'lider-katios',
    password: 'lider123',
    email: 'lider-katios@misincol.local',
    role: 'leader',
    teamId: '22222222-2222-2222-2222-222222222222'
  }
};
```

---

## 🎯 Estrategia de Pruebas

### Niveles de Prueba

1. **Pruebas E2E (End-to-End)**
   - Flujos completos de usuario
   - Navegación entre páginas
   - Interacciones con formularios
   - Validación de datos en UI

2. **Pruebas de Integración**
   - Comunicación Frontend ↔ Backend
   - Validación de RLS (Row Level Security)
   - Verificación de respuestas HTTP
   - Validación de datos en base de datos

3. **Pruebas de Regresión**
   - Smoke tests rápidos
   - Validación de funcionalidades críticas
   - Detección temprana de bugs

### Cobertura Objetivo

- ✅ **Autenticación:** 100% (login, logout, sesión persistente, redirecciones)
- ✅ **Navegación por Rol:** 100% (rutas protegidas, redirecciones)
- ✅ **Funcionalidades Superadmin:** 80% (CRUD equipos, visualización métricas)
- ✅ **Funcionalidades Leader:** 80% (dashboard, planes, actividades, miembros)
- ✅ **Integración Backend:** 70% (llamadas API, RLS, validación de datos)

---

## 📁 Estructura de Pruebas

```
frontend/
├── e2e/
│   ├── fixtures/
│   │   ├── auth.ts          # Helpers de autenticación
│   │   ├── test-data.ts     # Datos de prueba
│   │   └── users.ts         # Usuarios de prueba
│   ├── utils/
│   │   ├── helpers.ts       # Utilidades generales
│   │   └── assertions.ts    # Assertions personalizadas
│   ├── auth/
│   │   ├── login.spec.ts     # Pruebas de login
│   │   ├── logout.spec.ts   # Pruebas de logout
│   │   └── session.spec.ts  # Pruebas de sesión persistente
│   ├── superadmin/
│   │   ├── dashboard.spec.ts
│   │   ├── teams.spec.ts
│   │   ├── plans.spec.ts
│   │   └── navigation.spec.ts
│   ├── leader/
│   │   ├── dashboard.spec.ts
│   │   ├── plans.spec.ts
│   │   ├── activities.spec.ts
│   │   ├── members.spec.ts
│   │   └── navigation.spec.ts
│   ├── integration/
│   │   ├── rls-policies.spec.ts
│   │   ├── api-responses.spec.ts
│   │   └── data-flow.spec.ts
│   └── smoke/
│       ├── superadmin-smoke.spec.ts
│       └── leader-smoke.spec.ts
├── playwright.config.ts
└── package.json
```

---

## 📝 Casos de Prueba Detallados

### 1. Autenticación

#### 1.1 Login Exitoso
- **Usuario:** superadmin / superadmin123
- **Pasos:**
  1. Navegar a `/login`
  2. Ingresar credenciales
  3. Click en "Entrar"
- **Resultado Esperado:**
  - Redirección a `/superadmin/dashboard`
  - No hay errores en consola
  - Usuario autenticado visible en UI

#### 1.2 Login con Usuario Demo
- **Pasos:**
  1. Navegar a `/login`
  2. Click en botón "Super Administrador"
- **Resultado Esperado:**
  - Campos se llenan automáticamente
  - Login exitoso

#### 1.3 Login Fallido
- **Usuario:** superadmin / contraseña_incorrecta
- **Resultado Esperado:**
  - Mensaje de error visible
  - No se realiza login
  - Usuario permanece en `/login`

#### 1.4 Logout
- **Pasos:**
  1. Login exitoso
  2. Ejecutar logout
- **Resultado Esperado:**
  - Redirección a `/login`
  - Sesión cerrada
  - No se puede acceder a rutas protegidas

#### 1.5 Sesión Persistente
- **Pasos:**
  1. Login exitoso
  2. Recargar página
- **Resultado Esperado:**
  - Sesión se mantiene
  - Redirección automática al dashboard según rol

### 2. Navegación y Rutas Protegidas

#### 2.1 Redirección por Rol - Superadmin
- **Pasos:**
  1. Login como superadmin
  2. Intentar acceder a `/leader/dashboard`
- **Resultado Esperado:**
  - Redirección a `/superadmin/dashboard`

#### 2.2 Redirección por Rol - Leader
- **Pasos:**
  1. Login como líder
  2. Intentar acceder a `/superadmin/dashboard`
- **Resultado Esperado:**
  - Redirección a `/leader/dashboard?team={teamId}`

#### 2.3 Acceso No Autenticado
- **Pasos:**
  1. Sin login
  2. Intentar acceder a `/superadmin/dashboard`
- **Resultado Esperado:**
  - Redirección a `/login`

### 3. Superadmin - Dashboard

#### 3.1 Carga de Métricas
- **Pasos:**
  1. Login como superadmin
  2. Navegar a `/superadmin/dashboard`
- **Resultado Esperado:**
  - Dashboard carga sin errores
  - Muestra métricas de todos los equipos
  - Totales agregados correctos
  - No hay errores en consola

#### 3.2 Validación de Datos
- **Verificar:**
  - Nombre de equipo visible
  - Líder visible
  - Plan activo visible
  - Contadores de actividades correctos
  - Presupuesto liquidado/pendiente visible

#### 3.3 Navegación desde Dashboard
- **Pasos:**
  1. Ver dashboard
  2. Click en "Ver detalle" de un equipo
- **Resultado Esperado:**
  - Navegación a `/superadmin/teams/{teamId}`

### 4. Superadmin - Gestión de Equipos

#### 4.1 Lista de Equipos
- **Pasos:**
  1. Navegar a `/superadmin/manage`
- **Resultado Esperado:**
  - Lista todos los equipos
  - Muestra nombre, líder, presupuesto
  - Links a detalle funcionan

#### 4.2 Detalle de Equipo
- **Pasos:**
  1. Navegar a `/superadmin/manage`
  2. Click en un equipo
- **Resultado Esperado:**
  - Muestra información completa del equipo
  - Muestra planes del equipo
  - Muestra miembros del equipo
  - Datos correctos según BD

#### 4.3 Crear Equipo
- **Pasos:**
  1. Navegar a `/superadmin/teams/create`
  2. Llenar formulario
  3. Click en "Crear"
- **Resultado Esperado:**
  - Equipo creado exitosamente
  - Redirección a detalle del equipo
  - Equipo visible en lista

### 5. Superadmin - Planes

#### 5.1 Lista de Planes
- **Pasos:**
  1. Navegar a `/superadmin/plans-list`
- **Resultado Esperado:**
  - Muestra todos los planes
  - Filtros funcionan (si existen)
  - Links a detalle funcionan

#### 5.2 Detalle de Plan
- **Pasos:**
  1. Navegar a lista de planes
  2. Click en un plan
- **Resultado Esperado:**
  - Muestra información completa
  - Muestra actividades del plan
  - Muestra objetivos de área

### 6. Leader - Dashboard

#### 6.1 Carga de Dashboard
- **Pasos:**
  1. Login como líder
  2. Navegar a `/leader/dashboard`
- **Resultado Esperado:**
  - Dashboard carga sin errores
  - Muestra SOLO datos del equipo del líder
  - Muestra plan activo del equipo
  - Métricas correctas

#### 6.2 Validación de Aislamiento
- **Verificar:**
  - No muestra datos de otros equipos
  - Solo muestra su equipo
  - Solo muestra planes de su equipo

### 7. Leader - Planes

#### 7.1 Lista de Planes
- **Pasos:**
  1. Login como líder
  2. Navegar a `/leader/plans-list`
- **Resultado Esperado:**
  - Muestra SOLO planes del equipo
  - No muestra planes de otros equipos
  - Links funcionan

#### 7.2 Detalle de Plan
- **Pasos:**
  1. Navegar a lista de planes
  2. Click en un plan
- **Resultado Esperado:**
  - Muestra información completa
  - Muestra actividades del plan
  - Botón "Duplicar Plan" visible (si existe)

### 8. Leader - Actividades

#### 8.1 Lista de Actividades
- **Pasos:**
  1. Login como líder
  2. Navegar a `/leader/activities`
- **Resultado Esperado:**
  - Muestra SOLO actividades del equipo
  - Filtros por categoría funcionan
  - Links a detalle funcionan

#### 8.2 Cambiar Estado de Actividad
- **Pasos:**
  1. Ir a detalle de actividad
  2. Cambiar estado de "Pendiente" a "Hecha"
  3. Guardar
- **Resultado Esperado:**
  - Estado actualizado
  - Métricas del dashboard se actualizan
  - Cambio reflejado en BD

### 9. Leader - Miembros

#### 9.1 Lista de Miembros
- **Pasos:**
  1. Login como líder
  2. Navegar a `/leader/members`
- **Resultado Esperado:**
  - Muestra miembros del equipo
  - Información de cada miembro visible
  - Botones para agregar/remover (si existen)

### 10. Integración - RLS y Seguridad

#### 10.1 Validación RLS - Leader
- **Pasos:**
  1. Login como líder
  2. Intentar acceder a datos de otro equipo
- **Resultado Esperado:**
  - No puede ver datos de otros equipos
  - Respuestas 403 o datos vacíos según RLS

#### 10.2 Validación RLS - Superadmin
- **Pasos:**
  1. Login como superadmin
  2. Acceder a datos de cualquier equipo
- **Resultado Esperado:**
  - Puede ver todos los datos
  - Respuestas 200

### 11. Integración - API y Red

#### 11.1 Validación de Respuestas HTTP
- **Verificar:**
  - Requests a `perfiles` → 200
  - Requests a `equipos` → 200
  - Requests a `planes_desarrollo` → 200
  - Requests a `actividades` → 200
  - Requests a `miembros_equipo` → 200
  - Requests a `metricas_equipo` → 200
  - No hay errores 401/403/406

#### 11.2 Validación de Errores
- **Verificar:**
  - No hay errores en consola
  - No hay errores no controlados
  - Mensajes de error amigables

### 12. Smoke Tests

#### 12.1 Smoke Test Superadmin
- **Pasos:**
  1. Login como superadmin
  2. Navegar por todas las rutas principales
- **Resultado Esperado:**
  - Todas las páginas cargan
  - No hay errores críticos

#### 12.2 Smoke Test Leader
- **Pasos:**
  1. Login como líder
  2. Navegar por todas las rutas principales
- **Resultado Esperado:**
  - Todas las páginas cargan
  - No hay errores críticos

---

## ⚙️ Configuración Técnica

### Playwright

**Instalación:**
```bash
npm install -D @playwright/test
npx playwright install --with-deps
```

**Configuración (`playwright.config.ts`):**
- Base URL: `http://localhost:3000`
- Timeout: 30 segundos
- Navegadores: Chromium, Firefox, WebKit
- Screenshots: Solo en fallos
- Videos: Solo en fallos

### Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Datos de Prueba

- Usuarios ya creados en Supabase Auth
- Perfiles ya creados en tabla `perfiles`
- Equipos de prueba con datos mínimos
- Planes y actividades de prueba

---

## 🚀 Ejecución y Reportes

### Comandos

```bash
# Ejecutar todas las pruebas
npm run test:e2e

# Ejecutar pruebas en modo UI
npm run test:e2e:ui

# Ejecutar pruebas específicas
npm run test:e2e -- auth/login.spec.ts

# Ejecutar en modo headed
npm run test:e2e -- --headed

# Generar reporte HTML
npm run test:e2e -- --reporter=html
```

### Reportes

- **HTML Report:** Generado automáticamente después de cada ejecución
- **Screenshots:** Capturados en fallos
- **Videos:** Grabados en fallos
- **Logs:** Consola del navegador y network logs

### CI/CD

**GitHub Actions (futuro):**
```yaml
- name: Run E2E tests
  run: npm run test:e2e
```

---

## 📊 Métricas de Cobertura

### Objetivos

- **Autenticación:** 100%
- **Navegación:** 100%
- **Superadmin:** 80%
- **Leader:** 80%
- **Integración:** 70%

### Seguimiento

- Ejecutar pruebas antes de cada commit
- Reportes semanales de cobertura
- Alertas en caso de regresiones

---

## 🔄 Mantenimiento

### Actualización de Pruebas

- Actualizar cuando se agreguen nuevas rutas
- Actualizar cuando cambien flujos de usuario
- Actualizar cuando cambien selectores de UI

### Datos de Prueba

- Mantener usuarios de prueba actualizados
- Limpiar datos de prueba después de ejecuciones (si es necesario)
- Documentar dependencias de datos

---

**Última Actualización:** 2025-01-13



