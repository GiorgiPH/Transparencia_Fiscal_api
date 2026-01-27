import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRATION: string;

  @IsString()
  CORS_ORIGIN: string;
}

export function validate(config: Record<string, unknown>) {
  // Construir DATABASE_URL a partir de variables individuales si no existe
  if (!config.DATABASE_URL) {
    const dbHost = config.DB_HOST || 'localhost';
    const dbPort = config.DB_PORT || '1433';
    const dbName = config.DB_NAME || 'DB_Transparencia_Fiscal';
    const dbUser = config.DB_USER || 'sa';
    const dbPassword = config.DB_PASSWORD || '';
    const dbEncrypt = config.DB_ENCRYPT || 'false';
    const dbTrustServerCertificate = config.DB_TRUST_SERVER_CERTIFICATE || 'true';

    config.DATABASE_URL = `sqlserver://${dbHost}:${dbPort};database=${dbName};user=${dbUser};password=${dbPassword};encrypt=${dbEncrypt};trustServerCertificate=${dbTrustServerCertificate}`;
  }

  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
