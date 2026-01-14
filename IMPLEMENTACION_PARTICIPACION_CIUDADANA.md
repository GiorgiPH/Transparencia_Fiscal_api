# Implementación del Módulo 7: Participación Ciudadana

## Resumen
Se ha implementado el módulo completo de Participación Ciudadana para el Portal Público del Sistema de Transparencia Fiscal del Estado de Morelos. Este módulo permite a los ciudadanos enviar mensajes, sugerencias, opiniones y consultas mediante un formulario web, fomentando la participación ciudadana y facilitando la comunicación con la Unidad de Transparencia.

## Arquitectura Implementada

### 1. Estructura del Módulo
```
src/modules/public/participacion-ciudadana/
├── dto/
│   └── create-mensaje.dto.ts          # DTO para creación de mensajes
├── entities/
│   └── mensaje.entity.ts              # Entidad de mensaje
├── participacion-ciudadana.controller.ts  # Controlador REST
├── participacion-ciudadana.service.ts     # Lógica de negocio
├── participacion-ciudadana.repository.ts  # Acceso a datos con Prisma
└── participacion-ciudadana.module.ts      # Módulo NestJS
```

### 2. Características Principales

#### 2.1 Formulario Público
- **Acceso sin autenticación**: Cualquier ciudadano puede enviar mensajes
- **Validación robusta**: Todos los campos son validados automáticamente
- **Captura automática**: Dirección IP y agente de usuario capturados automáticamente
- **Folio único**: Cada mensaje recibe un folio único para seguimiento

#### 2.2 Gestión Administrativa
- **Panel de administración**: Acceso restringido a usuarios autorizados
- **Seguimiento de estatus**: Pendiente, en proceso, respondido, cerrado
- **Respuestas**: Capacidad de responder mensajes con área destino
- **Estadísticas**: Métricas completas de participación ciudadana

#### 2.3 Seguridad y Auditoría
- **Roles y permisos**: Acceso diferenciado por roles (ADMIN, CARGA, EDICION)
- **Auditoría completa**: Fechas de creación, actualización y respuesta
- **Trazabilidad**: Folio único para seguimiento ciudadano

## Endpoints Implementados

### 1. Públicos (sin autenticación)
```
POST   /api/participacion-ciudadana              # Crear nuevo mensaje
GET    /api/participacion-ciudadana/folio/:folio # Consultar mensaje por folio
```

### 2. Administrativos (requieren autenticación)
```
GET    /api/participacion-ciudadana              # Listar todos los mensajes
GET    /api/participacion-ciudadana/estadisticas # Obtener estadísticas
GET    /api/participacion-ciudadana/recientes    # Mensajes más recientes
GET    /api/participacion-ciudadana/count        # Contar mensajes
GET    /api/participacion-ciudadana/:id          # Obtener mensaje por ID
PATCH  /api/participacion-ciudadana/:id/responder # Responder mensaje
PATCH  /api/participacion-ciudadana/:id/estatus  # Cambiar estatus
DELETE /api/participacion-ciudadana/:id          # Eliminar mensaje (solo ADMIN)
```

## Modelo de Base de Datos

### 1. Tabla: mensajes_participacion_ciudadana
```sql
CREATE TABLE mensajes_participacion_ciudadana (
  id_mensaje VARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
  folio VARCHAR(50) UNIQUE NOT NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  correo_electronico VARCHAR(100) NOT NULL,
  asunto VARCHAR(200) NOT NULL,
  mensaje TEXT NOT NULL,
  estatus VARCHAR(20) DEFAULT 'pendiente',
  canal VARCHAR(20) DEFAULT 'web',
  area_destino VARCHAR(200),
  respuesta TEXT,
  fecha_respuesta DATETIME,
  fecha_creacion DATETIME DEFAULT GETDATE(),
  fecha_actualizacion DATETIME DEFAULT GETDATE(),
  direccion_ip VARCHAR(45),
  agente_usuario VARCHAR(500)
);
```

### 2. Campos Principales
- **folio**: Identificador único para seguimiento ciudadano (ej: MSG-123456-789)
- **estatus**: Estados del flujo de trabajo (pendiente, en_proceso, respondido, cerrado)
- **canal**: Medio de envío (web, email, telefono, presencial)
- **auditoría**: Fechas de creación, actualización y respuesta automáticas

