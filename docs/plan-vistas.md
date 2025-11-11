# Plan de desarrollo por vista

Este documento detalla el plan de implementación de cada vista del sistema de gestión de equipos **Misincol**, construido con **Next.js** para el frontend y **Supabase** (auth, base de datos y funciones) como backend.

## Roles y vistas

- **Super Admin**
  - Login
  - Dashboard global
  - Detalle de equipo
  - Gestor de equipos y presupuestos
  - Historial de planes de desarrollo
- **Líder de equipo**
  - Dashboard de equipo
  - Gestión de actividades y áreas
  - Historial de planes propios
  - Gestor de miembros

Cada sección incluye objetivos, requerimientos funcionales, datos necesarios, endpoints/procedimientos y tareas técnicas sugeridas.

---

## Super Admin · Login

- **Objetivo**: permitir autenticación segura de super administradores para acceder al sistema.
- **Requerimientos funcionales**
  - Formulario con usuario y contraseña.
  - Validación de credenciales vía Supabase Auth (método de email deshabilitado; uso de `user_metadata.username`).
  - Gestión de estados: cargando, error de credenciales, recuperación de contraseña.
  - Redirección al dashboard global tras login exitoso.
- **Datos necesarios**
  - Usuarios con rol `super_admin` almacenados en Supabase Auth + tabla `profiles` con campo `username` único.
  - Tokens de sesión gestionados por Supabase.
- **Endpoints/Procedimientos**
  - RPC personalizada `auth.loginWithUsername` (ver Consideraciones transversales) o uso de ReAuth con `supabase.auth.signInWithPassword` pasando email proxy.
  - `profiles` para obtener rol, nombre y `username`.
- **Tareas técnicas**
  - Configurar Supabase Auth sin correo (crear usuarios manualmente con correo sintético o funciones edge).
  - Extender tabla `profiles` con `username` obligatorio y restricciones únicas.
  - Crear página `pages/login.tsx` con formulario y manejo de errores.
  - Implementar guardas de ruta y `layout` protegido.
  - Añadir cambio de contraseña manual (sin email) y manejo de sesión persistente.
- Adaptar Supabase Auth para login por usuario:
  - Crear función Edge o RPC `auth.loginWithUsername(username, password)` que resuelva el email asociado.
  - Mantener emails sintéticos (`username@misincol.local`) para satisfacer Supabase Auth, ocultándolos en UI.
  - Proveer flujo de cambio de contraseña basado en modal con verificación por super admin (sin correo).

---

## Super Admin · Dashboard global

- **Objetivo**: mostrar el estado agregado de todos los equipos y sus planes de desarrollo.
- **Requerimientos funcionales**
  - Tabla/lista con: nombre de equipo, líder, plan activo, tareas hechas vs pendientes, presupuesto liquidado vs por liquidar vs asignado.
  - Filtros por estado de plan, fechas y presupuesto.
  - Acceso rápido al detalle de equipo (botón «Ver detalle»).
- **Datos necesarios**
  - Tabla `teams` con líder y presupuesto asignado.
  - Tabla `development_plans` con estado y referencia a `teams`.
  - Tabla `activities` con estado (hecha/pendiente), presupuesto total y liquidado.
- **Endpoints/Procedimientos**
  - RPC/consultas agregadas para métricas por equipo.
  - Vistas materializadas o `supabase.rpc('get_team_dashboard_metrics')`.
- **Tareas técnicas**
  - Definir vista/materialized view para métricas por equipo.
  - Implementar fetch con SWR/React Query.
  - Diseñar UI con tarjetas o tabla responsiva.
  - Incluir componentes de filtro y gráficos simples (opcional).

---

## Super Admin · Detalle de equipo

- **Objetivo**: visualizar a profundidad el estado de un equipo y sus planes de desarrollo.
- **Requerimientos funcionales**
  - Resumen del equipo: nombre, líder, miembros, presupuesto asignado/restante.
  - Listado de planes de desarrollo activos e históricos con estado.
  - Drilldown de actividades por plan con KPIs (fechas, presupuesto, progreso).
  - Acceso a acciones de edición/eliminación de planes y actividades.
- **Datos necesarios**
  - `teams`, `team_members`, `development_plans`, `activities`, `areas`.
- **Endpoints/Procedimientos**
  - Consultas por `team_id`; funciones RPC para cálculos de presupuesto.
  - Mutaciones para actualizar estado/fechas de planes y actividades.
- **Tareas técnicas**
  - Crear página dinámica `pages/superadmin/teams/[id].tsx`.
  - Componentes tabulados para planes y actividades.
  - Integrar modales para editar/eliminar entidades.
  - Reutilizar hooks de datos (React Query) con cache por equipo.

---

## Super Admin · Gestor de equipos y presupuestos

- **Objetivo**: CRUD completo de equipos, líderes, membresía y asignaciones presupuestales.
- **Requerimientos funcionales**
  - Crear, editar y eliminar equipos.
  - Asignar líder (usuario con rol `leader`).
  - Gestión de miembros del equipo (agregar/quitar).
  - Gestión del presupuesto: asignado total, repartición por plan.
- **Datos necesarios**
  - `teams`, `team_members`, `users`/`profiles`, `budget_allocations`.
- **Endpoints/Procedimientos**
  - Mutaciones Supabase para CRUD.
  - Procedimientos almacenados para actualizar presupuesto en cascada.
- **Tareas técnicas**
  - Formularios con validaciones (React Hook Form + Zod).
  - Componentes reutilizables para selección de usuarios.
  - Auditoría opcional (tabla `audit_logs`).
  - Tests de integración para flujos CRUD clave.

