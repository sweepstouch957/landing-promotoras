# Guía de Integración Backend - Sistema de Promotoras

**Autor:** Manus AI  
**Fecha:** 14 de Agosto, 2025  
**Versión:** 1.0  

## Resumen Ejecutivo

Este documento proporciona una guía completa para el desarrollador backend sobre cómo integrar y procesar los datos del sistema de promotoras. El sistema frontend envía datos de dos fuentes principales: el formulario de registro de usuarios y las imágenes de perfil subidas durante el proceso de entrenamiento.

## Arquitectura del Sistema

### Flujo de Datos

El sistema sigue un flujo de datos específico que debe ser comprendido para una correcta integración:

1. **Registro de Usuario**: Los datos del formulario se envían a la API de usuarios
2. **Proceso de Entrenamiento**: El usuario completa un video de capacitación
3. **Subida de Foto**: Al finalizar el entrenamiento, se sube una foto de perfil
4. **Consolidación de Datos**: Ambos conjuntos de datos deben ser procesados juntos

### Endpoints Involucrados

#### 1. API de Usuarios
- **URL**: `https://backend-promotoras.onrender.com/api/users`
- **Método**: POST
- **Propósito**: Recibir datos del formulario de registro

#### 2. API de Subida de Imágenes
- **URL**: `https://api2.sweepstouch.com/api/upload`
- **Método**: POST
- **Propósito**: Almacenar imágenes de perfil de promotoras

## Estructura de Datos del Formulario

### Payload del Usuario

Cuando un usuario completa el formulario de registro, se envía el siguiente payload a la API de usuarios:

```json
{
  "nombre": "María",
  "apellido": "González",
  "email": "maria.gonzalez@email.com",
  "telefono": "555-0123",
  "edad": 28,
  "zipCode": "12345",
  "idiomas": ["Español", "Inglés"]
}
```

### Campos del Formulario

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | Sí | Nombre de la promotora |
| apellido | string | Sí | Apellido de la promotora |
| email | string | Sí | Correo electrónico (único) |
| telefono | string | No | Número de teléfono |
| edad | number | Sí | Edad (debe ser >= 18) |
| zipCode | string | No | Código postal |
| idiomas | array | Sí | Lista de idiomas que habla |

### Validaciones Frontend

El frontend implementa las siguientes validaciones antes del envío:

- **Email**: Formato válido de correo electrónico
- **Edad**: Número entre 18 y 100 años
- **Idiomas**: Al menos un idioma seleccionado (por defecto "Español")
- **Campos requeridos**: nombre, apellido, email, edad

## Estructura de Datos de la Imagen

### Payload de la Imagen

La subida de imagen se realiza mediante FormData con los siguientes campos:

```javascript
const formData = new FormData();
formData.append('image', file); // Archivo de imagen
formData.append('folder', 'promotor-request'); // Carpeta de destino
```

### Respuesta Esperada

La API de imágenes debe retornar:

```json
{
  "url": "https://cloudinary.com/path/to/image.jpg",
  "public_id": "promotor-request/unique_id"
}
```

## Almacenamiento Local (Frontend)

### Datos del Usuario

Los datos del usuario se almacenan en localStorage con la clave `userData`:

```json
{
  "nombre": "María",
  "apellido": "González",
  "email": "maria.gonzalez@email.com",
  "telefono": "555-0123",
  "edad": 28,
  "zipCode": "12345",
  "idiomas": ["Español", "Inglés"],
  "photoUrl": "https://cloudinary.com/path/to/image.jpg"
}
```

### Progreso del Entrenamiento

El progreso se almacena en localStorage con la clave `elearning-progress`:

```json
{
  "videos": [
    {
      "id": "training",
      "completed": true,
      "watchedTime": 129
    }
  ],
  "currentVideoIndex": 0,
  "isSubmitted": true
}
```

## Estrategias de Integración Backend

### Opción 1: Webhook/Callback System

Implementar un sistema de webhooks donde el frontend notifique al backend cuando ambos procesos (registro + foto) estén completos.

**Ventajas:**
- Procesamiento en tiempo real
- Mejor experiencia de usuario
- Control inmediato de errores

**Implementación sugerida:**

```javascript
// Frontend - después de subir la foto exitosamente
const notifyBackend = async (userData) => {
  await fetch('https://your-backend.com/api/promotor-complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userData.email, // o ID único
      formData: userData,
      photoUrl: userData.photoUrl,
      completedAt: new Date().toISOString()
    })
  });
};
```

### Opción 2: Polling System

El backend puede hacer polling periódico a ambas APIs para sincronizar datos.

**Ventajas:**
- Independiente del frontend
- Manejo de fallos robusto
- Procesamiento por lotes

**Implementación sugerida:**

