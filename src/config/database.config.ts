import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  // Construir DATABASE_URL a partir de variables individuales si no está definida
  let databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '1433';
    const dbName = process.env.DB_NAME || 'DB_Transparencia_Fiscal';
    const dbUser = process.env.DB_USER || 'sa';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbEncrypt = process.env.DB_ENCRYPT || 'false';
    const dbTrustServerCertificate = process.env.DB_TRUST_SERVER_CERTIFICATE || 'true';
    
    databaseUrl = `sqlserver://${dbHost}:${dbPort};database=${dbName};user=${dbUser};password=${dbPassword};encrypt=${dbEncrypt};trustServerCertificate=${dbTrustServerCertificate}`;
  }
  
  return {
    url: databaseUrl,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  };
});
