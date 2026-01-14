import { Module } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';
import { DocumentosRepository } from './documentos.repository';
import { CatalogosRepository } from '../catalogos/catalogos.repository';
import { PrismaModule } from '../../../prisma/prisma.module';
import { FileUploadService } from '../../../common/services/file-upload.service';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentosController],
  providers: [DocumentosService, DocumentosRepository, CatalogosRepository, FileUploadService],
  exports: [DocumentosService, DocumentosRepository],
})
export class DocumentosModule {}
