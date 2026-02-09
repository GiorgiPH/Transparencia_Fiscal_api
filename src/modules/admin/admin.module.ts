import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CatalogosModule } from './catalogos/catalogos.module';
import { DocumentosModule } from './documentos/documentos.module';
import { ConfiguracionModule } from './configuracion/configuracion.module';
import { DependenciasModule } from './dependencias/dependencias.module';

@Module({
  imports: [AuthModule, UsersModule, CatalogosModule, DocumentosModule, ConfiguracionModule, DependenciasModule],
  exports: [AuthModule, UsersModule, CatalogosModule, DocumentosModule, ConfiguracionModule, DependenciasModule],
})
export class AdminModule {}
