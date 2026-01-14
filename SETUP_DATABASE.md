# Configuración de Base de Datos - Transparencia Fiscal API

Esta guía te ayudará a configurar la base de datos SQL Server para el proyecto de Transparencia Fiscal.

## Requisitos Previos

1. **SQL Server 2019+** instalado y corriendo
2. **SQL Server Management Studio (SSMS)** o Azure Data Studio
3. **Node.js 18+** y **npm** instalados
4. **Prisma CLI** instalado globalmente o localmente

## Paso 1: Configurar SQL Server

### Opción A: SQL Server Local (Recomendado para desarrollo)

1. Asegúrate que SQL Server esté corriendo:
   - Servicio: `SQL Server (MSSQLSERVER)`
   - Puerto: `1433` (por defecto)

2. Conéctate con SSMS usando autenticación de Windows o SQL Server.

3. Crea la base de datos para desarrollo:
   ```sql
   CREATE DATABASE transparencia_fiscal_dev;
   GO
   ```

4. Verifica que el usuario `sa` tenga permisos o crea un usuario específico:
   ```sql
   -- Si usas autenticación de SQL Server
   CREATE LOGIN transparencia_user WITH PASSWORD = 'TuContraseñaSegura123';
   GO
   
   USE transparencia_fiscal_dev;
   GO
   
   CREATE USER transparencia_user FOR LOGIN transparencia_user;
   GO
   
   -- Otorgar permisos
   EXEC sp_addrolemember 'db_owner', 'transparencia_user';
   GO
   ```

### Opción B: Docker (Alternativa para desarrollo)

Si no tienes SQL Server instalado, puedes usar Docker:

```bash
# Ejecutar SQL Server en Docker
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=TuContraseñaSegura123" \
   -p 1433:1433 --name sqlserver-transparencia \
   -d mcr.microsoft.com/mssql/server:2022-latest

# Verificar que esté corriendo
docker ps
```

## Paso 2: Configurar Variables de Entorno

1. Edita el archivo `.env` en la raíz del proyecto:
   ```bash
   cd transparencia-fiscal-api
   nano .env  # o usa tu editor favorito
   ```

2. Actualiza la variable `DATABASE_URL` con tus credenciales:
   ```env
   # Para autenticación de SQL Server (usuario/contraseña)
   DATABASE_URL="sqlserver://localhost:1433;database=transparencia_fiscal_dev;user=sa;password=TuContraseña;trustServerCertificate=true"
   
   # Para autenticación de Windows (Trusted Connection)
   # DATABASE_URL="sqlserver://localhost:1433;database=transparencia_fiscal_dev;trusted_connection=true;trustServerCertificate=true"
   ```

## Paso 3: Ejecutar Migraciones de Prisma

1. Genera el cliente de Prisma:
   ```bash
   npx prisma generate
   ```

2. Crea y aplica la migración inicial:
   ```bash
   npx prisma migrate dev --name init
   ```

3. Verifica que las tablas se hayan creado:
   ```bash
   npx prisma db pull
   ```

## Paso 4: Poblar la Base de Datos con Datos de Prueba

1. Ejecuta el script de seed:
   ```bash
   npx tsx prisma/seed.ts
   ```

2. Verifica los datos en la base de datos:
   ```bash
   npx prisma studio
   ```
   Esto abrirá una interfaz web en `http://localhost:5555` para explorar los datos.

## Paso 5: Configurar Ambiente de Producción

### Base de Datos de Producción

1. Crea la base de datos de producción:
   ```sql
   CREATE DATABASE transparencia_fiscal_prod;
   GO
   ```

2. Crea un usuario con permisos restringidos (seguridad en producción):
   ```sql
   CREATE LOGIN transparencia_prod WITH PASSWORD = 'ContraseñaMuySegura456!';
   GO
   
   USE transparencia_fiscal_prod;
   GO
   
   CREATE USER transparencia_prod FOR LOGIN transparencia_prod;
   GO
   
   -- Permisos mínimos necesarios
   EXEC sp_addrolemember 'db_datareader', 'transparencia_prod';
   EXEC sp_addrolemember 'db_datawriter', 'transparencia_prod';
   EXEC sp_addrolemember 'db_ddladmin', 'transparencia_prod';
   GO
   ```

### Variables de Entorno de Producción

