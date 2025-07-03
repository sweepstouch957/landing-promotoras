# Diseño del Sistema de Autenticación para Landing Promotoras

## Análisis del Proyecto Actual

El proyecto es una aplicación Next.js 15 con TypeScript que incluye:

- **Estructura de rutas**: App Router de Next.js con rutas `/admin` y `/citas` que requieren protección
- **Tecnologías**: React 19, Next.js 15, TypeScript, Material-UI, React Hook Form
- **Rutas existentes**:
  - `/` - Landing page principal
  - `/formulario` - Formulario de aplicación
  - `/admin` - Dashboard administrativo
  - `/citas` - Gestión de citas y calendario

## Arquitectura del Sistema de Autenticación

### 1. Componentes Principales

#### A. Archivo de Credenciales (JSON)
- **Ubicación**: `src/data/credentials.json`
- **Contenido**: Usuario y contraseña encriptada
- **Estructura**:
```json
{
  "admin": {
    "username": "admin",
    "password": "hashed_password",
    "role": "administrator"
  }
}
```

#### B. Contexto de Autenticación
- **Ubicación**: `src/contexts/AuthContext.tsx`
- **Funcionalidades**:
  - Estado global de autenticación
  - Funciones de login/logout
  - Persistencia en localStorage
  - Validación de sesión

#### C. Middleware de Protección
- **Ubicación**: `src/middleware.ts`
- **Funcionalidades**:
  - Interceptar rutas protegidas
  - Redirección automática a login
  - Validación de tokens de sesión

#### D. Componente de Login
- **Ubicación**: `src/components/LoginForm.tsx`
- **Funcionalidades**:
  - Formulario de autenticación
  - Validación de credenciales
  - Manejo de errores
  - Integración con React Hook Form

#### E. Página de Login
- **Ubicación**: `src/app/login/page.tsx`
- **Funcionalidades**:
  - Renderizado del formulario
  - Redirección post-login
  - Diseño responsive

### 2. Flujo de Autenticación

#### Proceso de Login:
1. Usuario accede a ruta protegida
2. Middleware detecta falta de autenticación
3. Redirección automática a `/login`
4. Usuario ingresa credenciales
5. Validación contra archivo JSON
6. Generación de token de sesión
7. Almacenamiento en localStorage
8. Redirección a ruta original

#### Proceso de Logout:
1. Usuario hace clic en logout
2. Limpieza de localStorage
3. Actualización del contexto
4. Redirección a página principal

### 3. Seguridad y Persistencia

#### Medidas de Seguridad:
- Hash de contraseñas con bcrypt
- Tokens de sesión con expiración
- Validación en cada cambio de ruta
- Limpieza automática de sesiones expiradas

#### Persistencia:
- localStorage para mantener sesión
- Validación al recargar página
- Expiración automática después de inactividad

### 4. Integración con Estructura Existente

#### Modificaciones Mínimas:
- Envolver layout principal con AuthProvider
- Agregar middleware de Next.js
- Proteger rutas específicas sin afectar otras
- Mantener diseño y estilos existentes

#### Compatibilidad:
- Compatible con Next.js 15 App Router
- Integración con Material-UI existente
- Respeta estructura de componentes actual
- No interfiere con funcionalidades existentes

## Implementación Técnica

### Tecnologías a Utilizar:
- **React Context API**: Para estado global de autenticación
- **Next.js Middleware**: Para protección de rutas
- **localStorage**: Para persistencia de sesión
- **bcryptjs**: Para hash de contraseñas
- **React Hook Form**: Para validación de formularios
- **Material-UI**: Para componentes de interfaz

### Estructura de Archivos:
```
src/
├── contexts/
│   └── AuthContext.tsx
├── components/
│   ├── LoginForm.tsx
│   └── ProtectedRoute.tsx
├── app/
│   └── login/
│       └── page.tsx
├── data/
│   └── credentials.json
├── utils/
│   ├── auth.ts
│   └── encryption.ts
└── middleware.ts
```

Este diseño garantiza una implementación limpia, modular y segura del sistema de autenticación, manteniendo la integridad de la estructura existente del proyecto.

