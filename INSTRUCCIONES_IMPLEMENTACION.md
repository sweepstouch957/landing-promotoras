# Instrucciones de Implementación - Google Meet Integration

## Resumen de Cambios Implementados

Se ha implementado una integración completa con Google Calendar y Gmail para generar automáticamente enlaces de Google Meet y enviar correos electrónicos cuando los usuarios agendan citas.

### Funcionalidades Implementadas

1. **Generación automática de enlaces de Google Meet**
2. **Envío automático de correos electrónicos**
3. **Visualización de enlaces en el panel de administración**
4. **Integración completa con Google Calendar**

## Archivos Nuevos Creados

### Librerías y Servicios
- `src/lib/google-auth.ts` - Gestión de autenticación OAuth con Google
- `src/lib/google-calendar.ts` - Gestión de eventos en Google Calendar
- `src/lib/email-service.ts` - Servicio de envío de correos electrónicos

### API Routes
- `src/app/api/auth/google/route.ts` - Endpoint de autenticación con Google
- `src/app/api/auth/google/callback/route.ts` - Callback de OAuth
- `src/app/api/meetings/create/route.ts` - Creación de reuniones
- `src/app/api/emails/send/route.ts` - Envío de correos
- `src/app/api/appointments/create/route.ts` - Endpoint principal para crear citas completas

### Componentes
- `src/components/GoogleAuthSetup.tsx` - Configuración de autenticación Google
- `src/components/AdminDashboardTabs.tsx` - Panel de administración con tabs

### Configuración
- `.env.local.example` - Ejemplo de variables de entorno
- `google-setup-guide.md` - Guía completa de configuración

## Archivos Modificados

### Componentes Actualizados
- `src/components/ApplicationForm.tsx` - Integración con APIs de Google
- `src/components/AdminScheduleCalendar.tsx` - Visualización de enlaces Meet
- `src/app/admin/page.tsx` - Uso del nuevo componente con tabs

### Dependencias Agregadas
- `googleapis` - Cliente oficial de Google APIs
- `@types/nodemailer` - Tipos para Nodemailer

## Configuración Requerida

### 1. Variables de Entorno

Copia `.env.local.example` a `.env.local` y completa las variables:

```bash
cp .env.local.example .env.local
```

### 2. Google Cloud Console

Sigue la guía en `google-setup-guide.md` para:
- Crear proyecto en Google Cloud Console
- Habilitar Google Calendar API y Gmail API
- Configurar OAuth 2.0
- Obtener credenciales

### 3. Gmail App Password

Configura una contraseña de aplicación en Gmail para SMTP.

## Flujo de Funcionamiento

### 1. Configuración Inicial (Una sola vez)
1. El administrador va a la pestaña "Google Calendar" en el panel de admin
2. Hace clic en "Conectar con Google"
3. Autoriza los permisos necesarios
4. Las credenciales se guardan automáticamente

### 2. Proceso de Agendamiento
1. Usuario completa el formulario `ApplicationForm`
2. Usuario selecciona fecha y hora en el calendario
3. Sistema automáticamente:
   - Crea evento en Google Calendar con enlace de Meet
   - Envía email de confirmación al usuario
   - Envía email de notificación a `aldairleiva42@gmail.com`
   - Guarda la cita con toda la información

### 3. Visualización en Admin
1. Los enlaces de Meet aparecen en el calendario de administración
2. Se pueden ver detalles completos de cada cita
3. Botones directos para unirse a Meet o ver en Google Calendar

## Características Técnicas

### Manejo de Errores
- Renovación automática de tokens de Google
- Fallback a modo local si falla la integración
- Mensajes informativos para el usuario

### Seguridad
- Tokens OAuth almacenados localmente
- Validación de permisos
- Manejo seguro de credenciales

### Emails HTML
- Templates profesionales con diseño responsive
- Información completa de la cita
- Enlaces directos a Google Meet

## Pruebas Recomendadas

### 1. Configuración de Google
- [ ] Verificar que las APIs estén habilitadas
- [ ] Probar el flujo de OAuth
- [ ] Confirmar que se guardan las credenciales

### 2. Creación de Citas
- [ ] Completar formulario y agendar cita
- [ ] Verificar que se crea el evento en Google Calendar
- [ ] Confirmar que se genera el enlace de Meet
- [ ] Verificar envío de emails

### 3. Panel de Administración
- [ ] Ver citas en el calendario
- [ ] Verificar que aparecen los enlaces de Meet
- [ ] Probar botones de "Unirse a Meet"

### 4. Emails
- [ ] Verificar recepción del email de confirmación
- [ ] Verificar email de notificación al administrador
- [ ] Probar enlaces en los emails

## Solución de Problemas

### Error: "Configuración requerida"
- Verificar que las credenciales de Google estén configuradas
- Ir a la pestaña "Google Calendar" y reconectar

### Error: "Failed to create meeting"
- Verificar variables de entorno
- Comprobar que las APIs estén habilitadas
- Verificar que el token no haya expirado

### Error en envío de emails
- Verificar configuración SMTP
- Confirmar contraseña de aplicación de Gmail
- Verificar que la verificación en 2 pasos esté activada

## Mantenimiento

### Renovación de Tokens
Los tokens se renuevan automáticamente, pero si hay problemas:
1. Ir a "Google Calendar" en el panel de admin
2. Hacer clic en "Reconectar"

### Backup de Configuración
Las citas se guardan en localStorage como respaldo, pero para producción se recomienda implementar una base de datos.

## Próximos Pasos Recomendados

1. **Base de Datos**: Migrar de localStorage a una base de datos real
2. **Notificaciones**: Implementar recordatorios automáticos
3. **Calendario Público**: Mostrar disponibilidad en tiempo real
4. **Webhooks**: Sincronización bidireccional con Google Calendar
5. **Analytics**: Métricas de citas y conversiones

