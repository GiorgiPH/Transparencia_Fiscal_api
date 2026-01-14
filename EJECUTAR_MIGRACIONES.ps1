# ===========================================
# EJECUTAR MIGRACIONES - TRANSPARENCIA FISCAL
# ===========================================

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "EJECUTAR MIGRACIONES - TRANSPARENCIA FISCAL" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar que SQL Server esté corriendo
Write-Host "Paso 1: Verificar que SQL Server esté corriendo..." -ForegroundColor Yellow
Write-Host "Ejecutando: sqlcmd -S localhost -U sa -P RCRsql2023 -Q 'SELECT 1'" -ForegroundColor Gray
try {
    sqlcmd -S localhost -U sa -P RCRsql2023 -Q "SELECT 1"
    Write-Host "✅ Conexión a SQL Server exitosa" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: No se puede conectar a SQL Server" -ForegroundColor Red
    Write-Host "Verifica que SQL Server esté corriendo en localhost:1433" -ForegroundColor Yellow
    Write-Host "Usuario: sa, Contraseña: RCRsql2023" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}
Write-Host ""

# Paso 2: Crear base de datos si no existe
Write-Host "Paso 2: Crear base de datos si no existe..." -ForegroundColor Yellow
Write-Host "Ejecutando: sqlcmd para crear DB_Transparencia_Fiscal" -ForegroundColor Gray
try {
    sqlcmd -S localhost -U sa -P RCRsql2023 -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DB_Transparencia_Fiscal') CREATE DATABASE DB_Transparencia_Fiscal;"
    Write-Host "✅ Base de datos verificada/creada" -ForegroundColor Green
} catch {
    Write-Host "⚠️ ADVERTENCIA: No se pudo crear la base de datos (puede que ya exista)" -ForegroundColor Yellow
}
Write-Host ""

# Paso 3: Generar cliente Prisma
Write-Host "Paso 3: Generar cliente Prisma..." -ForegroundColor Yellow
Write-Host "Ejecutando: npx prisma generate" -ForegroundColor Gray
try {
    npx prisma generate
    Write-Host "✅ Cliente Prisma generado" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: No se pudo generar el cliente Prisma" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}
Write-Host ""

# Paso 4: Crear migración inicial
Write-Host "Paso 4: Crear migración inicial..." -ForegroundColor Yellow
Write-Host "Ejecutando: npx prisma migrate dev --name init" -ForegroundColor Gray
try {
    npx prisma migrate dev --name init
    Write-Host "✅ Migración creada y aplicada" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: No se pudo crear la migración" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solución: Si ya existe una migración, ejecuta:" -ForegroundColor Yellow
    Write-Host "  npx prisma migrate reset --force" -ForegroundColor Gray
    Write-Host "  npx prisma migrate dev --name init" -ForegroundColor Gray
    Read-Host "Presiona Enter para salir"
    exit 1
}
Write-Host ""

# Paso 5: Ejecutar seed (datos iniciales)
Write-Host "Paso 5: Ejecutar seed (datos iniciales)..." -ForegroundColor Yellow
Write-Host "Ejecutando: npx tsx prisma/seed.ts" -ForegroundColor Gray
try {
    npx tsx prisma/seed.ts
    Write-Host "✅ Seed ejecutado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: No se pudo ejecutar el seed" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}
Write-Host ""

# Paso 6: Verificar migración
Write-Host "Paso 6: Verificar migración..." -ForegroundColor Yellow
Write-Host "Ejecutando: npx prisma db pull" -ForegroundColor Gray
try {
    npx prisma db pull
    Write-Host "✅ Estructura de base de datos verificada" -ForegroundColor Green
} catch {
    Write-Host "⚠️ ADVERTENCIA: No se pudo verificar la estructura" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "✅ MIGRACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Credenciales de acceso:" -ForegroundColor Yellow
Write-Host "  Email: admin@morelos.gob.mx" -ForegroundColor White
Write-Host "  Contraseña: Admin123" -ForegroundColor White
Write-Host "  Rol: ADMIN" -ForegroundColor White
Write-Host ""
Write-Host "Para iniciar la API:" -ForegroundColor Yellow
Write-Host "  npm run start:dev" -ForegroundColor White
Write-Host ""
Write-Host "Para abrir Prisma Studio (interfaz visual):" -ForegroundColor Yellow
Write-Host "  npx prisma studio" -ForegroundColor White
Write-Host ""
Read-Host "Presiona Enter para finalizar"
