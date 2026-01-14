# Implementación del Servicio de Correo

## Descripción
Servicio de correo reutilizable para el sistema de Transparencia Fiscal del Estado de Morelos. Este servicio permite enviar correos electrónicos con plantillas HTML personalizadas y manejo de errores robusto.

## Arquitectura

### Estructura de Archivos
```
src/common/
├── interfaces/
│   └── mail.interface.ts      # Interfaces TypeScript para el servicio de correo
└── services/
    ├── mail.service.ts        # Implementación principal del servicio
    └── mail.module.ts         # Módulo NestJS global para el servicio
```

### Dependencias
- **nodemailer**: Cliente SMTP para Node.js
- **@types/nodemailer**: Tipos TypeScript para nodemailer

## Configuración

### Variables de Entorno
Agregar al archivo `.env`:

```env
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tu_correo@gmail.com
MAIL_PASSWORD=tu_contraseña_o_app_password
MAIL_FROM=transparencia.fiscal@morelos.gob.mx
MAIL_REPLY_TO=no-reply@morelos.gob.mx

# Application URL (for email links)
APP_URL=http://localhost:3000

# Internal notification emails (comma separated)
MAIL_INTERNAL_NOTIFICATIONS=admin@morelos.gob.mx,transparencia@morelos.gob.mx
```

### Configuración para Desarrollo
En modo desarrollo (`NODE_ENV=development`), el servicio utiliza un transporter de prueba de ethereal.email que no requiere configuración real de SMTP. Los correos se pueden visualizar en la URL proporcionada en los logs.

## Uso

### Inyección de Dependencias
El servicio está disponible globalmente en toda la aplicación gracias al decorador `@Global()` en `MailModule`.

```typescript
import { MailService } from '../common/services/mail.service';

@Injectable()
export class MiServicio {
  constructor(private readonly mailService: MailService) {}
}
```

### Métodos Disponibles

#### 1. Envío de Correo Básico
```typescript
await this.mailService.sendMail({
  to: 'destinatario@example.com',
  subject: 'Asunto del correo',
  html: '<h1>Contenido HTML</h1>',
  text: 'Contenido en texto plano',
  cc: ['cc1@example.com', 'cc2@example.com'],
  bcc: 'bcc@example.com',
  attachments: [
    {
      filename: 'documento.pdf',
      path: '/ruta/al/documento.pdf',
    },
  ],
});
```

#### 2. Envío con Plantilla
```typescript
await this.mailService.sendTemplateMail(
  'destinatario@example.com',
  'Asunto del correo',
  'nombre-plantilla',
  { variable1: 'valor1', variable2: 'valor2' },
  { cc: ['cc@example.com'] },
);
```

#### 3. Plantillas Predefinidas

##### a) Participación Ciudadana - Confirmación
```typescript
await this.mailService.sendParticipacionCiudadanaConfirmacion(
  nombre: string,
  correo: string,
  folio: string,
  asunto: string,
  areaDestino: string,
);
```

**Plantilla:** `participacion-ciudadana-confirmacion`
- Confirmación al ciudadano de recepción de mensaje
- Incluye folio, asunto, área destino y fecha
- Diseño profesional con branding del Gobierno de Morelos

##### b) Notificación Interna
```typescript
await this.mailService.sendNotificacionInterna(
  nombre: string,
  correo: string,
  folio: string,
  asunto: string,
  mensaje: string,
  areaDestino: string,
  canal: string,
  destinatariosInternos: string | string[],
);
```

**Plantilla:** `notificacion-interna`
- Notificación al personal administrativo
- Incluye todos los detalles del mensaje recibido
- Enlace directo al sistema administrativo
- Diseño de alerta para atención prioritaria

## Integración con Participación Ciudadana

### Flujo de Correos Automáticos
1. **Creación de Mensaje**: Cuando un ciudadano envía un mensaje a través del portal
2. **Correo de Confirmación**: Se envía automáticamente al ciudadano
3. **Notificación Interna**: Se envía al personal administrativo designado

### Configuración de Destinatarios Internos
Los destinatarios se configuran en la variable `MAIL_INTERNAL_NOTIFICATIONS` como una lista separada por comas:
```env
MAIL_INTERNAL_NOTIFICATIONS=jefe.transparencia@morelos.gob.mx,coordinador@morelos.gob.mx
```

## Manejo de Errores

### Errores de Configuración
- Si falla la inicialización del transporter, se intenta usar ethereal.email en desarrollo
- En producción, se lanza una excepción si no se puede configurar el servicio

### Errores de Envío
- Los errores de envío se registran pero no detienen el flujo principal
- En desarrollo, se muestra URL de vista previa de ethereal.email
- Se implementa reintento automático en caso de fallos temporales

## Pruebas

### Modo Desarrollo
1. Configurar `NODE_ENV=development`
2. El servicio usará ethereal.email automáticamente
3. Ver logs para obtener URL de vista previa

### Ejemplo de Prueba
```bash
# 1. Iniciar la aplicación
npm run start:dev

# 2. Enviar solicitud POST a /api/public/participacion-ciudadana
# 3. Verificar logs para URL de vista previa
# 4. Acceder a la URL para visualizar el correo
```

## Personalización

### Agregar Nueva Plantilla
1. Agregar plantilla HTML en el método `renderTemplate` de `MailService`
2. Crear método público para enviar la plantilla
3. Documentar el uso en esta guía

### Cambiar Configuración SMTP
1. Actualizar variables de entorno
2. Para Gmail, usar "App Password" en lugar de contraseña normal
3. Para otros proveedores, ajustar `MAIL_HOST`, `MAIL_PORT` y `MAIL_SECURE`

## Consideraciones de Seguridad

1. **Credenciales**: Nunca commitear credenciales reales en el repositorio
2. **SSL/TLS**: Usar `MAIL_SECURE=true` para puerto 465
3. **Validación**: El servicio valida automáticamente la configuración al iniciar
4. **Logs**: No registrar información sensible en los logs

## Mantenimiento

### Actualización de Dependencias
```bash
npm update nodemailer
```

### Monitoreo
- Revisar logs periódicamente para detectar fallos de envío
- Monitorear tasa de entrega de correos
- Actualizar plantillas según necesidades del negocio

## Soporte

Para problemas con el servicio de correo:
1. Verificar configuración de variables de entorno
2. Revisar logs de la aplicación
3. Probar configuración SMTP con herramientas externas
4. Contactar al administrador del sistema
