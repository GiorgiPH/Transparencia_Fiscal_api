import { Module } from '@nestjs/common';
import { ParticipacionCiudadanaController } from './participacion-ciudadana.controller';
import { ParticipacionCiudadanaService } from './participacion-ciudadana.service';
import { ParticipacionCiudadanaRepository } from './participacion-ciudadana.repository';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ParticipacionCiudadanaController],
  providers: [ParticipacionCiudadanaService, ParticipacionCiudadanaRepository],
  exports: [ParticipacionCiudadanaService],
})
export class ParticipacionCiudadanaModule {}