```python
# Backend - Python/Django ejemplo
import requests
import time

def sync_promotor_data():
    # 1. Obtener usuarios nuevos de la API
    users_response = requests.get('https://backend-promotoras.onrender.com/api/users')
    
    # 2. Para cada usuario, verificar si tiene foto
    for user in users_response.json():
        photo_exists = check_photo_exists(user['email'])
        if photo_exists:
            process_complete_promotor(user)

def check_photo_exists(user_email):
    # Lógica para verificar si existe foto para este usuario
    # Puede ser mediante una tabla de mapeo o convención de nombres
    pass
```

### Opción 3: Message Queue System

Utilizar un sistema de colas como Redis, RabbitMQ o AWS SQS para manejar los eventos.

**Ventajas:**
- Escalabilidad alta
- Procesamiento asíncrono
- Tolerancia a fallos

## Consideraciones de Seguridad

### Validación de Datos

El backend debe implementar validaciones robustas:

```python
def validate_promotor_data(data):
    required_fields = ['nombre', 'apellido', 'email', 'edad']
    
    for field in required_fields:
        if not data.get(field):
            raise ValidationError(f"Campo {field} es requerido")
    
    if not is_valid_email(data['email']):
        raise ValidationError("Email inválido")
    
    if data['edad'] < 18 or data['edad'] > 100:
        raise ValidationError("Edad debe estar entre 18 y 100 años")
```

### Autenticación y Autorización

- Implementar rate limiting en los endpoints
- Validar tokens de acceso si es necesario
- Sanitizar todos los inputs

### Manejo de Imágenes

- Validar tipos de archivo permitidos
- Limitar tamaño de archivos
- Escanear por malware si es necesario

## Manejo de Errores

### Escenarios de Error Comunes

1. **Usuario registrado pero sin foto**
   - Implementar timeout (ej: 24 horas)
   - Enviar recordatorios por email
   - Marcar como incompleto

2. **Foto subida pero usuario no encontrado**
   - Implementar sistema de reconciliación
   - Almacenar temporalmente hasta encontrar match

3. **Duplicados**
   - Usar email como clave única
   - Implementar upsert operations

### Logging y Monitoreo

```python
import logging

logger = logging.getLogger(__name__)

def process_promotor_registration(data):
    try:
        logger.info(f"Processing registration for {data['email']}")
        # Lógica de procesamiento
        logger.info(f"Successfully processed {data['email']}")
    except Exception as e:
        logger.error(f"Error processing {data['email']}: {str(e)}")
        # Implementar retry logic si es necesario
```

## Ejemplo de Implementación Completa

### Backend API Endpoint

```python
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def process_complete_promotor(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validar datos
            validate_promotor_data(data)
            
            # Crear o actualizar promotora
            promotor = Promotor.objects.update_or_create(
                email=data['email'],
                defaults={
                    'nombre': data['nombre'],
                    'apellido': data['apellido'],
                    'telefono': data.get('telefono', ''),
                    'edad': data['edad'],
                    'zip_code': data.get('zipCode', ''),
                    'idiomas': data['idiomas'],
                    'photo_url': data.get('photoUrl', ''),
                    'status': 'complete' if data.get('photoUrl') else 'pending_photo'
                }
            )
            
            # Enviar email de bienvenida si está completo
            if promotor.status == 'complete':
                send_welcome_email(promotor)
            
            return JsonResponse({'success': True, 'id': promotor.id})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
```

### Modelo de Datos Sugerido

```python
from django.db import models

class Promotor(models.Model):
    STATUS_CHOICES = [
        ('pending_photo', 'Pendiente de Foto'),
        ('complete', 'Completo'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    ]
    
    email = models.EmailField(unique=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20, blank=True)
    edad = models.IntegerField()
    zip_code = models.CharField(max_length=10, blank=True)
    idiomas = models.JSONField()
    photo_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending_photo')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.email})"
```

## Recomendaciones Finales

### Mejores Prácticas

1. **Idempotencia**: Asegurar que las operaciones puedan ejecutarse múltiples veces sin efectos secundarios
2. **Transacciones**: Usar transacciones de base de datos para operaciones críticas
3. **Backup**: Implementar respaldos regulares de los datos
4. **Monitoreo**: Configurar alertas para fallos en el procesamiento

### Métricas a Monitorear

- Tiempo de procesamiento promedio
- Tasa de éxito de registros
- Número de registros incompletos
- Errores de API por minuto

### Escalabilidad

- Considerar sharding por región geográfica
- Implementar cache para consultas frecuentes
- Usar CDN para las imágenes

## Conclusión

La integración exitosa de este sistema requiere una comprensión clara del flujo de datos y la implementación de mecanismos robustos de sincronización. Se recomienda comenzar con la Opción 1 (Webhook/Callback) para una implementación más directa, y evolucionar hacia sistemas más complejos según las necesidades de escalabilidad.

Para cualquier consulta técnica adicional, contactar al equipo de desarrollo frontend que implementó estas funcionalidades.

