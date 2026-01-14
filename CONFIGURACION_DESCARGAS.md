# Configuración de Descargas de Documentos

## Configuración de Rutas Relativas

El servicio de descarga de documentos ahora soporta rutas relativas basadas en una variable de entorno. Esto evita conflictos entre diferentes servidores y entornos.

### 1. Configurar variable de entorno

En tu archivo `.env` (crea uno si no existe), agrega:

```env
# Storage Configuration
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="52428800" # 50MB
ALLOWED_EXTENSIONS="pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,json,xml,zip,rar,7z"
AUTO_CREATE_DIRECTORIES="true"
```

### 2. Crear directorio de uploads

```bash
# Desde el directorio transparencia-fiscal-api
mkdir -p uploads
```

### 3. Rutas soportadas en la base de datos

Ahora puedes usar cualquiera de estos formatos en el campo `ruta_archivo`:

#### Opción A: Ruta relativa desde UPLOAD_DIR (RECOMENDADA)
```
./uploads/documento-prueba.pdf
documento-prueba.pdf  # Se asume que está en UPLOAD_DIR
```

#### Opción B: Ruta absoluta (para compatibilidad)
```
C:\Users\jorge\Documents\Transparencia-Fiscal\transparencia-fiscal-api\uploads\documento-prueba.pdf
```

### 4. Ejemplo de INSERT para pruebas

```sql
-- Usando ruta relativa (RECOMENDADO)
INSERT INTO documentos (
  nombre, 
  ruta_archivo, 
  extension, 
  catalogo_id, 
  tipo_documento_id, 
  ejercicio_fiscal, 
  activo
) VALUES (
  'Documento de Prueba',
  './uploads/documento-prueba.pdf',  -- Ruta relativa
  'pdf',
  1,  -- ID de catálogo existente
  1,  -- ID de tipo de documento existente
  2025,
  true
);

-- O usando solo el nombre del archivo (si está directamente en UPLOAD_DIR)
INSERT INTO documentos (...) VALUES (
  'Otro Documento',
  'otro-documento.docx',  -- Solo nombre de archivo
  'docx',
  1,
  1,
  2025,
  true
);
```

### 5. Para diferentes entornos

#### Desarrollo local:
```env
UPLOAD_DIR="./uploads"
```

#### Producción (Linux server):
```env
UPLOAD_DIR="/var/www/uploads/transparencia-fiscal"
```

#### Producción (Windows server):
```env
UPLOAD_DIR="D:\\uploads\\transparencia-fiscal"
```

### 6. Endpoints disponibles

#### Para descargar (attachment):
```
GET http://localhost:3000/busqueda-documentos/{id}/descargar
```
- Envía el archivo como adjunto (`Content-Disposition: attachment`)
- El navegador mostrará el diálogo de descarga

#### Para visualizar (inline):
```
GET http://localhost:3000/busqueda-documentos/{id}/visualizar
```
- Muestra el archivo directamente en el navegador (`Content-Disposition: inline`)
- Ideal para PDFs, imágenes, documentos que se pueden ver en el navegador

#### Para obtener información del documento:
```
GET http://localhost:3000/busqueda-documentos/{id}
```
- Devuelve los metadatos del documento (JSON)
- No incluye el archivo en sí

### 7. Probar los endpoints

### 8. Ventajas de usar rutas relativas

1. **Portabilidad**: El mismo código funciona en diferentes servidores
2. **Seguridad**: No expone rutas absolutas del sistema
3. **Flexibilidad**: Cambia la ubicación de archivos solo modificando `UPLOAD_DIR`
4. **Compatibilidad**: Sigue soportando rutas absolutas para migraciones

### 9. Notas importantes

- El servicio `FileDownloadService` resuelve automáticamente las rutas
- Si la ruta es absoluta, se usa directamente
- Si la ruta es relativa (comienza con `./`, `../` o solo nombre de archivo), se resuelve desde `UPLOAD_DIR`
- Los errores 404 ahora se manejan correctamente con `NotFoundException`
- La estructura de respuesta anidada incorrecta ha sido corregida
