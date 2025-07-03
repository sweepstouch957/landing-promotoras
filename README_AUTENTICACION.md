# Sistema de Autenticación - Landing Promotoras

## Resumen

Se ha implementado exitosamente un sistema de autenticación completo para proteger las rutas del administrador (`/admin` y `/citas`) en el proyecto Next.js. El sistema incluye formulario de login, middleware de seguridad, persistencia de sesión y navegación de autenticación.

## Características Implementadas

### ✅ Protección de Rutas
- **Rutas protegidas**: `/admin` y `/citas`
- **Middleware de Next.js**: Intercepta automáticamente el acceso a rutas protegidas
- **Redirección automática**: Los usuarios no autenticados son redirigidos al login
- **Preservación de URL**: Después del login, el usuario es redirigido a la página original

### ✅ Sistema de Autenticación
- **Credenciales seguras**: Contraseñas hasheadas con bcrypt
- **Tokens de sesión**: Generación y validación de tokens con expiración (24 horas)
- **Validación robusta**: Verificación tanto en cliente como en servidor

### ✅ Persistencia de Sesión
- **localStorage**: Almacenamiento local de datos de sesión
- **Cookies**: Sincronización con cookies para el middleware
- **Verificación automática**: Validación de sesión al recargar la página
- **Limpieza automática**: Eliminación de sesiones expiradas

### ✅ Interfaz de Usuario
- **Formulario de login**: Diseño profesional con Material-UI
- **Navegación de autenticación**: Menú de usuario con opciones de administración
- **Indicadores visuales**: Estado de autenticación visible en el header
- **Experiencia fluida**: Transiciones suaves entre estados

## Credenciales de Acceso

```
Usuario: admin
Contraseña: admin123
```

## Estructura de Archivos

```
src/
├── data/
│   └── credentials.json          # Credenciales de usuario (contraseña hasheada)
├── contexts/
│   └── AuthContext.tsx          # Contexto global de autenticación
├── components/
│   ├── LoginForm.tsx            # Formulario de inicio de sesión
│   ├── ProtectedRoute.tsx       # Componente para proteger rutas
│   └── AuthNavigation.tsx       # Navegación con opciones de usuario
├── utils/
│   ├── auth.ts                  # Funciones de autenticación
│   ├── encryption.ts            # Utilidades de encriptación
│   └── cookieSync.ts            # Sincronización con cookies
├── app/
│   ├── login/
│   │   └── page.tsx             # Página de login
│   ├── admin/
│   │   └── page.tsx             # Página protegida de administración
│   ├── citas/
│   │   └── page.tsx             # Página protegida de citas
│   └── layout.tsx               # Layout con AuthProvider
└── middleware.ts                # Middleware de Next.js para protección
```

## Flujo de Autenticación

### 1. Acceso a Ruta Protegida
1. Usuario intenta acceder a `/admin` o `/citas`
2. Middleware verifica la existencia de token válido en cookies
3. Si no hay token válido, redirecciona a `/login?redirect=/ruta-original`

### 2. Proceso de Login
1. Usuario ingresa credenciales en el formulario
2. Sistema valida credenciales contra archivo JSON
3. Se genera token de sesión con timestamp
4. Token se almacena en localStorage y cookies
5. Usuario es redirigido a la ruta original

### 3. Navegación Autenticada
1. Header muestra información del usuario autenticado
2. Menú desplegable con opciones de navegación
3. Acceso directo a rutas protegidas
4. Opción de cerrar sesión

### 4. Logout
1. Usuario hace clic en "Cerrar Sesión"
2. Se limpian localStorage y cookies
3. Estado de autenticación se actualiza
4. Redirección a página principal

## Seguridad

### Medidas Implementadas
- **Contraseñas hasheadas**: Uso de bcrypt con salt rounds
- **Tokens con expiración**: Validez de 24 horas
- **Validación dual**: Cliente y servidor
- **Limpieza automática**: Eliminación de datos inválidos
- **Protección CSRF**: Cookies con SameSite=Lax

### Consideraciones de Producción
- Las credenciales están en archivo JSON para simplicidad
- En producción se recomienda usar base de datos
- Implementar rate limiting para intentos de login
- Usar HTTPS en producción
- Considerar autenticación de dos factores

## Tecnologías Utilizadas

- **Next.js 15**: Framework principal con App Router
- **React 19**: Biblioteca de interfaz de usuario
- **TypeScript**: Tipado estático
- **Material-UI**: Componentes de interfaz
- **bcryptjs**: Encriptación de contraseñas
- **React Hook Form**: Manejo de formularios
- **React Context**: Estado global de autenticación

## Pruebas Realizadas

### ✅ Funcionalidades Verificadas
1. **Protección de rutas**: Acceso denegado sin autenticación
2. **Login exitoso**: Autenticación con credenciales correctas
3. **Redirección**: Navegación a ruta original después del login
4. **Persistencia**: Sesión mantenida al recargar página
5. **Navegación**: Acceso fluido entre rutas protegidas
6. **Logout**: Cierre de sesión y limpieza de datos
7. **Middleware**: Interceptación correcta de rutas

### ✅ Casos de Uso Probados
- Acceso directo a `/admin` sin autenticación → Redirección a login
- Login con credenciales correctas → Acceso concedido
- Navegación entre `/admin` y `/citas` → Sin interrupciones
- Recarga de página estando autenticado → Sesión mantenida
- Logout → Redirección y limpieza de sesión
- Intento de acceso después de logout → Protección activa

## Instalación y Uso

### Dependencias Agregadas
```bash
npm install bcryptjs @types/bcryptjs @mui/icons-material
```

### Ejecución
```bash
npm run dev
```

### Acceso
1. Navegar a `http://localhost:3000`
2. Intentar acceder a `/admin` o `/citas`
3. Usar credenciales: `admin` / `admin123`
4. Explorar funcionalidades de administración

## Mantenimiento

### Actualización de Credenciales
Para cambiar las credenciales, modificar el archivo `src/data/credentials.json` con nuevas contraseñas hasheadas.

### Extensión del Sistema
- Agregar más roles de usuario
- Implementar registro de usuarios
- Conectar con base de datos
- Agregar más rutas protegidas

## Conclusión

El sistema de autenticación ha sido implementado exitosamente cumpliendo todos los requisitos:

- ✅ Formulario de login funcional
- ✅ Protección de rutas `/admin` y `/citas`
- ✅ Funcionamiento sin backend
- ✅ Middleware de seguridad
- ✅ Persistencia de sesión
- ✅ Código limpio y modular
- ✅ Integración sin romper estructura existente

El sistema está listo para uso en desarrollo y puede ser fácilmente adaptado para producción con las consideraciones de seguridad apropiadas.

