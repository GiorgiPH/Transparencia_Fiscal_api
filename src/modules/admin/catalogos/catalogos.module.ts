import { Module } from '@nestjs/common';
import { CatalogosService } from './catalogos.service';
import { CatalogosController } from './catalogos.controller';
import { CatalogosRepository } from './catalogos.repository';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CatalogosController],
  providers: [CatalogosService, CatalogosRepository],
  exports: [CatalogosService, CatalogosRepository],
})
export class CatalogosModule {}
