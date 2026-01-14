import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CatalogosModule } from './catalogos/catalogos.module';
import { DocumentosModule } from './documentos/documentos.module';
import { ConfiguracionModule } from './configuracion/configuracion.module';

@Module({
  imports: [AuthModule, UsersModule, CatalogosModule, DocumentosModule, ConfiguracionModule],
  exports: [AuthModule, UsersModule, CatalogosModule, DocumentosModule, ConfiguracionModule],
})
export class AdminModule {}
