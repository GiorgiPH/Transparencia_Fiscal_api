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

export default {
  // Ruta al esquema de Prisma (relativa a este archivo)
  schema: './prisma/schema.prisma',
  
  // Configuración del datasource (requerida para migraciones)
  // La URL se lee de la variable de entorno DATABASE_URL
  datasource: {
    url: process.env.DATABASE_URL,
  },
  
  // Configuración de migraciones y seed
  migrations: {
    seed: 'npx ts-node prisma/seed.ts',
  },
};
