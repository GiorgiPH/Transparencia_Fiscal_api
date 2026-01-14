# Implementación del Módulo de Búsqueda de Datos y Documentos (Portal Público)

## Descripción
Este módulo permite a los ciudadanos buscar, filtrar y descargar documentos de transparencia fiscal de forma clara, rápida y precisa. Utiliza múltiples criterios de búsqueda basados en los catálogos definidos en el Modelo Temático de Transparencia Fiscal (MTTF) y consume directamente la estructura y documentos administrados en el Módulo de Catálogos.

## Características Principales

### Funcionalidades para el Ciudadano
- **Búsqueda por texto libre**: En nombre y descripción de documentos
- **Filtros avanzados**:
  - Año / ejercicio fiscal
  - Categoría del MTTF (multiselección)
  - Periodicidad (Mensual, Trimestral, Semestral, Anual)
  - Tipo / extensión de archivo (PDF, XLSX, CSV, etc.)
  - Institución emisora
- **Visualización de resultados**:
  - Tabla paginada con ordenamiento por columnas
  - Metadatos de paginación
  - Información del catálogo asociado
- **Descarga de documentos**:
  - Descarga directa desde servidor
  - Validación de documentos activos
  - Registro opcional de eventos de descarga

### Seguridad y Acceso
- **100% público**: No requiere autenticación
- **Solo lectura**: Consulta de documentos publicados
- **Filtrado automático**: Solo documentos activos y publicados

## Estructura del Módulo

```
src/modules/public/busqueda-documentos/
├── dto/
│   └── buscar-documentos.dto.ts          # DTO para parámetros de búsqueda
├── busqueda-documentos.controller.ts     # Controlador con endpoints públicos
├── busqueda-documentos.service.ts        # Lógica de negocio y búsqueda
└── busqueda-documentos.module.ts         # Módulo NestJS
```

## Endpoints Públicos

### 1. Búsqueda de Documentos
```
GET /api/busqueda-documentos
```
**Parámetros de consulta:**
- `search`: Término de búsqueda en nombre/descripción (mínimo 2 caracteres)
- `catalogoId`: ID del catálogo para filtrar
- `anio`: Año del ejercicio fiscal (2000-2100)
- `extension`: Extensión del archivo (pdf, xlsx, csv, etc.)
- `periodicidad`: Periodicidad del documento (mensual, trimestral, semestral, anual)
- `institucion`: Institución emisora
- `categorias[]`: IDs de categorías para filtro múltiple
- `page`: Número de página (default: 1)
- `pageSize`: Tamaño de página (default: 20, max: 100)
- `orderBy`: Campo para ordenar (nombre, fecha_publicacion, ejercicio_fiscal, fecha_creacion)
- `order`: Dirección del ordenamiento (asc, desc)

