# Índice de Documentación - Misincol

**Última Actualización:** 2025-01-13

---

## 📚 Documentación por Categoría

### 🎯 Para Usuarios Finales

1. **[Manual de Usuario](./MANUAL_USUARIO.md)**
   - Guía completa para usar el sistema
   - Instrucciones paso a paso por rol
   - Preguntas frecuentes y solución de problemas
   - **Audiencia:** Usuarios finales (Super Admin, Leaders)

---

### 👨‍💻 Para Desarrolladores

#### Análisis y Estado Actual

2. **[Análisis de Conexión Frontend-Backend](./ANALISIS_CONEXION_FRONTEND_BACKEND.md)**
   - Estado actual de la conexión
   - Componentes conectados vs mock data
   - Matriz de conexión por componente
   - **Audiencia:** Desarrolladores que necesitan entender el estado actual

3. **[Plan de Conexión Frontend-Backend](./PLAN_CONEXION_FRONTEND_BACKEND.md)**
   - Plan detallado de migración de mock data a Supabase
   - 8 fases con tareas específicas
   - Checklist y criterios de éxito
   - **Audiencia:** Desarrolladores que van a implementar la conexión

#### Testing

4. **[Flujo de Pruebas](./FLUJO_PRUEBAS.md)**
   - 32 pruebas detalladas para validar el sistema
   - Pruebas por rol, integración, errores y performance
   - Checklist final y template de reporte
   - **Audiencia:** QA, desarrolladores, testers

#### Backend

5. **[Backend Supabase - Paso a Paso](./backend-supabase-paso-a-paso.md)**
   - Guía completa para configurar el backend
   - Scripts SQL para esquema, RLS, RPCs y datos de prueba
   - Instrucciones detalladas paso a paso
   - **Audiencia:** Desarrolladores que configuran el backend

6. **[Resumen Backend para Principiantes](./RESUMEN-BACKEND-PARA-PRINCIPIANTES.md)**
   - Resumen simplificado del backend
   - Conceptos básicos y ejemplos
   - **Audiencia:** Desarrolladores nuevos en el proyecto

7. **[Análisis y Validación Backend](./analisis-validacion-backend.md)**
   - Análisis del esquema de base de datos
   - Validación de relaciones y constraints
   - **Audiencia:** Desarrolladores que necesitan entender el esquema

8. **[Relación Frontend-Backend](./backend-frontend-relacion.md)**
   - Mapeo de componentes frontend con backend
   - Diagramas de flujo de datos
   - **Audiencia:** Desarrolladores que integran frontend y backend

#### Planificación

9. **[Plan de Desarrollo por Vista](./plan-vistas.md)**
   - Plan de implementación de cada vista
   - Objetivos, requerimientos y tareas técnicas
   - **Audiencia:** Desarrolladores y planificadores

---

### 🔧 Scripts y Utilidades

10. **[Scripts SQL](./)**
    - `crear-perfiles-usuarios.sql` - Crear usuarios y perfiles
    - `DIAGNOSTICO_PERFIL.sql` - Diagnóstico de problemas de perfil
    - `FIX_RLS_POLICIES.sql` - Corrección de políticas RLS
    - **Audiencia:** Desarrolladores y administradores de BD

---

## 🗺️ Guía de Lectura Recomendada

### Si eres nuevo en el proyecto:

1. Leer **[README.md](../README.md)** para visión general
2. Leer **[Resumen Backend para Principiantes](./RESUMEN-BACKEND-PARA-PRINCIPIANTES.md)**
3. Leer **[Análisis de Conexión Frontend-Backend](./ANALISIS_CONEXION_FRONTEND_BACKEND.md)**
4. Revisar **[Plan de Conexión Frontend-Backend](./PLAN_CONEXION_FRONTEND_BACKEND.md)**

### Si vas a configurar el backend:

1. Leer **[Backend Supabase - Paso a Paso](./backend-supabase-paso-a-paso.md)** completo
2. Ejecutar scripts SQL en orden
3. Verificar con **[Flujo de Pruebas](./FLUJO_PRUEBAS.md)**

