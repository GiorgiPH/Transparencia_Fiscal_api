import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {


  constructor() {
    const databaseUrl = process.env.DATABASE_URL!;
    
    // Parse SQL Server connection string format: sqlserver://server:port;database=db;user=user;password=pass;encrypt=false
    const parseSqlServerUrl = (urlString: string) => {
      // Remove protocol
      const withoutProtocol = urlString.replace(/^sqlserver:\/\//, '');
      
      // Split by semicolon to get parts
      const parts = withoutProtocol.split(';');
      
      // First part contains server:port
      const serverPart = parts[0];
      const [server, portStr] = serverPart.includes(':') 
        ? serverPart.split(':') 
        : [serverPart, '1433'];
      
      // Parse parameters from remaining parts
      const params: Record<string, string> = {};
      for (let i = 1; i < parts.length; i++) {
        const [key, value] = parts[i].split('=');
        if (key && value) {
          params[key.toLowerCase()] = value;
        }
      }
      
      return {
        server,
        port: parseInt(portStr, 10) || 1433,
        database: params.database || '',
        user: params.user || undefined,
        password: params.password || undefined,
        encrypt: params.encrypt !== 'false',
        trustServerCertificate: params.trustservercertificate === 'true',
      };
    };
    
    const config = parseSqlServerUrl(databaseUrl);
    
    const adapter = new PrismaMssql({
      server: config.server,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      options: {
        encrypt: config.encrypt,
        trustServerCertificate: config.trustServerCertificate,
      },
    });

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
