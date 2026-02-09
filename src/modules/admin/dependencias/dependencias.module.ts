import { Module } from '@nestjs/common';
import { DependenciasController } from './dependencias.controller';
import { DependenciasService } from './dependencias.service';
import { DependenciasRepository } from './dependencias.repository';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DependenciasController],
  providers: [DependenciasService, DependenciasRepository],
  exports: [DependenciasService, DependenciasRepository],
})
export class DependenciasModule {}