### Si vas a conectar el frontend:

1. Leer **[Análisis de Conexión Frontend-Backend](./ANALISIS_CONEXION_FRONTEND_BACKEND.md)**
2. Seguir **[Plan de Conexión Frontend-Backend](./PLAN_CONEXION_FRONTEND_BACKEND.md)** fase por fase
3. Validar con **[Flujo de Pruebas](./FLUJO_PRUEBAS.md)**

### Si eres usuario final:

1. Leer **[Manual de Usuario](./MANUAL_USUARIO.md)**
2. Consultar sección de "Preguntas Frecuentes"
3. Revisar "Solución de Problemas" si tienes issues

---

## 📊 Estado de la Documentación

| Documento | Estado | Última Actualización | Prioridad |
|-----------|--------|---------------------|-----------|
| README.md | ✅ Completo | 2025-01-13 | Alta |
| Manual de Usuario | ✅ Completo | 2025-01-13 | Alta |
| Análisis de Conexión | ✅ Completo | 2025-01-13 | Alta |
| Plan de Conexión | ✅ Completo | 2025-01-13 | Alta |
| Flujo de Pruebas | ✅ Completo | 2025-01-13 | Alta |
| Backend Paso a Paso | ✅ Completo | 2025-01-13 | Alta |
| Resumen Backend | ✅ Completo | 2025-01-13 | Media |
| Análisis Backend | ✅ Completo | 2025-01-13 | Media |
| Relación Frontend-Backend | ✅ Completo | 2025-01-13 | Media |
| Plan de Vistas | ✅ Completo | 2025-01-13 | Baja |

---

## 🔍 Búsqueda Rápida

### ¿Cómo...?

- **...iniciar sesión?** → [Manual de Usuario - Acceso al Sistema](./MANUAL_USUARIO.md#acceso-al-sistema)
- **...crear un equipo?** → [Manual de Usuario - Gestión de Equipos](./MANUAL_USUARIO.md#gestión-de-equipos)
- **...crear un plan?** → [Manual de Usuario - Planes de Desarrollo](./MANUAL_USUARIO.md#planes-de-desarrollo)
- **...configurar el backend?** → [Backend Supabase - Paso a Paso](./backend-supabase-paso-a-paso.md)
- **...conectar el frontend?** → [Plan de Conexión Frontend-Backend](./PLAN_CONEXION_FRONTEND_BACKEND.md)
- **...ejecutar pruebas?** → [Flujo de Pruebas](./FLUJO_PRUEBAS.md)

### ¿Qué es...?

- **...el estado actual del proyecto?** → [Análisis de Conexión Frontend-Backend](./ANALISIS_CONEXION_FRONTEND_BACKEND.md)
- **...el plan de migración?** → [Plan de Conexión Frontend-Backend](./PLAN_CONEXION_FRONTEND_BACKEND.md)
- **...el esquema de la base de datos?** → [Análisis y Validación Backend](./analisis-validacion-backend.md)
- **...cómo funciona la autenticación?** → [Backend Supabase - Paso a Paso - Configuración de Autenticación](./backend-supabase-paso-a-paso.md#8-configuración-de-autenticación)

### Problemas Comunes

- **Error al cargar perfil** → [DIAGNOSTICO_PERFIL.sql](../DIAGNOSTICO_PERFIL.sql) o [Manual de Usuario - Solución de Problemas](./MANUAL_USUARIO.md#solución-de-problemas)
- **Error de permisos (RLS)** → [Backend Supabase - Paso a Paso - Políticas RLS](./backend-supabase-paso-a-paso.md#3-políticas-de-seguridad-rls)
- **Datos no aparecen** → [Flujo de Pruebas - Datos Vacíos](./FLUJO_PRUEBAS.md#test-28-datos-vacíos)

---

## 📝 Notas

- Todos los documentos están en formato Markdown
- Los scripts SQL están listos para ejecutar en Supabase
- La documentación se actualiza regularmente
- Para sugerencias o correcciones, abrir un issue en el repositorio

---

**Mantenido por:** Equipo de Desarrollo Misincol  
**Última Revisión:** 2025-01-13

