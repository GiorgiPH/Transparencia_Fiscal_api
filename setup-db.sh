#!/bin/bash

# Script de Configuración de Base de Datos - Transparencia Fiscal
# Bash Script para Linux/Mac

echo "=========================================="
echo "CONFIGURACIÓN DE BASE DE DATOS"
echo "Transparencia Fiscal API"
echo "=========================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "ERROR: No se encontró package.json"
    echo "Ejecuta este script desde la raíz del proyecto: transparencia-fiscal-api"
    exit 1
fi

# Paso 1: Verificar dependencias
echo "Paso 1: Verificando dependencias..."

dependencies=("node" "npm" "sqlcmd")

for dep in "${dependencies[@]}"; do
    if command -v $dep &> /dev/null; then
        echo "  ✓ $dep encontrado"
    else
        echo "  ✗ $dep NO encontrado"
        if [ "$dep" = "sqlcmd" ]; then
            echo "    Instala SQL Server Tools: https://docs.microsoft.com/en-us/sql/tools/sqlcmd-utility"
        fi
    fi
done

# Paso 2: Configurar variables de entorno
echo -e "\nPaso 2: Configurando variables de entorno..."

envFile=".env"
if [ -f "$envFile" ]; then
    echo "  Archivo .env encontrado"
    
    read -p "¿Quieres editar el archivo .env? (s/n): " edit
    if [[ $edit == "s" || $edit == "S" ]]; then
        ${EDITOR:-nano} "$envFile"
    fi
else
    echo "  Creando archivo .env desde ejemplo..."
    cp ".env.example" ".env" 2>/dev/null
    if [ -f "$envFile" ]; then
        echo "  Archivo .env creado. Por favor edítalo con tus credenciales."
        ${EDITOR:-nano} "$envFile"
    else
        echo "  ERROR: No se pudo crear .env"
    fi
fi

# Paso 3: Verificar conexión a SQL Server (opcional)
echo -e "\nPaso 3: Verificando conexión a SQL Server..."

read -p "¿Quieres probar la conexión a SQL Server? (s/n): " testConnection
if [[ $testConnection == "s" || $testConnection == "S" ]]; then
    read -p "Servidor SQL (por defecto: localhost): " server
    server=${server:-localhost}
    
    read -p "Base de datos (por defecto: transparencia_fiscal_dev): " database
    database=${database:-transparencia_fiscal_dev}
    
    read -p "Usuario (por defecto: sa): " username
    username=${username:-sa}
    
    read -sp "Contraseña: " password
    echo ""
    
    echo "  Probando conexión..."
    if sqlcmd -S "$server" -d "$database" -U "$username" -P "$password" -C -Q "SELECT 1" &> /dev/null; then
        echo "  ✓ Conexión exitosa a SQL Server"
        
        read -p "¿Quieres crear la base de datos '$database'? (s/n): " createDb
        if [[ $createDb == "s" || $createDb == "S" ]]; then
            if sqlcmd -S "$server" -U "$username" -P "$password" -C -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '$database') CREATE DATABASE [$database];" &> /dev/null; then
                echo "  ✓ Base de datos '$database' creada o ya existía"
            else
                echo "  ✗ Error al crear la base de datos"
            fi
        fi
    else
        echo "  ✗ Error de conexión"
        echo "  Verifica:"
        echo "  1. SQL Server está corriendo"
        echo "  2. El puerto 1433 está abierto"
        echo "  3. Las credenciales son correctas"
    fi
fi

# Paso 4: Instalar dependencias y configurar Prisma
echo -e "\nPaso 4: Configurando Prisma y dependencias..."

read -p "¿Instalar dependencias de npm? (s/n): " installDeps
if [[ $installDeps == "s" || $installDeps == "S" ]]; then
    echo "  Instalando dependencias..."
    npm install
fi

echo "  Generando cliente de Prisma..."
npx prisma generate

# Paso 5: Ejecutar migraciones
echo -e "\nPaso 5: Ejecutando migraciones..."

read -p "¿Ejecutar migraciones de base de datos? (s/n): " runMigrations
if [[ $runMigrations == "s" || $runMigrations == "S" ]]; then
    echo "  Creando migración inicial..."
    npx prisma migrate dev --name init
    
    echo "  Verificando estructura..."
    npx prisma db pull
fi

# Paso 6: Poblar datos de prueba
echo -e "\nPaso 6: Poblando datos de prueba..."

read -p "¿Ejecutar script de seed (datos de prueba)? (s/n): " runSeed
if [[ $runSeed == "s" || $runSeed == "S" ]]; then
    echo "  Ejecutando seed..."
    npx tsx prisma/seed.ts
fi

# Paso 7: Verificar instalación
echo -e "\nPaso 7: Verificando instalación..."

echo "  Iniciando Prisma Studio..."
echo "  Abre http://localhost:5555 en tu navegador"
echo "  Presiona Ctrl+C para detener Prisma Studio"

read -p "¿Abrir Prisma Studio? (s/n): " openStudio
if [[ $openStudio == "s" || $openStudio == "S" ]]; then
    # Intentar abrir el navegador
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:5555" &
    elif command -v open &> /dev/null; then
        open "http://localhost:5555" &
    fi
    npx prisma studio
fi

echo -e "\n=========================================="
echo "CONFIGURACIÓN COMPLETADA"
echo "=========================================="
echo -e "\nResumen:"
echo "1. Base de datos configurada"
echo "2. Migraciones aplicadas"
echo "3. Datos de prueba cargados"
echo -e "\nPróximos pasos:"
echo "1. Inicia la API: npm run start:dev"
echo "2. Accede a Swagger: http://localhost:3001/api"
echo "3. Configura el frontend: transparencia-fiscal-publico"
echo -e "\nPara producción:"
echo "1. Crea archivo .env.production"
echo "2. Configura variables seguras"
echo "3. Ejecuta: npm run build && npm run start:prod"
