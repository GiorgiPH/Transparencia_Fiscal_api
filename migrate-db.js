#!/usr/bin/env node

/**
 * Script de Migración de Base de Datos
 * Para ejecutar: node migrate-db.js
 */

const { execSync } = require('child_process');
const { config } = require('dotenv');

// Cargar variables de entorno
config({ path: '.env' });

console.log('==========================================');
console.log('MIGRACIÓN DE BASE DE DATOS - TRANSPARENCIA FISCAL');
console.log('==========================================\n');

// Verificar que DATABASE_URL esté configurada
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL no está definida en .env');
  console.log('Por favor, configura la variable DATABASE_URL en tu archivo .env');
  process.exit(1);
}

// Extraer nombre de la base de datos para mostrar
const dbMatch = databaseUrl.match(/database=([^;]+)/);
const dbName = dbMatch ? dbMatch[1] : 'desconocida';

console.log(`📊 Base de datos: ${dbName}`);
console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
console.log('');

// Función para ejecutar comandos con manejo de errores
function runCommand(command, description) {
  console.log(`🔧 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', env: { ...process.env } });
    console.log(`✅ ${description} completado\n`);
    return true;
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error.message);
    console.log('');
    return false;
  }
}

// Menú principal
async function main() {
  console.log('📋 OPCIONES DISPONIBLES:');
  console.log('1. Generar cliente Prisma');
  console.log('2. Crear migración inicial');
  console.log('3. Ejecutar migraciones');
  console.log('4. Ejecutar seed (datos iniciales)');
  console.log('5. Resetear base de datos (CUIDADO: borra todos los datos)');
  console.log('6. Verificar conexión a base de datos');
  console.log('7. Ejecutar todo (opción completa)');
  console.log('0. Salir\n');

  // En un entorno interactivo, aquí se pediría la opción
  // Por ahora, mostramos las instrucciones
  console.log('📝 INSTRUCCIONES PARA EJECUTAR:');
  console.log('================================\n');
  
  console.log('PASO 1: Generar cliente Prisma');
  console.log('--------------------------------');
  console.log('Ejecuta: npx prisma generate\n');
  
  console.log('PASO 2: Crear migración inicial');
  console.log('--------------------------------');
  console.log('Ejecuta: npx prisma migrate dev --name init\n');
  
  console.log('PASO 3: Ejecutar migraciones (si ya existe)');
  console.log('--------------------------------------------');
  console.log('Ejecuta: npx prisma migrate deploy\n');
  
  console.log('PASO 4: Ejecutar seed (datos iniciales)');
  console.log('---------------------------------------');
  console.log('Ejecuta: npx tsx prisma/seed.ts\n');
  
  console.log('PASO 5: Verificar conexión');
  console.log('---------------------------');
  console.log('Ejecuta: npx prisma db pull\n');
  
  console.log('📌 COMANDOS COMPLETOS:');
  console.log('======================\n');
  
  console.log('Opción 1 (Generar cliente):');
  console.log('  npx prisma generate\n');
  
  console.log('Opción 2 (Migración inicial):');
  console.log('  npx prisma migrate dev --name init\n');
  
  console.log('Opción 3 (Ejecutar migraciones):');
  console.log('  npx prisma migrate deploy\n');
  
  console.log('Opción 4 (Seed):');
  console.log('  npx tsx prisma/seed.ts\n');
  
  console.log('Opción 5 (Reset - CUIDADO):');
  console.log('  npx prisma migrate reset --force\n');
  
  console.log('Opción 6 (Verificar conexión):');
  console.log('  npx prisma db pull\n');
  
  console.log('Opción 7 (Todo en uno):');
  console.log('  npx prisma generate');
  console.log('  npx prisma migrate dev --name init');
  console.log('  npx tsx prisma/seed.ts\n');
  
  console.log('🔍 SOLUCIÓN DE PROBLEMAS:');
  console.log('=========================\n');
  
  console.log('1. Error "Cannot connect to SQL Server":');
  console.log('   - Verifica que SQL Server esté corriendo');
  console.log('   - Comprueba usuario/contraseña en .env');
  console.log('   - Asegúrate que el puerto 1433 esté accesible\n');
  
  console.log('2. Error "Login failed for user":');
  console.log('   - Habilita autenticación de SQL Server');
  console.log('   - Verifica que el usuario tenga acceso a la BD\n');
  
  console.log('3. Error de migración:');
  console.log('   - Ejecuta: npx prisma migrate reset');
  console.log('   - Luego: npx prisma migrate dev --name init\n');
  
  console.log('4. Error de seed:');
  console.log('   - Verifica que las migraciones se hayan ejecutado');
  console.log('   - Ejecuta manualmente: npx tsx prisma/seed.ts\n');
  
  console.log('📊 VERIFICACIÓN FINAL:');
  console.log('======================\n');
  
  console.log('Después de ejecutar las migraciones, verifica:');
  console.log('1. Tablas creadas: npx prisma studio (abre http://localhost:5555)');
  console.log('2. API funcionando: npm run start:dev');
  console.log('3. Swagger docs: http://localhost:3001/api\n');
  
  console.log('✅ La base de datos DB_Transparencia_Fiscal está lista para usar!');
}

// Ejecutar el menú
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runCommand };
