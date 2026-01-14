import { Module } from '@nestjs/common';
import { BusquedaDocumentosController } from './busqueda-documentos.controller';
import { BusquedaDocumentosService } from './busqueda-documentos.service';
import { DocumentosRepository } from '../../admin/documentos/documentos.repository';
import { CatalogosRepository } from '../../admin/catalogos/catalogos.repository';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BusquedaDocumentosController],
  providers: [
    BusquedaDocumentosService,
    DocumentosRepository,
    CatalogosRepository,
  ],
  exports: [BusquedaDocumentosService],
})
export class BusquedaDocumentosModule {}
