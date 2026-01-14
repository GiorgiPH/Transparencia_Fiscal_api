# Implementación del Módulo de Estrategias de Comunicación

## Descripción
Este módulo gestiona las noticias y redes sociales para el Portal Público de Transparencia Fiscal del Estado de Morelos. Proporciona endpoints públicos para consulta de información y endpoints administrativos para gestión completa.

## Modelos de Base de Datos

### Noticia
```prisma
model Noticia {
  id                Int      @id @default(autoincrement()) @map("id")
  titulo            String   @map("titulo")
  descripcion_corta String   @map("descripcion_corta")
  contenido         String   @map("contenido")
  imagen_url        String?  @map("imagen_url")
  fecha_publicacion DateTime @map("fecha_publicacion")
  activo            Boolean  @default(true) @map("activo")
  fecha_creacion    DateTime @default(now()) @map("fecha_creacion")
  fecha_actualizacion DateTime @updatedAt @map("fecha_actualizacion")

  @@map("noticias")
}
```

### RedSocial
```prisma
model RedSocial {
  id                Int      @id @default(autoincrement()) @map("id")
  nombre            String   @map("nombre")
  url               String   @map("url")
  icono             String   @map("icono")
  activo            Boolean  @default(true) @map("activo")
  orden             Int      @default(0) @map("orden")
  fecha_creacion    DateTime @default(now()) @map("fecha_creacion")
  fecha_actualizacion DateTime @updatedAt @map("fecha_actualizacion")

  @@map("redes_sociales")
}
```

## Estructura del Módulo

```
src/modules/public/estrategias-comunicacion/
├── dto/
│   ├── create-noticia.dto.ts
│   ├── update-noticia.dto.ts
│   ├── create-red-social.dto.ts
│   └── update-red-social.dto.ts
├── entities/
│   ├── noticia.entity.ts
│   └── red-social.entity.ts
├── estrategias-comunicacion.controller.ts
├── estrategias-comunicacion.module.ts
├── estrategias-comunicacion.repository.ts
└── estrategias-comunicacion.service.ts
```

## Endpoints Públicos (sin autenticación)

### Noticias
- `GET /api/estrategias-comunicacion/noticias` - Listar noticias activas
- `GET /api/estrategias-comunicacion/noticias/recientes` - Noticias recientes activas
- `GET /api/estrategias-comunicacion/noticias/:id` - Detalle de noticia activa

### Redes Sociales
- `GET /api/estrategias-comunicacion/redes-sociales` - Listar redes sociales activas

## Endpoints Administrativos (requieren autenticación JWT)

### Noticias (requieren roles: ADMIN, CARGA, EDICION)
- `GET /api/estrategias-comunicacion/admin/noticias` - Listar todas las noticias
- `POST /api/estrategias-comunicacion/admin/noticias` - Crear noticia
- `GET /api/estrategias-comunicacion/admin/noticias/:id` - Detalle de noticia
- `PATCH /api/estrategias-comunicacion/admin/noticias/:id` - Actualizar noticia
- `PATCH /api/estrategias-comunicacion/admin/noticias/:id/activo` - Activar/desactivar noticia
- `DELETE /api/estrategias-comunicacion/admin/noticias/:id` - Eliminar noticia (solo ADMIN)
- `GET /api/estrategias-comunicacion/admin/noticias/count` - Contar noticias

### Redes Sociales (requieren roles: ADMIN, CARGA, EDICION)
- `GET /api/estrategias-comunicacion/admin/redes-sociales` - Listar todas las redes sociales
- `POST /api/estrategias-comunicacion/admin/redes-sociales` - Crear red social
- `GET /api/estrategias-comunicacion/admin/redes-sociales/:id` - Detalle de red social
- `PATCH /api/estrategias-comunicacion/admin/redes-sociales/:id` - Actualizar red social
- `PATCH /api/estrategias-comunicacion/admin/redes-sociales/:id/activo` - Activar/desactivar red social
- `DELETE /api/estrategias-comunicacion/admin/redes-sociales/:id` - Eliminar red social (solo ADMIN)
- `GET /api/estrategias-comunicacion/admin/redes-sociales/count` - Contar redes sociales

### Estadísticas
- `GET /api/estrategias-comunicacion/admin/estadisticas` - Estadísticas del módulo

## Validaciones

### Noticia
- `titulo`: Requerido, string
- `descripcion_corta`: Requerido, string
- `contenido`: Requerido, string
- `imagen_url`: Opcional, string
- `fecha_publicacion`: Requerido, fecha válida
- `activo`: Opcional, booleano (default: true)

### Red Social
- `nombre`: Requerido, string
- `url`: Requerido, string
- `icono`: Requerido, string
- `activo`: Opcional, booleano (default: true)
- `orden`: Opcional, número entero positivo (default: 0)

## Características Técnicas

### Seguridad
- Endpoints públicos: No requieren autenticación
- Endpoints administrativos: Requieren JWT y roles específicos
- Control de acceso basado en roles (ADMIN, CARGA, EDICION)
- Solo ADMIN puede eliminar registros

### Auditoría
- Todos los modelos incluyen campos de auditoría:
  - `fecha_creacion`: Fecha de creación automática
  - `fecha_actualizacion`: Fecha de última actualización automática
  - `activo`: Control de estado activo/inactivo

### Paginación y Filtros
- Paginación con `skip` y `take`
- Filtrado por estado activo/inactivo
- Búsqueda por texto en título, descripción y contenido
- Ordenamiento por fecha de publicación o creación
- Filtrado solo activos para endpoints públicos

### Manejo de Errores
- Respuestas estandarizadas con `TransformInterceptor`
- Manejo centralizado de excepciones
- Validación automática con `class-validator`
- Documentación Swagger completa

## Integración con Frontend

### Portal Público
El frontend público puede consumir los endpoints públicos para mostrar:
- Noticias recientes en la página principal
- Listado completo de noticias en sección específica
- Redes sociales en el footer o sección de contacto

### Portal Operativo
El frontend administrativo puede consumir los endpoints administrativos para:
- Gestión completa de noticias (CRUD)
- Gestión de redes sociales
- Panel de estadísticas

## Pruebas Recomendadas

1. **Endpoints Públicos:**
   - Verificar que devuelven solo registros activos
   - Probar paginación y filtros
   - Verificar ordenamiento

2. **Endpoints Administrativos:**
   - Probar autenticación y autorización
   - Validar creación y actualización
   - Probar activación/desactivación
   - Verificar eliminación (solo ADMIN)

3. **Validaciones:**
   - Probar DTOs con datos inválidos
   - Verificar mensajes de error

## Configuración

El módulo se integra automáticamente al importar `EstrategiasComunicacionModule` en `PublicModule`.

## Dependencias
- Prisma ORM para acceso a datos
- JWT para autenticación
- class-validator para validaciones
- Swagger para documentación API
- NestJS interceptors para respuestas estandarizadas

## Consideraciones de Despliegue

1. **Migraciones:** Ejecutar migraciones de Prisma para crear las tablas
2. **Seed:** Considerar datos iniciales para redes sociales
3. **CORS:** Configurar CORS para permitir acceso desde frontend
4. **Cache:** Considerar cache para endpoints públicos de alto tráfico
5. **CDN:** Usar CDN para imágenes de noticias
