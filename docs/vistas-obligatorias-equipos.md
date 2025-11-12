# Vistas Obligatorias por Equipo

Este documento especifica las vistas que **cada equipo debe tener como obligación** para gestionar sus planes de desarrollo en el sistema Misincol.

## Vistas Obligatorias para Líder de Equipo

Cada equipo, a través de su líder, **debe tener acceso obligatorio** a las siguientes vistas:

### 1. Dashboard de Equipo
- **Ruta**: `/leader/dashboard`
- **Propósito**: Vista consolidada del plan activo, tareas, presupuesto y miembros
- **Obligatorio**: ✅ Sí - Cada equipo debe tener acceso a esta vista
- **Funcionalidades**:
  - Resumen de progreso del plan actual
  - Estado de presupuesto disponible vs comprometido
  - Lista de áreas y responsables
  - Alertas de actividades retrasadas

### 2. Gestión de Actividades y Áreas
- **Ruta**: `/leader/activities`
- **Propósito**: CRUD completo de actividades dentro del plan actual y administración de áreas
- **Obligatorio**: ✅ Sí - Cada equipo debe tener acceso a esta vista
- **Funcionalidades**:
  - Listado de actividades con búsqueda y filtros
  - Formularios para crear/editar actividades
  - Gestión de áreas (crear, editar, eliminar)
  - Registro de avance y seguimiento

### 3. Historial de Planes Propios
- **Ruta**: `/leader/plans`
- **Propósito**: Consultar planes pasados del equipo y reutilizar información
- **Obligatorio**: ✅ Sí - Cada equipo debe tener acceso a esta vista
- **Funcionalidades**:
  - Listado cronológico de planes finalizados
  - Vista detalle con actividades, resultados y aprendizajes
  - Acción para duplicar plan/actividades como plantilla

### 4. Gestor de Miembros
- **Ruta**: `/leader/members`
- **Propósito**: Administrar miembros del equipo y su rol dentro de las actividades
- **Obligatorio**: ✅ Sí - Cada equipo debe tener acceso a esta vista
- **Funcionalidades**:
  - Listado de miembros con datos de contacto y rol
  - Invitar nuevos miembros y asignar roles
  - Asociar miembros a actividades como responsables o colaboradores
  - Desactivar miembros y transferir responsabilidades

## Vistas Obligatorias para Super Administrador

El Super Administrador **debe tener acceso obligatorio** a las siguientes vistas para gestionar todos los equipos:

### 1. Dashboard Global
- **Ruta**: `/superadmin/dashboard`
- **Propósito**: Estado agregado de todos los equipos y sus planes de desarrollo
- **Obligatorio**: ✅ Sí

### 2. Detalle de Equipo
- **Ruta**: `/superadmin/teams/[teamId]`
- **Propósito**: Visualizar a profundidad el estado de un equipo y sus planes
- **Obligatorio**: ✅ Sí

### 3. Gestor de Equipos y Presupuestos
- **Ruta**: `/superadmin/manage`
- **Propósito**: CRUD completo de equipos, líderes, membresía y asignaciones presupuestales
- **Obligatorio**: ✅ Sí

### 4. Historial de Planes de Desarrollo
- **Ruta**: `/superadmin/plans`
- **Propósito**: Revisar y administrar el histórico de planes de todos los equipos
- **Obligatorio**: ✅ Sí

## Garantías del Sistema

- ✅ Todas las vistas están implementadas y disponibles en el sistema
- ✅ El sistema de navegación (`layout-shell.tsx`) garantiza que cada líder de equipo tenga acceso a las 4 vistas obligatorias
- ✅ El sistema de autenticación asegura que solo los usuarios autorizados accedan a sus vistas correspondientes
- ✅ Cada equipo está vinculado a un líder que automáticamente tiene acceso a todas las vistas obligatorias

## Notas de Implementación

- Las rutas están protegidas por el sistema de autenticación
- Cada vista filtra automáticamente los datos según el `teamId` del usuario autenticado
- Las vistas están integradas en el menú de navegación lateral para acceso rápido
- El sistema garantiza que cada equipo tenga acceso a estas vistas como parte de su plan de desarrollo obligatorio


