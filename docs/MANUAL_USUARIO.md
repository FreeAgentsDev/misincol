# Manual de Usuario - Sistema Misincol

**Versión:** 1.0  
**Fecha:** 2025-01-13  
**Sistema:** Gestión de Equipos - Misiones Indígenas en Colombia

---

## 📋 Índice

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Rol: Super Administrador](#rol-super-administrador)
4. [Rol: Líder de Equipo](#rol-líder-de-equipo)
5. [Preguntas Frecuentes](#preguntas-frecuentes)
6. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Introducción

**Misincol** es un sistema de gestión de equipos diseñado para administrar planes de desarrollo, actividades y presupuestos de equipos de trabajo en misiones indígenas en Colombia.

### Características Principales

- ✅ Gestión de equipos y miembros
- ✅ Creación y seguimiento de planes de desarrollo
- ✅ Administración de actividades y presupuestos
- ✅ Dashboard con métricas y estadísticas
- ✅ Control de acceso por roles

### Roles del Sistema

1. **Super Administrador:** Acceso completo a todos los equipos y funcionalidades
2. **Líder de Equipo:** Gestión de su equipo asignado
3. **Miembro:** Visualización de información de su equipo (próximamente)

---

## 🔐 Acceso al Sistema

### Paso 1: Abrir el Sistema

1. Abre tu navegador web (Chrome, Firefox, Safari, Edge)
2. Ve a la URL del sistema: `https://tu-dominio.com` (o `http://localhost:3000` en desarrollo)
3. Serás redirigido automáticamente a la página de login

### Paso 2: Iniciar Sesión

#### Opción A: Login Manual

1. En la página de login, verás dos pestañas: **"Iniciar Sesión"** y **"Crear Cuenta"**
2. Asegúrate de estar en la pestaña **"Iniciar Sesión"**
3. Ingresa tu **nombre de usuario** (no email)
4. Ingresa tu **contraseña**
5. Haz click en el botón **"Entrar"**

#### Opción B: Usar Usuario Demo

1. En la sección **"USUARIOS DISPONIBLES"** verás tarjetas con usuarios de prueba
2. Haz click en la tarjeta del usuario que quieres usar
3. Los campos se llenarán automáticamente
4. Haz click en **"Entrar"**

### Paso 3: Dashboard

Después de iniciar sesión, serás redirigido automáticamente a tu dashboard según tu rol:
- **Super Administrador:** `/superadmin/dashboard`
- **Líder de Equipo:** `/leader/dashboard`

### Paso 4: Cerrar Sesión

1. Busca el botón **"Cerrar Sesión"** en el menú superior (si está disponible)
2. O ejecuta desde la consola del navegador: `localStorage.clear()` y recarga la página

---

## 👑 Rol: Super Administrador

Como Super Administrador, tienes acceso completo a todos los equipos, planes y actividades del sistema.

### Dashboard Global

**Ubicación:** `/superadmin/dashboard`

**Qué verás:**
- Resumen de todos los equipos
- Métricas agregadas:
  - Total de equipos
  - Actividades completadas vs pendientes
  - Presupuesto liquidado vs pendiente
- Tabla con información de cada equipo:
  - Nombre del equipo
  - Líder asignado
  - Plan activo
  - Progreso de actividades
  - Estado del presupuesto

**Cómo usar:**
1. Al iniciar sesión, serás redirigido automáticamente al dashboard
2. Revisa las métricas generales en la parte superior
3. Explora cada equipo haciendo click en **"Ver detalle"**

---

### Gestión de Equipos

**Ubicación:** `/superadmin/manage`

**Funcionalidades:**
- Ver lista de todos los equipos
- Ver detalles de cada equipo
- Crear nuevos equipos
- Editar equipos existentes

#### Ver Lista de Equipos

1. En el menú lateral, haz click en **"Gestor de equipos"**
2. Verás una lista de todos los equipos con:
   - Nombre del equipo
   - Líder asignado
   - Presupuesto asignado
3. Haz click en cualquier equipo para ver más detalles

#### Ver Detalle de Equipo

1. Desde la lista de equipos, haz click en un equipo
2. Verás:
   - Información general del equipo
   - Planes de desarrollo del equipo
   - Miembros del equipo
   - Presupuesto y gastos

#### Crear Nuevo Equipo

1. En el menú lateral, haz click en **"Crear equipo"**
2. Llena el formulario:
   - **Nombre del equipo:** Nombre descriptivo
   - **Presupuesto asignado:** Monto en pesos colombianos
   - **Líder:** Selecciona un usuario líder de la lista
3. Haz click en **"Crear Equipo"**
4. Serás redirigido al detalle del equipo recién creado

#### Editar Equipo

1. Ve al detalle del equipo que quieres editar
2. Haz click en el botón **"Editar"** (si está disponible)
3. Modifica los campos necesarios
4. Haz click en **"Guardar"**

---

### Ver Planes de Desarrollo

**Ubicación:** `/superadmin/plans`

**Funcionalidades:**
- Ver todos los planes de todos los equipos
- Ver detalles de cada plan
- Filtrar por equipo o estado

**Cómo usar:**
1. En el menú lateral, haz click en **"Planes"**
2. Verás una lista de todos los planes
3. Haz click en un plan para ver detalles completos:
   - Información del plan
   - Actividades del plan
   - Objetivos de área
   - Progreso y métricas

---

### Ver Actividades

**Ubicación:** `/superadmin/plans/[planId]/activities/[activityId]`

**Funcionalidades:**
- Ver todas las actividades de todos los planes
- Ver detalles de cada actividad
- Ver asignaciones y actualizaciones

**Cómo usar:**
1. Desde el detalle de un plan, haz click en una actividad
2. Verás información completa:
   - Detalles de la actividad
   - Responsable y colaboradores
   - Presupuesto y gastos
   - Estado y progreso
   - Actualizaciones y comentarios

---

## 👥 Rol: Líder de Equipo

Como Líder de Equipo, tienes acceso a la gestión de tu equipo asignado, incluyendo planes, actividades y miembros.

### Dashboard de Equipo

**Ubicación:** `/leader/dashboard`

**Qué verás:**
- Resumen del estado actual de tu equipo
- Plan activo (si existe):
  - Nombre y descripción del plan
  - Fechas de inicio y fin
  - Métricas principales:
    - Áreas asignadas
    - Actividades activas
    - Actividades completadas
    - Progreso general (%)
- Próximos vencimientos
- Lista de planes del equipo

**Cómo usar:**
1. Al iniciar sesión, serás redirigido automáticamente al dashboard
2. Revisa el estado general de tu equipo
3. Haz click en **"Ver detalle completo"** del plan activo para más información

---

### Planes de Desarrollo

**Ubicación:** `/leader/plans`

**Funcionalidades:**
- Ver todos los planes de tu equipo
- Ver detalles de cada plan
- Crear nuevos planes
- Duplicar planes existentes

#### Ver Lista de Planes

1. En el menú lateral, haz click en **"Planes anteriores"** o **"Historial planes"**
2. Verás una lista de todos los planes de tu equipo
3. Cada plan muestra:
   - Nombre y categoría
   - Estado (Activo, Finalizado, Archivado)
   - Progreso (%)
   - Fechas de inicio y fin

#### Ver Detalle de Plan

1. Desde la lista de planes, haz click en un plan
2. Verás información completa:
   - Detalles del plan
   - Objetivos de área
   - Lista de actividades con:
     - Nombre y responsable
     - Estado (Pendiente/Hecha)
     - Presupuesto
     - Fechas
   - Métricas y progreso

#### Crear Nuevo Plan

1. Desde el detalle de un plan o desde el dashboard, busca el botón **"Crear Plan"** (si está disponible)
2. Llena el formulario:
   - **Nombre:** Nombre descriptivo del plan
   - **Categoría:** Selecciona una categoría (Investigación, Encarnación, Evangelización, Entrenamiento, Autocuidado)
   - **Fecha de inicio:** Fecha de inicio del plan
   - **Fecha de fin:** Fecha de finalización del plan
   - **Resumen:** Descripción breve del plan
3. Haz click en **"Crear Plan"**
4. Serás redirigido al detalle del plan recién creado

#### Duplicar Plan

1. Ve al detalle de un plan existente
2. Haz click en el botón **"Duplicar Plan"** (si está disponible)
3. Ingresa:
   - **Nuevo nombre:** Nombre para el plan duplicado
   - **Nueva fecha de inicio:** Fecha de inicio del nuevo plan
   - **Nueva fecha de fin:** Fecha de fin del nuevo plan
4. Haz click en **"Duplicar"**
5. Se creará un nuevo plan con todas las actividades del plan original
6. Las actividades se crearán con estado "Pendiente" y presupuesto en 0

---

### Actividades y Áreas

**Ubicación:** `/leader/activities`

**Funcionalidades:**
- Ver todas las actividades de tu equipo
- Ver detalles de cada actividad
- Crear nuevas actividades
- Editar actividades existentes
- Cambiar estado de actividades

#### Ver Lista de Actividades

1. En el menú lateral, haz click en **"Actividades y áreas"**
2. Verás una lista de todas las actividades de tu equipo
3. Puedes filtrar por categoría o área (si los filtros están disponibles)

#### Ver Detalle de Actividad

1. Desde la lista de actividades o desde el detalle de un plan, haz click en una actividad
2. Verás información completa:
   - Detalles generales
   - Responsable y colaboradores
   - Presupuesto total y liquidado
   - Estado (Pendiente/Hecha)
   - Fechas de inicio y fin
   - Descripción y objetivos
   - Obstáculos y notas

#### Crear Nueva Actividad

1. Desde el detalle de un plan, busca el botón **"Agregar Actividad"** o **"Nueva Actividad"**
2. Llena el formulario:
   - **Nombre:** Nombre de la actividad
   - **Responsable:** Selecciona un miembro del equipo
   - **Área:** Área a la que pertenece
   - **Presupuesto total:** Monto estimado
   - **Fechas:** Inicio y fin
   - **Descripción:** Detalles de la actividad
   - (Más campos según el formulario)
3. Haz click en **"Crear Actividad"**
4. La actividad aparecerá en el plan

#### Editar Actividad

1. Ve al detalle de una actividad
2. Haz click en el botón **"Editar"** (si está disponible)
3. Modifica los campos necesarios
4. Haz click en **"Guardar"**

#### Cambiar Estado de Actividad

1. Ve al detalle de una actividad
2. Busca el campo **"Estado"**
3. Cambia de **"Pendiente"** a **"Hecha"** (o viceversa)
4. Guarda los cambios
5. El progreso del plan se actualizará automáticamente

---

### Gestión de Miembros

**Ubicación:** `/leader/members`

**Funcionalidades:**
- Ver miembros de tu equipo
- Agregar nuevos miembros
- Remover miembros del equipo

#### Ver Miembros

1. En el menú lateral, haz click en **"Gestor de miembros"**
2. Verás una lista de todos los miembros de tu equipo con:
   - Nombre completo
   - Nombre de usuario
   - Rol
   - Estado (activo/inactivo)

#### Agregar Miembro

1. Desde la lista de miembros, haz click en **"Agregar Miembro"** (si está disponible)
2. Selecciona un usuario de la lista
3. Haz click en **"Agregar"**
4. El miembro aparecerá en la lista

#### Remover Miembro

1. Desde la lista de miembros, encuentra el miembro que quieres remover
2. Haz click en **"Remover"** o **"Desactivar"** (si está disponible)
3. Confirma la acción
4. El miembro será marcado como inactivo

---

## ❓ Preguntas Frecuentes

### ¿Cómo cambio mi contraseña?

Actualmente, el cambio de contraseña debe ser gestionado por un Super Administrador. Contacta al administrador del sistema.

### ¿Puedo ver datos de otros equipos?

- **Super Administrador:** Sí, puedes ver todos los equipos
- **Líder de Equipo:** No, solo puedes ver datos de tu equipo asignado
- **Miembro:** No, solo puedes ver información de tu equipo

### ¿Qué pasa si no tengo un plan activo?

Si tu equipo no tiene un plan activo, verás un mensaje en el dashboard indicando que no hay plan activo. Puedes crear uno nuevo desde la sección de planes.

### ¿Puedo eliminar un plan?

Los planes generalmente no se eliminan, sino que se archivan o finalizan. Contacta a un Super Administrador si necesitas eliminar un plan.

### ¿Cómo actualizo el presupuesto de una actividad?

1. Ve al detalle de la actividad
2. Haz click en **"Editar"**
3. Modifica el campo **"Presupuesto liquidado"**
4. Guarda los cambios

### ¿Puedo asignar múltiples responsables a una actividad?

Actualmente, cada actividad tiene un responsable principal. Puedes agregar colaboradores en las asignaciones de la actividad.

---

## 🔧 Solución de Problemas

### No puedo iniciar sesión

**Problema:** Error al intentar iniciar sesión

**Soluciones:**
1. Verifica que estés usando el **nombre de usuario** correcto (no el email completo)
2. Verifica que la contraseña sea correcta
3. Asegúrate de que tu usuario esté activo en el sistema
4. Contacta al administrador si el problema persiste

### El dashboard no carga

**Problema:** El dashboard muestra "Cargando..." indefinidamente

**Soluciones:**
1. Verifica tu conexión a internet
2. Recarga la página (F5 o Cmd+R)
3. Limpia la caché del navegador
4. Cierra sesión y vuelve a iniciar sesión
5. Contacta al administrador si el problema persiste

### No veo datos en el dashboard

**Problema:** El dashboard está vacío o muestra "No hay datos"

**Soluciones:**
1. Verifica que tu equipo tenga un plan activo
2. Verifica que tu perfil esté correctamente asignado a un equipo (líderes)
3. Contacta al administrador para verificar la configuración

### Error al guardar cambios

**Problema:** Error al intentar guardar cambios en un plan o actividad

**Soluciones:**
1. Verifica que todos los campos requeridos estén llenos
2. Verifica que tengas permisos para editar (solo líderes pueden editar su equipo)
3. Recarga la página e intenta nuevamente
4. Contacta al administrador si el problema persiste

### No puedo ver ciertas secciones

**Problema:** No aparecen opciones en el menú o no puedo acceder a ciertas páginas

**Soluciones:**
1. Verifica tu rol en el sistema
2. Asegúrate de estar autenticado correctamente
3. Verifica que tu equipo esté asignado (líderes)
4. Contacta al administrador si crees que deberías tener acceso

---

## 📞 Soporte

Si necesitas ayuda adicional:

1. **Revisa este manual** para encontrar respuestas a preguntas comunes
2. **Contacta al administrador del sistema** para problemas técnicos
3. **Revisa la documentación técnica** si eres desarrollador

---

## 📝 Notas Adicionales

### Navegación

- Usa el **menú lateral** para navegar entre secciones
- El menú cambia según tu rol (Super Admin vs Leader)
- Algunas opciones solo están disponibles para ciertos roles

### Datos en Tiempo Real

- Los datos se actualizan automáticamente cuando navegas entre páginas
- Si haces cambios, recarga la página para ver los datos actualizados
- Las métricas se calculan en tiempo real desde la base de datos

### Responsive Design

- El sistema es responsive y funciona en dispositivos móviles
- Algunas funcionalidades pueden verse diferentes en pantallas pequeñas
- Se recomienda usar una pantalla de al menos 1024px de ancho para mejor experiencia

---

**Última Actualización:** 2025-01-13  
**Versión del Sistema:** 1.0

