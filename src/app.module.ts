import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { validate } from './config/env.validation';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import corsConfig from './config/cors.config';
import storageConfig from './config/storage.config';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AdminModule } from './modules/admin/admin.module';
import { PublicModule } from './modules/public/public.module';
import { MailModule } from './common/services/mail.module';
import { FileDownloadModule } from './common/services/file-download.module';
import { UrlUtilsModule } from './common/services/url-utils.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, corsConfig, storageConfig],
      validate,
      envFilePath: process.env.NODE_ENV === 'production' 
        ? '.env.production' 
        : process.env.NODE_ENV === 'test'
          ? '.env.test'
          : '.env.development',
    }),
    PrismaModule,
    MailModule,
    FileDownloadModule,
    UrlUtilsModule,
    AdminModule,
    PublicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Aplicar a todas las rutas
  }
}
