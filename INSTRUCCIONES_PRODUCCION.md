# Instrucciones para Ejecutar en Producción

## Problema Identificado
Al ejecutar `npm run start:prod`, la aplicación estaba tomando las variables de entorno de `.env.development` en lugar de `.env.production`.

## Solución Implementada

### 1. Dockerfile Actualizado
Se actualizó el Dockerfile para:
- Usar Node.js 20 consistentemente
- Configurar el puerto correcto (3001 en lugar de 4000)
- Incluir variables de entorno individuales para la base de datos
- Generar el cliente de Prisma durante la construcción
- Ejecutar migraciones automáticamente al iniciar

### 2. Variables de Entorno Individuales
En lugar de usar una sola variable `DATABASE_URL`, ahora se usan variables individuales:
- `DB_HOST`
- `DB_PORT` 
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_ENCRYPT`
- `DB_TRUST_SERVER_CERTIFICATE`

### 3. Configuración para Producción

## Cómo Ejecutar en Producción

### Opción 1: Usando Docker Compose (Recomendado)

1. **Construir la imagen:**
   ```bash
   docker build -t transparencia-fiscal-api:latest .
   ```

2. **Crear archivo .env para producción:**
   ```bash
   cp test.env .env.production
   ```

3. **Ejecutar con Docker Compose:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Opción 2: Ejecutar directamente con Node.js

1. **Configurar variables de entorno:**
   ```bash
   export NODE_ENV=production
   cp test.env .env
   ```

2. **Instalar dependencias y construir:**
   ```bash
   npm ci --only=production
   npx prisma generate
   npm run build
   ```

3. **Ejecutar en producción:**
   ```bash
   node dist/src/main
   ```

### Opción 3: Usando npm scripts

1. **Configurar entorno:**
   ```bash
   export NODE_ENV=production
   cp test.env .env
   ```

2. **Ejecutar:**
   ```bash
   npm run start:prod
   ```

## Verificación

Para verificar que está usando las variables correctas:

1. **Ver logs del contenedor:**
   ```bash
   docker logs transparencia-fiscal-api
   ```

2. **Verificar variables de entorno:**
   ```bash
   # Dentro del contenedor
   docker exec transparencia-fiscal-api printenv | grep NODE_ENV
   docker exec transparencia-fiscal-api printenv | grep DB_
   ```

3. **Probar endpoint de salud:**
   ```bash
   curl http://localhost:3001/health
   ```

## Variables de Entorno Críticas

Asegúrate de que estas variables estén configuradas correctamente:

```bash
# Ambiente
NODE_ENV=production

# Base de Datos (Producción)
DB_HOST=192.168.105.14
DB_PORT=1433
DB_NAME=DB_Transparencia_Fiscal
DB_USER=usuing
DB_PASSWORD=PdJ*2025*7894
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# JWT
JWT_SECRET=e7c4a9b2f6d1a3c8e0f9b7d5c2a4e6f1a9b8c7d6e5f4a3b2c1d0e9f8a7
JWT_EXPIRATION=30m

# CORS
CORS_ORIGIN=https://app.administracionyfinanzas.morelos.gob.mx
```

## Solución al Problema Original

El problema ocurría porque:
1. La aplicación estaba leyendo `.env.development` por defecto
2. El Dockerfile no estaba configurado para usar variables individuales
3. No se estaba forzando el entorno de producción correctamente

Con los cambios realizados:
- El Dockerfile ahora establece `NODE_ENV=production` explícitamente
- Se usan variables individuales en lugar de `DATABASE_URL`
- La construcción incluye todas las dependencias necesarias
- Las migraciones de Prisma se ejecutan automáticamente

## Monitoreo y Mantenimiento

1. **Ver logs:**
   ```bash
   docker logs -f transparencia-fiscal-api
   ```

2. **Reiniciar servicio:**
   ```bash
   docker-compose -f docker-compose.prod.yml restart
   ```

3. **Actualizar imagen:**
   ```bash
   docker-compose -f docker-compose.prod.yml build --no-cache
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Backup de datos:**
   ```bash
   docker cp transparencia-fiscal-api:/app/uploads ./backup-uploads-$(date +%Y%m%d)
