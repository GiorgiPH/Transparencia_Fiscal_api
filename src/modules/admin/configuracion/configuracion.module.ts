import { Module } from '@nestjs/common';
import { ConfiguracionController } from './configuracion.controller';
import { ConfiguracionService } from './configuracion.service';
import { ConfiguracionRepository } from './configuracion.repository';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConfiguracionController],
  providers: [ConfiguracionService, ConfiguracionRepository],
  exports: [ConfiguracionService],
})
export class ConfiguracionModule {}
