/**
 * Configuración de Prisma para el proyecto Transparencia Fiscal
 * 
 * Este archivo configura la ubicación del esquema de Prisma
 * y la conexión a la base de datos para Prisma 7.
 */

// Cargar variables de entorno desde .env antes de que Prisma las lea
import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar .env desde el directorio del proyecto
config({ path: resolve(process.cwd(), '.env') });

// Construir DATABASE_URL a partir de variables individuales si no existe
function buildDatabaseUrl(): string {
  // Si DATABASE_URL ya está definida, usarla
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Construir URL a partir de variables individuales
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '1433';
  const dbName = process.env.DB_NAME || 'DB_Transparencia_Fiscal';
  const dbUser = process.env.DB_USER || 'sa';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbEncrypt = process.env.DB_ENCRYPT || 'false';
  const dbTrustServerCertificate = process.env.DB_TRUST_SERVER_CERTIFICATE || 'true';

  return `sqlserver://${dbHost}:${dbPort};database=${dbName};user=${dbUser};password=${dbPassword};encrypt=${dbEncrypt};trustServerCertificate=${dbTrustServerCertificate}`;
}

export default {
  // Ruta al esquema de Prisma (relativa a este archivo)
  schema: './prisma/schema.prisma',
  
  // Configuración del datasource (requerida para migraciones)
  // La URL se construye a partir de variables individuales
  datasource: {
    url: buildDatabaseUrl(),
  },
  
  // Configuración de migraciones y seed
  migrations: {
    seed: 'npx ts-node prisma/seed.ts',
  },
};