## Validaciones Implementadas

### 1. Creación de Mensaje (CreateMensajeDto)
- **Nombre completo**: Requerido, máximo 200 caracteres
- **Correo electrónico**: Requerido, formato válido, máximo 100 caracteres
- **Asunto**: Requerido, máximo 200 caracteres
- **Mensaje**: Requerido, máximo 5000 caracteres
- **Canal**: Opcional, valores permitidos: web, email, telefono, presencial
- **Área destino**: Opcional, máximo 200 caracteres

### 2. Validaciones Automáticas
- **Folio único**: Generado automáticamente con formato MSG-TIMESTAMP-RANDOM
- **Dirección IP**: Capturada automáticamente del request
- **Agente usuario**: Capturado automáticamente del navegador
- **Fechas**: Creación y actualización automáticas

## Integración con el Sistema

### 1. Módulo Público
El módulo está integrado en la estructura de módulos públicos:
```typescript
// src/modules/public/public.module.ts
@Module({
  imports: [ParticipacionCiudadanaModule],
  exports: [ParticipacionCiudadanaModule],
})
export class PublicModule {}
```

### 2. Aplicación Principal
Incluido en el módulo raíz de la aplicación:
```typescript
// src/app.module.ts
@Module({
  imports: [
    // ... otras importaciones
    PublicModule,
  ],
})
export class AppModule {}
```

## Flujo de Trabajo

### 1. Ciudadano Envía Mensaje
1. Accede al formulario en el portal público
2. Completa datos personales y mensaje
3. Sistema valida datos y genera folio único
4. Mensaje se guarda con estatus "pendiente"
5. Ciudadano recibe folio para seguimiento

### 2. Administración Responde
1. Usuario autorizado accede al panel administrativo
2. Visualiza mensajes pendientes
3. Selecciona mensaje y redacta respuesta
4. Asigna área destino si corresponde
5. Sistema actualiza estatus a "respondido"
6. (Opcional) Envía respuesta por correo al ciudadano

### 3. Seguimiento Ciudadano
1. Ciudadano consulta estado con su folio
2. Visualiza estatus y respuesta si está disponible
3. Puede enviar seguimiento si es necesario

## Pruebas y Validación

### 1. Construcción Exitosa
El proyecto se compila correctamente sin errores de TypeScript:
```bash
npm run build  # ✅ Compilación exitosa
```

### 2. Próximos Pasos
1. **Pruebas de Integración**: Validar endpoints con Postman/Insomnia
2. **Documentación Swagger**: Verificar documentación automática en `/api`
3. **Configuración CORS**: Ajustar para permitir acceso desde frontend
4. **Notificaciones por Correo**: Implementar servicio de envío de emails

## Consideraciones de Implementación

### 1. Performance
- **Paginación**: Implementada en endpoints de listado
- **Índices**: Campos de búsqueda optimizados (folio, email, estatus)
- **Caché**: Posibilidad de cachear estadísticas frecuentes

### 2. Escalabilidad
- **Arquitectura modular**: Fácil extensión para nuevos canales
- **Repository Pattern**: Abstracción de acceso a datos
- **Inyección de dependencias**: Fácil testing y mantenimiento

### 3. Seguridad
- **Validación de entrada**: Prevención de inyecciones y XSS
- **Rate limiting**: Recomendado para endpoints públicos
- **Sanitización**: Limpieza automática de datos de entrada

## Integración con Frontend

### 1. Portal Público
- **Formulario simple**: Campos: nombre, email, asunto, mensaje
- **Confirmación**: Mostrar folio generado al ciudadano
- **Consulta**: Página para consultar estado con folio

### 2. Portal Operativo
- **Panel administrativo**: Listado, filtros, búsqueda
- **Gestión de respuestas**: Editor de respuestas con área destino
- **Dashboard**: Estadísticas y métricas de participación

## Conclusión
Se ha implementado un sistema completo y robusto para la participación ciudadana que cumple con los requisitos del Portal Público de Transparencia Fiscal. El sistema está listo para integración con el frontend y proporciona una base sólida para fomentar la comunicación gobierno-ciudadanía.

El módulo sigue todas las convenciones establecidas en las reglas del proyecto y utiliza las mejores prácticas de desarrollo con NestJS y Prisma.
