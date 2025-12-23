# Misincol - Sistema de Gestión de Equipos

**Misiones Indígenas en Colombia**

Sistema de gestión de equipos para administrar planes de desarrollo, actividades y presupuestos de equipos de trabajo en misiones indígenas en Colombia.

---

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Stack Tecnológico](#stack-tecnológico)
- [Estado del Proyecto](#estado-del-proyecto)
- [Documentación](#documentación)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Desarrollo](#desarrollo)
- [Contribuir](#contribuir)

---

## 🎯 Descripción

**Misincol** es una plataforma web diseñada para gestionar equipos de trabajo, planes de desarrollo, actividades y presupuestos. El sistema está diseñado específicamente para equipos que trabajan en misiones indígenas en Colombia.

### Características Principales

- ✅ **Gestión de Equipos:** Crear, editar y administrar equipos de trabajo
- ✅ **Planes de Desarrollo:** Crear y gestionar planes de desarrollo con múltiples categorías
- ✅ **Actividades:** Administrar actividades con seguimiento de presupuesto y progreso
- ✅ **Dashboard:** Visualización de métricas y estadísticas en tiempo real
- ✅ **Control de Acceso:** Sistema de roles (Super Admin, Leader, Member)
- ✅ **Autenticación:** Login seguro con Supabase Auth

### Roles del Sistema

1. **Super Administrador:** Acceso completo a todos los equipos y funcionalidades administrativas
2. **Líder de Equipo:** Gestión de su equipo asignado, planes y actividades
3. **Miembro:** Visualización de información de su equipo (en desarrollo)

---

## 🛠 Stack Tecnológico

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Autenticación:** Supabase Auth
- **Base de Datos:** Supabase (PostgreSQL)

### Backend
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **API:** Supabase REST API + RPC Functions
- **Seguridad:** Row Level Security (RLS)

---

## 📊 Estado del Proyecto

### ✅ Completado

- [x] Configuración inicial del proyecto
- [x] Sistema de autenticación con Supabase
- [x] Backend completo en Supabase (esquema, RLS, RPCs)
- [x] Frontend con todas las vistas (usando mock data)
- [x] Diseño UI/UX con Tailwind CSS
- [x] Sistema de roles y permisos
- [x] Documentación completa

### ⚠️ En Progreso

- [ ] Migración de mock data a Supabase
- [ ] Integración completa frontend-backend
- [ ] Testing completo del sistema

### 📝 Pendiente

- [ ] Funcionalidad de miembros (visualización)
- [ ] Notificaciones
- [ ] Reportes y exportación de datos
- [ ] Optimizaciones de performance

---

## 📚 Documentación

### Documentación Principal

1. **[Análisis de Conexión Frontend-Backend](./docs/ANALISIS_CONEXION_FRONTEND_BACKEND.md)**
   - Análisis profundo del estado actual de conexión
   - Identificación de componentes conectados vs mock data
   - Matriz de conexión por componente

2. **[Plan de Conexión Frontend-Backend](./docs/PLAN_CONEXION_FRONTEND_BACKEND.md)**
   - Plan detallado paso a paso para migrar de mock data a Supabase
   - 8 fases de migración con tareas específicas
   - Checklist y criterios de éxito

3. **[Flujo de Pruebas](./docs/FLUJO_PRUEBAS.md)**
   - 32 pruebas detalladas para validar el sistema
   - Pruebas por rol, integración, errores y performance
   - Checklist final y template de reporte

4. **[Manual de Usuario](./docs/MANUAL_USUARIO.md)**
   - Guía completa para usuarios finales
   - Instrucciones paso a paso por rol
   - Preguntas frecuentes y solución de problemas

### Documentación Técnica

- **[Backend Supabase - Paso a Paso](./docs/backend-supabase-paso-a-paso.md)**
  - Guía completa para configurar el backend
  - Scripts SQL para esquema, RLS, RPCs y datos de prueba

- **[Resumen Backend para Principiantes](./docs/RESUMEN-BACKEND-PARA-PRINCIPIANTES.md)**
  - Resumen simplificado del backend
  - Conceptos básicos y ejemplos

- **[Análisis y Validación Backend](./docs/analisis-validacion-backend.md)**
  - Análisis del esquema de base de datos
  - Validación de relaciones y constraints

- **[Relación Frontend-Backend](./docs/backend-frontend-relacion.md)**
  - Mapeo de componentes frontend con backend
  - Diagramas de flujo de datos

### Scripts SQL

- `crear-perfiles-usuarios.sql` - Crear usuarios y perfiles
- `DIAGNOSTICO_PERFIL.sql` - Script de diagnóstico para problemas de perfil
- `FIX_RLS_POLICIES.sql` - Corrección de políticas RLS

---

## 🚀 Instalación

### Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Supabase
- Git

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/FreeAgentsDev/misincol.git
cd misincol
```

2. **Instalar dependencias**
```bash
cd frontend
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase
```

4. **Configurar backend en Supabase**
   - Seguir la guía en `docs/backend-supabase-paso-a-paso.md`
   - Ejecutar todos los scripts SQL en orden

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

6. **Abrir en el navegador**
```
http://localhost:3000
```

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la carpeta `frontend/`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### Configuración de Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar scripts SQL en orden:
   - Paso 1: Extensiones y tipos
   - Paso 2: Esquema de base de datos
   - Paso 3: Políticas RLS
   - Paso 4: Funciones RPC
   - Paso 5: Triggers
   - Paso 6: Vistas materializadas
   - Paso 7: Datos de prueba
   - Paso 8: Configuración de autenticación

Ver `docs/backend-supabase-paso-a-paso.md` para detalles completos.

---

## 💻 Uso

### Para Usuarios

Consulta el **[Manual de Usuario](./docs/MANUAL_USUARIO.md)** para instrucciones detalladas sobre cómo usar el sistema.

### Para Desarrolladores

1. **Revisar el estado actual:**
   - Leer `docs/ANALISIS_CONEXION_FRONTEND_BACKEND.md`

2. **Seguir el plan de migración:**
   - Leer `docs/PLAN_CONEXION_FRONTEND_BACKEND.md`
   - Completar las fases en orden

3. **Ejecutar pruebas:**
   - Seguir `docs/FLUJO_PRUEBAS.md`
   - Validar cada funcionalidad

---

## 📁 Estructura del Proyecto

```
misincol/
├── frontend/                 # Aplicación Next.js
│   ├── src/
│   │   ├── app/             # Páginas y rutas
│   │   │   ├── login/       # Página de login
│   │   │   ├── superadmin/  # Vistas Super Admin
│   │   │   └── leader/      # Vistas Leader
│   │   ├── components/      # Componentes React
│   │   ├── context/         # Context API (Auth)
│   │   ├── lib/             # Utilidades y helpers
│   │   │   ├── supabase.ts           # Cliente Supabase
│   │   │   ├── supabase-queries.ts   # Funciones helper
│   │   │   ├── database.types.ts     # Tipos TypeScript
│   │   │   └── mock-data.ts          # Datos mock (a eliminar)
│   │   └── types.ts          # Tipos compartidos
│   ├── public/              # Archivos estáticos
│   └── package.json
├── docs/                     # Documentación
│   ├── ANALISIS_CONEXION_FRONTEND_BACKEND.md
│   ├── PLAN_CONEXION_FRONTEND_BACKEND.md
│   ├── FLUJO_PRUEBAS.md
│   ├── MANUAL_USUARIO.md
│   ├── backend-supabase-paso-a-paso.md
│   └── ...
├── crear-perfiles-usuarios.sql
├── DIAGNOSTICO_PERFIL.sql
└── README.md
```

---

## 🔧 Desarrollo

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar linter

# TypeScript
npm run type-check   # Verificar tipos TypeScript
```

### Flujo de Desarrollo

1. **Crear rama de feature**
```bash
git checkout -b feature/nombre-feature
```

2. **Desarrollar y probar**
   - Seguir el plan de conexión si es migración
   - Ejecutar pruebas según flujo de pruebas

3. **Commit y push**
```bash
git add .
git commit -m "feat: descripción del cambio"
git push origin feature/nombre-feature
```

4. **Crear Pull Request**
   - Incluir descripción del cambio
   - Referenciar issues relacionados

### Convenciones de Código

- **TypeScript:** Tipado estricto, evitar `any`
- **Componentes:** Usar Server Components cuando sea posible
- **Estilos:** Solo Tailwind CSS, sin CSS modules
- **Nombres:** camelCase para variables, PascalCase para componentes
- **Comentarios:** Documentar funciones complejas

---

## 🧪 Testing

### Pruebas Manuales

Seguir el flujo completo en `docs/FLUJO_PRUEBAS.md`:

1. Pruebas de autenticación
2. Pruebas por rol (SuperAdmin, Leader)
3. Pruebas de integración
4. Pruebas de errores
5. Pruebas de performance

### Checklist Pre-Deploy

- [ ] Todas las pruebas pasan
- [ ] No hay errores en consola
- [ ] Variables de entorno configuradas
- [ ] Backend completamente configurado
- [ ] Documentación actualizada

---

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error de conexión a Supabase**
   - Verificar variables de entorno
   - Verificar que el proyecto de Supabase esté activo

2. **Error al cargar perfil**
   - Ejecutar `DIAGNOSTICO_PERFIL.sql`
   - Verificar que el perfil exista en la tabla `perfiles`

3. **Error de permisos (RLS)**
   - Verificar políticas RLS en Supabase
   - Ejecutar scripts de configuración de RLS

4. **Datos no aparecen**
   - Verificar que haya datos de prueba en la BD
   - Ejecutar scripts de seed data

Ver `docs/MANUAL_USUARIO.md` sección "Solución de Problemas" para más detalles.

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Seguir el plan de conexión para migraciones
- Ejecutar pruebas antes de hacer PR
- Actualizar documentación si es necesario
- Mantener consistencia con el código existente

---

## 📝 Licencia

Este proyecto es privado y de uso interno.

---

## 👥 Equipo

- **Desarrollo:** FreeAgentsDev
- **Cliente:** Misiones Indígenas en Colombia

---

## 📞 Contacto

Para preguntas o soporte:
- Revisar la documentación en `docs/`
- Abrir un issue en el repositorio
- Contactar al administrador del sistema

---

## 🔄 Changelog

### v1.0.0 (2025-01-13)
- ✅ Sistema de autenticación completo
- ✅ Backend configurado en Supabase
- ✅ Frontend con todas las vistas (mock data)
- ✅ Documentación completa
- ⚠️ Migración a datos reales en progreso

---

**Última Actualización:** 2025-01-13

