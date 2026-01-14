import { Module } from '@nestjs/common';
import { EstrategiasComunicacionController } from './estrategias-comunicacion.controller';
import { EstrategiasComunicacionService } from './estrategias-comunicacion.service';
import { EstrategiasComunicacionRepository } from './estrategias-comunicacion.repository';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EstrategiasComunicacionController],
  providers: [EstrategiasComunicacionService, EstrategiasComunicacionRepository],
  exports: [EstrategiasComunicacionService],
})
export class EstrategiasComunicacionModule {}
