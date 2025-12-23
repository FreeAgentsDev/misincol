# Flujo de Pruebas - Sistema Misincol

**Fecha:** 2025-01-13  
**Versión:** 1.0  
**Objetivo:** Validar el funcionamiento completo del sistema después de la integración con Supabase

---

## 📋 Índice

1. [Preparación del Entorno](#preparación-del-entorno)
2. [Pruebas de Autenticación](#pruebas-de-autenticación)
3. [Pruebas SuperAdmin](#pruebas-superadmin)
4. [Pruebas Leader](#pruebas-leader)
5. [Pruebas de Integración](#pruebas-de-integración)
6. [Pruebas de Errores](#pruebas-de-errores)
7. [Pruebas de Performance](#pruebas-de-performance)
8. [Checklist Final](#checklist-final)

---

## 🔧 Preparación del Entorno

### Requisitos Previos

- [ ] Backend de Supabase configurado y funcionando
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Usuarios de prueba creados en Supabase Auth
- [ ] Perfiles creados en tabla `perfiles`
- [ ] Datos de prueba (equipos, planes, actividades) en la base de datos
- [ ] Servidor de desarrollo ejecutándose (`npm run dev`)

### Script de Verificación

Ejecutar en SQL Editor de Supabase:

```sql
-- Verificar usuarios de prueba
SELECT id, email, raw_user_meta_data->>'nombre_usuario' as username
FROM auth.users
WHERE email IN (
  'superadmin@misincol.local',
  'lider-bari@misincol.local',
  'lider-katios@misincol.local'
);

-- Verificar perfiles
SELECT id, nombre_usuario, nombre_completo, rol, id_equipo
FROM perfiles
WHERE nombre_usuario IN ('superadmin', 'lider-bari', 'lider-katios');

-- Verificar equipos
SELECT id, nombre, id_lider, presupuesto_asignado
FROM equipos
LIMIT 5;

-- Verificar planes
SELECT id, nombre, id_equipo, estado
FROM planes_desarrollo
LIMIT 5;

-- Verificar actividades
SELECT id, nombre, id_plan, estado
FROM actividades
LIMIT 5;
```

**Resultado Esperado:** Todas las consultas deben retornar datos.

---

## 🔐 Pruebas de Autenticación

### Test 1: Login Exitoso

**Usuario:** `superadmin`  
**Contraseña:** `superadmin123`

**Pasos:**
1. Ir a `/login`
2. Ingresar usuario y contraseña
3. Click en "Entrar"

**Resultado Esperado:**
- ✅ Redirección a `/superadmin/dashboard`
- ✅ No hay errores en consola
- ✅ Usuario autenticado visible en la interfaz

**Verificar en Consola:**
```
✅ [LOGIN] Autenticación exitosa!
✅ [PROFILE] Perfil cargado exitosamente
```

---

### Test 2: Login con Usuario Demo

**Pasos:**
1. Ir a `/login`
2. Click en botón "Super Administrador"

**Resultado Esperado:**
- ✅ Campos se llenan automáticamente
- ✅ Login exitoso al hacer click en "Entrar"

---

### Test 3: Login Fallido - Credenciales Incorrectas

**Usuario:** `superadmin`  
**Contraseña:** `contraseña_incorrecta`

**Pasos:**
1. Ir a `/login`
2. Ingresar credenciales incorrectas
3. Click en "Entrar"

**Resultado Esperado:**
- ✅ Mensaje de error: "Usuario o contraseña inválidos"
- ✅ No se realiza login
- ✅ Usuario permanece en página de login

---

### Test 4: Logout

**Pasos:**
1. Estar autenticado
2. Click en botón "Cerrar Sesión" (si existe) o ejecutar logout desde consola

**Resultado Esperado:**
- ✅ Redirección a `/login`
- ✅ Sesión cerrada en Supabase
- ✅ No se puede acceder a rutas protegidas

---

### Test 5: Sesión Persistente

**Pasos:**
1. Hacer login
2. Cerrar el navegador completamente
3. Abrir el navegador nuevamente
4. Ir a la URL del proyecto

**Resultado Esperado:**
- ✅ Sesión se mantiene (si está configurado)
- ✅ Redirección automática al dashboard según rol
- ✅ No requiere login nuevamente

---

## 👑 Pruebas SuperAdmin

### Test 6: Dashboard SuperAdmin

**Usuario:** `superadmin`

**Pasos:**
1. Login como superadmin
2. Ir a `/superadmin/dashboard`

**Resultado Esperado:**
- ✅ Dashboard carga sin errores
- ✅ Muestra métricas de todos los equipos:
  - Nombre de equipo
  - Líder
  - Plan activo
  - Actividades pendientes/completadas
  - Presupuesto liquidado/pendiente
- ✅ Totales agregados correctos
- ✅ No hay errores en consola

**Verificar en Consola:**
```
✅ [DASHBOARD] Métricas cargadas: X equipos
```

**Verificar en Red (DevTools):**
- Request a `obtener_metricas_dashboard_equipo()` RPC
- Status 200
- Datos retornados correctamente

---

### Test 7: Gestión de Equipos - Lista

**Pasos:**
1. Ir a `/superadmin/manage`

**Resultado Esperado:**
- ✅ Lista todos los equipos de la base de datos
- ✅ Muestra: nombre, líder, presupuesto
- ✅ Links a detalle de equipo funcionan

---

### Test 8: Gestión de Equipos - Detalle

**Pasos:**
1. Ir a `/superadmin/manage`
2. Click en un equipo

**Resultado Esperado:**
- ✅ Muestra información completa del equipo
- ✅ Muestra planes del equipo
- ✅ Muestra miembros del equipo
- ✅ Datos correctos según la base de datos

---

### Test 9: Crear Equipo

**Pasos:**
1. Ir a `/superadmin/teams/create`
2. Llenar formulario:
   - Nombre: "Equipo de Prueba"
   - Presupuesto: 1000000
   - Líder: Seleccionar de lista
3. Click en "Crear"

**Resultado Esperado:**
- ✅ Equipo creado exitosamente
- ✅ Redirección a detalle del equipo
- ✅ Equipo visible en lista de equipos
- ✅ Datos guardados en Supabase

**Verificar en Supabase:**
```sql
SELECT * FROM equipos WHERE nombre = 'Equipo de Prueba';
```

---

### Test 10: Editar Equipo

**Pasos:**
1. Ir a detalle de un equipo
2. Click en "Editar"
3. Modificar nombre o presupuesto
4. Guardar

**Resultado Esperado:**
- ✅ Cambios guardados
- ✅ Datos actualizados en la interfaz
- ✅ Datos actualizados en Supabase

---

### Test 11: Lista de Planes

**Pasos:**
1. Ir a `/superadmin/plans`

**Resultado Esperado:**
- ✅ Muestra todos los planes de todos los equipos
- ✅ Filtros funcionan (si existen)
- ✅ Links a detalle funcionan

---

### Test 12: Ver Detalle de Plan

**Pasos:**
1. Ir a lista de planes
2. Click en un plan

**Resultado Esperado:**
- ✅ Muestra información completa del plan
- ✅ Muestra actividades del plan
- ✅ Muestra objetivos de área
- ✅ Datos correctos

---

## 👥 Pruebas Leader

### Test 13: Dashboard Leader

**Usuario:** `lider-bari` o `lider-katios`  
**Contraseña:** `lider123`

**Pasos:**
1. Login como líder
2. Ir a `/leader/dashboard`

**Resultado Esperado:**
- ✅ Dashboard carga sin errores
- ✅ Muestra datos SOLO del equipo del líder
- ✅ Muestra plan activo del equipo
- ✅ Muestra métricas del equipo:
  - Áreas asignadas
  - Actividades activas/completadas
  - Progreso general
- ✅ No muestra datos de otros equipos

**Verificar en Consola:**
```
✅ [DASHBOARD] Equipo cargado: [nombre del equipo]
✅ [DASHBOARD] Plan activo: [nombre del plan]
```

---

### Test 14: Ver Planes del Equipo

**Pasos:**
1. Login como líder
2. Ir a `/leader/plans`

**Resultado Esperado:**
- ✅ Muestra SOLO planes del equipo del líder
- ✅ No muestra planes de otros equipos
- ✅ Links a detalle funcionan

---

### Test 15: Ver Detalle de Plan

**Pasos:**
1. Ir a lista de planes
2. Click en un plan

**Resultado Esperado:**
- ✅ Muestra información completa del plan
- ✅ Muestra actividades del plan
- ✅ Botón "Duplicar Plan" visible (si existe)

---

### Test 16: Crear Plan

**Pasos:**
1. Ir a crear plan (si existe la ruta)
2. Llenar formulario:
   - Nombre: "Plan de Prueba"
   - Categoría: Seleccionar
   - Fechas: Inicio y fin
   - Resumen: Texto
3. Guardar

**Resultado Esperado:**
- ✅ Plan creado exitosamente
- ✅ Plan visible en lista
- ✅ Plan guardado en Supabase con `id_equipo` correcto

**Verificar en Supabase:**
```sql
SELECT * FROM planes_desarrollo 
WHERE nombre = 'Plan de Prueba' 
AND id_equipo = '[teamId del líder]';
```

---

### Test 17: Duplicar Plan

**Pasos:**
1. Ir a detalle de un plan
2. Click en "Duplicar Plan"
3. Ingresar nuevo nombre y fechas
4. Confirmar

**Resultado Esperado:**
- ✅ Plan duplicado exitosamente
- ✅ Nuevo plan creado con actividades duplicadas
- ✅ Actividades con estado "Pendiente" y presupuesto en 0
- ✅ Redirección a nuevo plan

**Verificar en Supabase:**
```sql
-- Verificar que se creó el nuevo plan
SELECT COUNT(*) FROM planes_desarrollo WHERE nombre = '[nuevo nombre]';

-- Verificar que se duplicaron las actividades
SELECT COUNT(*) FROM actividades WHERE id_plan = '[id del nuevo plan]';
```

---

### Test 18: Ver Actividades

**Pasos:**
1. Login como líder
2. Ir a `/leader/activities`

**Resultado Esperado:**
- ✅ Muestra SOLO actividades del equipo del líder
- ✅ Filtros por categoría funcionan (si existen)
- ✅ Links a detalle funcionan

---

### Test 19: Crear Actividad

**Pasos:**
1. Ir a crear actividad (desde detalle de plan)
2. Llenar formulario completo
3. Guardar

**Resultado Esperado:**
- ✅ Actividad creada exitosamente
- ✅ Actividad visible en lista
- ✅ Actividad guardada en Supabase con `id_plan` correcto

---

### Test 20: Editar Actividad

**Pasos:**
1. Ir a detalle de una actividad
2. Click en "Editar"
3. Modificar campos
4. Guardar

**Resultado Esperado:**
- ✅ Cambios guardados
- ✅ Datos actualizados en interfaz
- ✅ Datos actualizados en Supabase

---

### Test 21: Cambiar Estado de Actividad

**Pasos:**
1. Ir a detalle de una actividad
2. Cambiar estado de "Pendiente" a "Hecha"
3. Guardar

**Resultado Esperado:**
- ✅ Estado actualizado
- ✅ Métricas del dashboard se actualizan
- ✅ Cambio reflejado en Supabase

---

### Test 22: Ver Miembros del Equipo

**Pasos:**
1. Login como líder
2. Ir a `/leader/members`

**Resultado Esperado:**
- ✅ Muestra miembros del equipo del líder
- ✅ Muestra información de cada miembro
- ✅ Botones para agregar/remover miembros (si existen)

---

### Test 23: Agregar Miembro

**Pasos:**
1. Ir a gestión de miembros
2. Click en "Agregar Miembro"
3. Seleccionar perfil
4. Guardar

**Resultado Esperado:**
- ✅ Miembro agregado exitosamente
- ✅ Miembro visible en lista
- ✅ Registro creado en `miembros_equipo`

---

## 🔗 Pruebas de Integración

### Test 24: Flujo Completo - Crear Equipo y Plan

**Pasos:**
1. Login como superadmin
2. Crear nuevo equipo
3. Asignar líder al equipo
4. Login como líder
5. Crear plan para el equipo
6. Agregar actividades al plan
7. Verificar en dashboard que todo se muestra correctamente

**Resultado Esperado:**
- ✅ Todo el flujo funciona sin errores
- ✅ Datos se guardan correctamente
- ✅ Relaciones entre tablas correctas

---

### Test 25: Flujo Completo - Duplicar Plan

**Pasos:**
1. Login como líder
2. Ir a un plan existente
3. Duplicar el plan
4. Verificar que actividades se duplicaron
5. Modificar actividades del nuevo plan
6. Verificar que el plan original no se modificó

**Resultado Esperado:**
- ✅ Plan duplicado correctamente
- ✅ Actividades duplicadas con valores por defecto
- ✅ Plan original intacto

---

## ⚠️ Pruebas de Errores

### Test 26: Error de Conexión

**Pasos:**
1. Desconectar internet
2. Intentar cargar dashboard
3. Reconectar internet

**Resultado Esperado:**
- ✅ Muestra mensaje de error amigable
- ✅ No crashea la aplicación
- ✅ Se recupera al reconectar

---

### Test 27: Error de Permisos (RLS)

**Pasos:**
1. Login como líder
2. Intentar acceder a `/superadmin/dashboard` (ruta de superadmin)

**Resultado Esperado:**
- ✅ Redirección a dashboard del líder
- ✅ No muestra datos de superadmin
- ✅ Mensaje de error si intenta acceder directamente

---

### Test 28: Datos Vacíos

**Pasos:**
1. Crear equipo sin planes
2. Login como líder de ese equipo
3. Ver dashboard

**Resultado Esperado:**
- ✅ Muestra mensaje: "No hay plan activo"
- ✅ No crashea
- ✅ Interfaz maneja estado vacío correctamente

---

### Test 29: Timeout

**Pasos:**
1. Simular consulta lenta (usando DevTools)
2. Intentar cargar dashboard

**Resultado Esperado:**
- ✅ Timeout configurado (5-6 segundos)
- ✅ Muestra mensaje de error después del timeout
- ✅ No queda en estado de carga infinito

---

## ⚡ Pruebas de Performance

### Test 30: Tiempo de Carga - Dashboard

**Pasos:**
1. Abrir DevTools > Network
2. Ir a dashboard
3. Medir tiempo de carga

**Resultado Esperado:**
- ✅ Dashboard carga en < 2 segundos
- ✅ No hay consultas N+1
- ✅ Consultas optimizadas

---

### Test 31: Tiempo de Carga - Lista de Planes

**Pasos:**
1. Abrir DevTools > Network
2. Ir a lista de planes
3. Medir tiempo de carga

**Resultado Esperado:**
- ✅ Lista carga en < 1 segundo
- ✅ Paginación o límite de resultados (si hay muchos)

---

### Test 32: Consultas Optimizadas

**Pasos:**
1. Abrir DevTools > Network
2. Navegar por diferentes vistas
3. Verificar número de requests

**Resultado Esperado:**
- ✅ No hay consultas duplicadas
- ✅ Uso de `getPlanCompleto()` en lugar de múltiples consultas
- ✅ Cache cuando sea apropiado

---

## ✅ Checklist Final

### Autenticación
- [ ] Login exitoso con todos los usuarios
- [ ] Login fallido maneja errores correctamente
- [ ] Logout funciona
- [ ] Sesión persiste (si está configurado)

### SuperAdmin
- [ ] Dashboard muestra métricas correctas
- [ ] Gestión de equipos funciona
- [ ] Crear/editar equipos funciona
- [ ] Ver planes funciona
- [ ] Ver actividades funciona

### Leader
- [ ] Dashboard muestra solo datos del equipo
- [ ] Ver planes del equipo funciona
- [ ] Crear/editar planes funciona
- [ ] Duplicar plan funciona
- [ ] Ver actividades funciona
- [ ] Crear/editar actividades funciona
- [ ] Ver miembros funciona
- [ ] Agregar/remover miembros funciona

### Integración
- [ ] Flujos completos funcionan
- [ ] Relaciones entre datos correctas
- [ ] Datos se guardan correctamente

### Errores
- [ ] Errores de conexión manejados
- [ ] Errores de permisos manejados
- [ ] Estados vacíos manejados
- [ ] Timeouts configurados

### Performance
- [ ] Tiempos de carga aceptables
- [ ] Consultas optimizadas
- [ ] No hay consultas N+1

---

## 📊 Reporte de Pruebas

Después de completar todas las pruebas, crear un reporte con:

1. **Resumen:** Total de pruebas ejecutadas, pasadas, fallidas
2. **Problemas Encontrados:** Lista de bugs o issues
3. **Recomendaciones:** Mejoras sugeridas
4. **Screenshots:** Capturas de errores o comportamientos inesperados

**Template de Reporte:**

```
# Reporte de Pruebas - Misincol
Fecha: [fecha]
Ejecutado por: [nombre]

## Resumen
- Total de pruebas: 32
- Pasadas: X
- Fallidas: Y
- Tasa de éxito: X%

## Problemas Encontrados
1. [Descripción del problema]
   - Severidad: Alta/Media/Baja
   - Pasos para reproducir
   - Screenshot (si aplica)

## Recomendaciones
1. [Recomendación]

## Conclusión
[Resumen general del estado del sistema]
```

---

**Última Actualización:** 2025-01-13

