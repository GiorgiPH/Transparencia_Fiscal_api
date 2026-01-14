# Script de Configuración de Base de Datos - Transparencia Fiscal
# PowerShell Script para Windows

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CONFIGURACIÓN DE BASE DE DATOS" -ForegroundColor Cyan
Write-Host "Transparencia Fiscal API" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: No se encontró package.json" -ForegroundColor Red
    Write-Host "Ejecuta este script desde la raíz del proyecto: transparencia-fiscal-api" -ForegroundColor Yellow
    exit 1
}

# Paso 1: Verificar dependencias
Write-Host "Paso 1: Verificando dependencias..." -ForegroundColor Green

$dependencies = @("node", "npm", "sqlcmd")

foreach ($dep in $dependencies) {
    $path = Get-Command $dep -ErrorAction SilentlyContinue
    if ($path) {
        Write-Host "  ✓ $dep encontrado" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $dep NO encontrado" -ForegroundColor Red
        if ($dep -eq "sqlcmd") {
            Write-Host "    Instala SQL Server Tools: https://docs.microsoft.com/en-us/sql/tools/sqlcmd-utility" -ForegroundColor Yellow
        }
    }
}

# Paso 2: Configurar variables de entorno
Write-Host "`nPaso 2: Configurando variables de entorno..." -ForegroundColor Green

$envFile = ".env"
if (Test-Path $envFile) {
    Write-Host "  Archivo .env encontrado" -ForegroundColor Green
    
    # Preguntar si quiere editar el archivo
    $edit = Read-Host "¿Quieres editar el archivo .env? (s/n)"
    if ($edit -eq "s" -or $edit -eq "S") {
        notepad $envFile
    }
} else {
    Write-Host "  Creando archivo .env desde ejemplo..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env" -ErrorAction SilentlyContinue
    if (Test-Path $envFile) {
        Write-Host "  Archivo .env creado. Por favor edítalo con tus credenciales." -ForegroundColor Yellow
        notepad $envFile
    } else {
        Write-Host "  ERROR: No se pudo crear .env" -ForegroundColor Red
    }
}

# Paso 3: Verificar conexión a SQL Server
Write-Host "`nPaso 3: Verificando conexión a SQL Server..." -ForegroundColor Green

$testConnection = Read-Host "¿Quieres probar la conexión a SQL Server? (s/n)"
if ($testConnection -eq "s" -or $testConnection -eq "S") {
    $server = Read-Host "Servidor SQL (por defecto: localhost)"
    if ([string]::IsNullOrEmpty($server)) { $server = "localhost" }
    
    $database = Read-Host "Base de datos (por defecto: transparencia_fiscal_dev)"
    if ([string]::IsNullOrEmpty($database)) { $database = "transparencia_fiscal_dev" }
    
    $username = Read-Host "Usuario (por defecto: sa)"
    if ([string]::IsNullOrEmpty($username)) { $username = "sa" }
    
    $password = Read-Host "Contraseña" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    Write-Host "  Probando conexión..." -ForegroundColor Yellow
    try {
        $connectionString = "Server=$server;Database=$database;User Id=$username;Password=$plainPassword;TrustServerCertificate=True;"
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $connection.Open()
        Write-Host "  ✓ Conexión exitosa a SQL Server" -ForegroundColor Green
        $connection.Close()
        
        # Preguntar si quiere crear la base de datos
        $createDb = Read-Host "¿Quieres crear la base de datos '$database'? (s/n)"
        if ($createDb -eq "s" -or $createDb -eq "S") {
            $masterConnectionString = "Server=$server;Database=master;User Id=$username;Password=$plainPassword;TrustServerCertificate=True;"
            $masterConnection = New-Object System.Data.SqlClient.SqlConnection($masterConnectionString)
            $masterConnection.Open()
            
            $command = $masterConnection.CreateCommand()
            $command.CommandText = "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '$database') CREATE DATABASE [$database];"
            $command.ExecuteNonQuery()
            
            Write-Host "  ✓ Base de datos '$database' creada o ya existía" -ForegroundColor Green
            $masterConnection.Close()
        }
    } catch {
        Write-Host "  ✗ Error de conexión: $_" -ForegroundColor Red
        Write-Host "  Verifica:" -ForegroundColor Yellow
        Write-Host "  1. SQL Server está corriendo" -ForegroundColor Yellow
        Write-Host "  2. El puerto 1433 está abierto" -ForegroundColor Yellow
        Write-Host "  3. Las credenciales son correctas" -ForegroundColor Yellow
    }
}

# Paso 4: Instalar dependencias y configurar Prisma
Write-Host "`nPaso 4: Configurando Prisma y dependencias..." -ForegroundColor Green

$installDeps = Read-Host "¿Instalar dependencias de npm? (s/n)"
if ($installDeps -eq "s" -or $installDeps -eq "S") {
    Write-Host "  Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

Write-Host "  Generando cliente de Prisma..." -ForegroundColor Yellow
npx prisma generate

# Paso 5: Ejecutar migraciones
Write-Host "`nPaso 5: Ejecutando migraciones..." -ForegroundColor Green

$runMigrations = Read-Host "¿Ejecutar migraciones de base de datos? (s/n)"
if ($runMigrations -eq "s" -or $runMigrations -eq "S") {
    Write-Host "  Creando migración inicial..." -ForegroundColor Yellow
    npx prisma migrate dev --name init
    
    Write-Host "  Verificando estructura..." -ForegroundColor Yellow
    npx prisma db pull
}

# Paso 6: Poblar datos de prueba
Write-Host "`nPaso 6: Poblando datos de prueba..." -ForegroundColor Green

$runSeed = Read-Host "¿Ejecutar script de seed (datos de prueba)? (s/n)"
if ($runSeed -eq "s" -or $runSeed -eq "S") {
    Write-Host "  Ejecutando seed..." -ForegroundColor Yellow
    npx tsx prisma/seed.ts
}

# Paso 7: Verificar instalación
Write-Host "`nPaso 7: Verificando instalación..." -ForegroundColor Green

Write-Host "  Iniciando Prisma Studio..." -ForegroundColor Yellow
Write-Host "  Abre http://localhost:5555 en tu navegador" -ForegroundColor Cyan
Write-Host "  Presiona Ctrl+C para detener Prisma Studio" -ForegroundColor Yellow

$openStudio = Read-Host "¿Abrir Prisma Studio? (s/n)"
if ($openStudio -eq "s" -or $openStudio -eq "S") {
    Start-Process "http://localhost:5555"
    npx prisma studio
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "CONFIGURACIÓN COMPLETADA" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "`nResumen:" -ForegroundColor Green
Write-Host "1. Base de datos configurada" -ForegroundColor White
Write-Host "2. Migraciones aplicadas" -ForegroundColor White
Write-Host "3. Datos de prueba cargados" -ForegroundColor White
Write-Host "`nPróximos pasos:" -ForegroundColor Yellow
Write-Host "1. Inicia la API: npm run start:dev" -ForegroundColor White
Write-Host "2. Accede a Swagger: http://localhost:3001/api" -ForegroundColor White
Write-Host "3. Configura el frontend: transparencia-fiscal-publico" -ForegroundColor White
Write-Host "`nPara producción:" -ForegroundColor Red
Write-Host "1. Crea archivo .env.production" -ForegroundColor White
Write-Host "2. Configura variables seguras" -ForegroundColor White
Write-Host "3. Ejecuta: npm run build && npm run start:prod" -ForegroundColor White
