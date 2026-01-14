@echo off
echo ===========================================
echo EJECUTAR MIGRACIONES - TRANSPARENCIA FISCAL
echo ===========================================
echo.

echo Paso 1: Verificar que SQL Server esté corriendo...
echo Ejecutando: sqlcmd -S localhost -U sa -P RCRsql2023 -Q "SELECT 1"
sqlcmd -S localhost -U sa -P RCRsql2023 -Q "SELECT 1"
if %errorlevel% neq 0 (
    echo ❌ ERROR: No se puede conectar a SQL Server
    echo Verifica que SQL Server esté corriendo en localhost:1433
    echo Usuario: sa, Contraseña: RCRsql2023
    pause
    exit /b 1
)
echo ✅ Conexión a SQL Server exitosa
echo.

echo Paso 2: Crear base de datos si no existe...
echo Ejecutando: sqlcmd -S localhost -U sa -P RCRsql2023 -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DB_Transparencia_Fiscal') CREATE DATABASE DB_Transparencia_Fiscal;"
sqlcmd -S localhost -U sa -P RCRsql2023 -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DB_Transparencia_Fiscal') CREATE DATABASE DB_Transparencia_Fiscal;"
echo ✅ Base de datos verificada/creada
echo.

echo Paso 3: Generar cliente Prisma...
echo Ejecutando: npx prisma generate
npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ ERROR: No se pudo generar el cliente Prisma
    pause
    exit /b 1
)
echo ✅ Cliente Prisma generado
echo.

echo Paso 4: Crear migración inicial...
echo Ejecutando: npx prisma migrate dev --name init
npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ❌ ERROR: No se pudo crear la migración
    echo.
    echo Solución: Si ya existe una migración, ejecuta:
    echo   npx prisma migrate reset --force
    echo   npx prisma migrate dev --name init
    pause
    exit /b 1
)
echo ✅ Migración creada y aplicada
echo.

echo Paso 5: Ejecutar seed (datos iniciales)...
echo Ejecutando: npx tsx prisma/seed.ts
npx tsx prisma/seed.ts
if %errorlevel% neq 0 (
    echo ❌ ERROR: No se pudo ejecutar el seed
    pause
    exit /b 1
)
echo ✅ Seed ejecutado exitosamente
echo.

echo Paso 6: Verificar migración...
echo Ejecutando: npx prisma db pull
npx prisma db pull
if %errorlevel% neq 0 (
    echo ⚠️ ADVERTENCIA: No se pudo verificar la estructura
) else (
    echo ✅ Estructura de base de datos verificada
)
echo.

echo ===========================================
echo ✅ MIGRACIÓN COMPLETADA EXITOSAMENTE
echo ===========================================
echo.
echo Credenciales de acceso:
echo   Email: admin@morelos.gob.mx
echo   Contraseña: Admin123
echo   Rol: ADMIN
echo.
echo Para iniciar la API:
echo   npm run start:dev
echo.
echo Para abrir Prisma Studio (interfaz visual):
echo   npx prisma studio
echo.
pause