---

## Super Admin · Historial de planes de desarrollo

- **Objetivo**: revisar y administrar el histórico de planes de todos los equipos.
- **Requerimientos funcionales**
  - Listado global filtrable por equipo, año, estado y áreas involucradas.
  - Acceso a duplicar o reactivar un plan.
  - Registro de cambios y responsables.
- **Datos necesarios**
  - `development_plans`, `activities`, `areas`, `plan_history`.
- **Endpoints/Procedimientos**
  - Consultas con paginación.
  - RPC para duplicar plan (copiar actividades asociadas).
- **Tareas técnicas**
  - Página `pages/superadmin/plans/index.tsx`.
  - Componentes de filtros avanzados.
  - Integración con exportación CSV/PDF (opcional).
  - Mantener historial en tabla dedicada (trigger en actualizaciones).

---

## Líder de equipo · Dashboard de equipo

- **Objetivo**: brindar al líder una vista consolidada del plan activo, tareas, presupuesto y miembros.
- **Requerimientos funcionales**
  - Resumen de progreso del plan actual (tareas completadas, próximas fechas).
  - Estado de presupuesto disponible vs comprometido.
  - Lista de áreas y responsables.
  - Alertas de actividades retrasadas u obstáculos.
- **Datos necesarios**
  - `development_plans` (solo el activo del equipo), `activities`, `team_members`, `areas`, `budget_status`.
- **Endpoints/Procedimientos**
  - Consultas filtradas por `team_id` ligado al usuario autenticado.
- **Tareas técnicas**
  - Página `pages/leader/dashboard.tsx`.
  - Guardas que aseguren que el líder solo ve su equipo.
  - Componentes de tarjeta/resumen y cronograma.
  - Notificaciones (toast) para eventos importantes.

---

## Líder de equipo · Gestión de actividades y áreas

- **Objetivo**: permitir CRUD de actividades dentro del plan actual y administrar áreas asociadas.
- **Requerimientos funcionales**
  - Listado de actividades con búsqueda y filtros por estado, etapa, área.
  - Formularios para crear/editar actividades (responsable, objetivos, fechas, presupuesto, medidas).
  - Gestión de áreas (crear, editar, eliminar) y asignación a actividades.
  - Registro de avance (actualizar estado, marcar obstáculos, registrar seguimiento).
- **Datos necesarios**
  - `activities`, `areas`, `activity_assignments`, `activity_updates`.
- **Endpoints/Procedimientos**
  - Mutaciones Supabase (insert/update/delete) con seguridad row-level.
  - RPC para actualizar presupuestos calculados.
- **Tareas técnicas**
  - Componentes CRUD modales o páginas dedicadas.
  - Uso de formularios dinámicos con validaciones (Zod).
  - Triggers en Supabase que ajustan totales de presupuesto del plan.
  - Tests de unidad para hooks de gestión de actividades.

---

## Líder de equipo · Historial de planes propios

- **Objetivo**: consultar planes pasados del equipo y reutilizar información.
- **Requerimientos funcionales**
  - Listado cronológico de planes finalizados.
  - Vista detalle con actividades, resultados y aprendizajes.
  - Acción para duplicar plan/actividades como plantilla.
- **Datos necesarios**
  - `development_plans`, `activities`, `plan_lessons`.
- **Endpoints/Procedimientos**
  - Consultas filtradas por `team_id` y estado `archived`.
  - RPC para duplicación de plan.
- **Tareas técnicas**
  - Página `pages/leader/plans/index.tsx`.
  - Detalle `pages/leader/plans/[id].tsx`.
  - Manejo de permisos según equipo.
  - Exportación descargable opcional.

---

## Líder de equipo · Gestor de miembros

- **Objetivo**: administrar miembros del equipo y su rol dentro de las actividades.
- **Requerimientos funcionales**
  - Listado de miembros con datos de contacto y rol.
  - Invitar nuevos miembros (vía email) y asignar roles específicos.
  - Asociar miembros a actividades como responsables o colaboradores.
  - Desactivar miembros y transferir responsabilidades.
- **Datos necesarios**
  - `team_members`, `profiles`, `activity_assignments`.
- **Endpoints/Procedimientos**
  - Supabase Auth invitaciones mágicas (`supabase.auth.admin.inviteUserByEmail`).
  - Mutaciones para asociaciones miembro-actividad.
- **Tareas técnicas**
  - Formulario de invitación y asignación de rol.
  - Integrar control de permisos (RLS) para evitar modificaciones cruzadas.
  - UI para reasignar actividades cuando se desactiva un miembro.
  - Considerar notificaciones por email o in-app.

---

## Consideraciones transversales

- **Autenticación y autorización**
  - Aplicar políticas RLS en Supabase por rol y `team_id`.
  - Middleware en Next.js para proteger rutas.
- **Gestión de estado y datos**
  - Recomendado React Query/SWR + Zustand para UI local.
  - Tipado compartido (TypeScript) a partir de esquemas Supabase.
- **Diseño y UX**
  - Sistema de diseño consistente (Tailwind + componentes propios).
  - Accesibilidad: etiquetas, contraste, navegación con teclado.
- **Testing**
  - Tests de unidad para hooks y utilidades.
  - Tests de integración e2e con Playwright o Cypress para flujos críticos.
- **DevOps**
  - Configurar entorno `.env` con claves Supabase.
  - Pipelines de deploy (Vercel + Supabase).
  - Semillas iniciales para equipos, roles y planes de ejemplo.

Este plan puede ampliarse conforme afinemos requisitos funcionales y de negocio. Actualiza la sección correspondiente a medida que avances en cada vista.