**Respuesta:**
```json
{
  "documentos": [
    {
      "id": "uuid",
      "nombre": "Presupuesto 2025",
      "descripcion": "Presupuesto anual del estado",
      "ejercicio_fiscal": 2025,
      "extension": "pdf",
      "ruta_archivo": "/documentos/presupuesto-2025.pdf",
      "fecha_publicacion": "2025-01-15T00:00:00.000Z",
      "institucion_emisora": "Secretaría de Finanzas",
      "catalogo": {
        "id": "catalogo-uuid",
        "nombre": "Presupuesto",
        "descripcion": "Documentos presupuestarios",
        "nivel": 1
      }
    }
  ],
  "paginacion": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2. Filtros Disponibles
```
GET /api/busqueda-documentos/filtros
```
**Respuesta:**
```json
{
  "años": [2025, 2024, 2023, 2022],
  "extensiones": ["pdf", "xlsx", "csv", "docx"],
  "instituciones": ["Secretaría de Finanzas", "Tesorería General", "Contraloría"],
  "categorias": [
    {
      "id": "cat-1",
      "nombre": "Finanzas Públicas",
      "descripcion": "Documentos financieros",
      "nivel": 0,
      "orden": 1,
      "children": [...]
    }
  ]
}
```

### 3. Documentos Recientes
```
GET /api/busqueda-documentos/recientes?limit=10
```

### 4. Estadísticas
```
GET /api/busqueda-documentos/estadisticas
```

### 5. Detalle de Documento
```
GET /api/busqueda-documentos/:id
```

### 6. Registrar Descarga (Opcional)
```
GET /api/busqueda-documentos/:id/descargar
```

## Integración con Módulos Existentes

### Dependencias
1. **Módulo de Catálogos**: Proporciona la estructura jerárquica de categorías
2. **Módulo de Documentos**: Proporciona los documentos y metadatos
3. **Prisma ORM**: Acceso a base de datos

### Reutilización de Componentes
- **DocumentosRepository**: Acceso a datos de documentos
- **CatalogosRepository**: Acceso a datos de catálogos
- **TransformInterceptor**: Respuestas API estandarizadas
- **Public Decorator**: Marca endpoints como públicos

## Optimizaciones de Rendimiento

### Índices de Base de Datos
```prisma
// Índices recomendados en el modelo Documento
model Documento {
  // ... campos existentes
  
  @@index([activo, estatus])
  @@index([ejercicio_fiscal])
  @@index([extension])
  @@index([catalogo_id])
  @@index([nombre])
  @@index([fecha_publicacion])
}
```

### Consultas Optimizadas
- **Paginación eficiente**: Uso de `skip` y `take` de Prisma
- **Filtros combinados**: Construcción dinámica de condiciones WHERE
- **Carga eager**: Inclusión de relaciones necesarias (catálogo)
- **Distinct values**: Obtención eficiente de valores únicos para filtros

## Validaciones

### DTO de Búsqueda
- `search`: Mínimo 2 caracteres
- `anio`: Rango 2000-2100
- `extension`: Validación de formato
- `periodicidad`: Valores permitidos (mensual, trimestral, semestral, anual)
- `page`: Mínimo 1
- `pageSize`: Rango 1-100
- `orderBy`: Campos permitidos
- `order`: Direcciones permitidas

### Seguridad de Datos
- Solo documentos con `activo = true`
- Validación de existencia y acceso público
- Sanitización de parámetros de búsqueda

## Consideraciones de Implementación

### Frontend (Next.js)
```typescript
// Ejemplo de consumo desde frontend
const { data: documentos } = useQuery({
  queryKey: ['documentos', filtros],
  queryFn: () => apiClient.get('/busqueda-documentos', { params: filtros }),
});

// Componente de filtros
<FilterPanel
  años={filtrosDisponibles.años}
  extensiones={filtrosDisponibles.extensiones}
  categorias={filtrosDisponibles.categorias}
  onFilterChange={setFiltros}
/>
```

### Mejoras Futuras
1. **Búsqueda full-text**: Implementar búsqueda avanzada con PostgreSQL
2. **Cache de resultados**: Cachear resultados frecuentes
3. **Sugerencias de búsqueda**: Autocompletado basado en términos comunes
4. **Exportación de resultados**: Exportar a CSV/Excel
5. **Búsqueda por metadatos**: Búsqueda en contenido de documentos (OCR)

## Pruebas Recomendadas

### Pruebas de Integración
1. **Búsqueda básica**: Verificar resultados con término de búsqueda
2. **Filtros combinados**: Probar múltiples filtros simultáneos
3. **Paginación**: Verificar navegación entre páginas
4. **Ordenamiento**: Probar diferentes criterios de orden
5. **Documentos inactivos**: Verificar que no sean accesibles

### Pruebas de Rendimiento
1. **Carga con muchos documentos**: Performance con 10,000+ registros
2. **Filtros complejos**: Tiempo de respuesta con múltiples condiciones
3. **Concurrencia**: Múltiples usuarios simultáneos

## Configuración

El módulo se integra automáticamente al importar `BusquedaDocumentosModule` en `PublicModule`.

## Dependencias
- NestJS Framework
- Prisma ORM
- class-validator para validaciones
- Swagger para documentación API
- Módulos existentes: Catálogos y Documentos

## Consideraciones de Despliegue

1. **Índices de BD**: Asegurar índices en campos de búsqueda
2. **Cache**: Considerar Redis para cache de filtros frecuentes
3. **CDN**: Usar CDN para documentos estáticos
4. **Monitoring**: Monitorear tiempos de respuesta de búsquedas
5. **Backup**: Backup regular de documentos y metadatos