Crea un archivo `.env.production` o configura variables de entorno en tu servidor:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL="sqlserver://servidor-prod:1433;database=transparencia_fiscal_prod;user=transparencia_prod;password=ContraseñaMuySegura456!;trustServerCertificate=true"
JWT_SECRET=TuSecretMuySeguroParaProduccionCambiar123
CORS_ORIGIN=https://portal.morelos.gob.mx
```

## Paso 6: Desplegar Migraciones a Producción

1. Genera el SQL de migración:
   ```bash
   npx prisma migrate diff \
     --from-local-datasource \
     --to-url "sqlserver://servidor-prod:1433;database=transparencia_fiscal_prod;user=transparencia_prod;password=ContraseñaMuySegura456!;trustServerCertificate=true" \
     --script > migration.sql
   ```

2. Revisa y aplica el script manualmente en producción.

O usa el comando directo (si tienes acceso):
   ```bash
   npx prisma migrate deploy
   ```

## Solución de Problemas Comunes

### Error: "Cannot connect to SQL Server"
1. Verifica que SQL Server esté corriendo:
   ```bash
   # Windows
   services.msc
   
   # Linux/Mac con Docker
   docker ps
   ```

2. Verifica el puerto:
   ```bash
   telnet localhost 1433
   ```

3. Verifica credenciales en `.env`

### Error: "Login failed for user"
1. Verifica usuario y contraseña
2. Asegúrate que la autenticación de SQL Server esté habilitada
3. Verifica que el usuario tenga acceso a la base de datos

### Error: "Database does not exist"
1. Crea la base de datos manualmente:
   ```sql
   CREATE DATABASE transparencia_fiscal_dev;
   ```

### Error con trustServerCertificate
Agrega `trustServerCertificate=true` a la cadena de conexión.

## Estructura de la Base de Datos

### Tablas Principales
1. **users** - Usuarios del sistema
2. **roles** - Roles de usuario (ADMIN, CARGA, EDICION)
3. **permisos** - Permisos del sistema
4. **catalogos** - Catálogos jerárquicos del MTTF
5. **documentos** - Documentos de transparencia fiscal
6. **mensajes_participacion_ciudadana** - Mensajes del portal público
7. **noticias** - Noticias y comunicados
8. **redes_sociales** - Redes sociales oficiales

### Índices Recomendados para Producción
```sql
-- Índices para búsqueda de documentos
CREATE INDEX idx_documentos_activo ON documentos(activo);
CREATE INDEX idx_documentos_ejercicio ON documentos(ejercicio_fiscal);
CREATE INDEX idx_documentos_catalogo ON documentos(catalogo_id);
CREATE INDEX idx_documentos_nombre ON documentos(nombre);
CREATE INDEX idx_documentos_fecha_publicacion ON documentos(fecha_publicacion);

-- Índices para usuarios
CREATE INDEX idx_users_email ON users(login);
CREATE INDEX idx_users_activo ON users(activo);

-- Índices para catálogos
CREATE INDEX idx_catalogos_parent ON catalogos(parent_id);
CREATE INDEX idx_catalogos_nivel ON catalogos(nivel);
CREATE INDEX idx_catalogos_activo ON catalogos(activo);
```

## Backup y Restauración

### Backup Manual
```sql
-- Backup completo
BACKUP DATABASE transparencia_fiscal_dev
TO DISK = 'C:\Backups\transparencia_fiscal_dev.bak'
WITH FORMAT, COMPRESSION;

-- Backup diferencial
BACKUP DATABASE transparencia_fiscal_dev
TO DISK = 'C:\Backups\transparencia_fiscal_dev_diff.bak'
WITH DIFFERENTIAL, COMPRESSION;
```

### Restauración
```sql
RESTORE DATABASE transparencia_fiscal_dev
FROM DISK = 'C:\Backups\transparencia_fiscal_dev.bak'
WITH REPLACE, RECOVERY;
```

## Monitoreo y Mantenimiento

### Consultas Útiles
```sql
-- Espacio usado por tablas
EXEC sp_spaceused;

-- Conexiones activas
SELECT * FROM sys.dm_exec_sessions;

-- Consultas lentas
SELECT TOP 10 * FROM sys.dm_exec_query_stats
ORDER BY total_worker_time DESC;
```

### Mantenimiento Programado
Configura jobs de mantenimiento para:
- Backup diario
- Reorganización de índices semanal
- Actualización de estadísticas
- Limpieza de logs antiguos

## Seguridad

### Recomendaciones de Seguridad
1. **Nunca** uses `sa` en producción
2. Usa contraseñas fuertes y rota regularmente
3. Limita acceso por IP en producción
4. Habilita encriptación de conexiones
5. Implementa auditoría de acceso
6. Realiza backups regulares y prueba restauraciones

### Auditoría
```sql
-- Habilitar auditoría
CREATE SERVER AUDIT TransparenciaAudit
TO FILE (FILEPATH = 'C:\Audits\')
WITH (ON_FAILURE = CONTINUE);
GO

ALTER SERVER AUDIT TransparenciaAudit
WITH (STATE = ON);
GO
```

## Soporte

Si encuentras problemas:
1. Revisa los logs de Prisma: `npx prisma --debug`
2. Verifica conexión manual con `sqlcmd` o SSMS
3. Revisa el archivo `prisma/migrations/` para migraciones fallidas
4. Consulta la documentación de Prisma: https://www.prisma.io/docs

## Recursos Adicionales

- [Documentación de Prisma con SQL Server](https://www.prisma.io/docs/orm/overview/databases/sql-server)
- [SQL Server Documentation](https://docs.microsoft.com/en-us/sql/sql-server/)
- [Guía de Seguridad de SQL Server](https://docs.microsoft.com/en-us/sql/relational-databases/security/)
