import { Module } from '@nestjs/common';
import { ParticipacionCiudadanaModule } from './participacion-ciudadana/participacion-ciudadana.module';
import { EstrategiasComunicacionModule } from './estrategias-comunicacion/estrategias-comunicacion.module';
import { BusquedaDocumentosModule } from './busqueda-documentos/busqueda-documentos.module';
import { CatalogosModule } from './catalogos/catalogos.module';

@Module({
  imports: [
    ParticipacionCiudadanaModule,
    EstrategiasComunicacionModule,
    BusquedaDocumentosModule,
    CatalogosModule,
  ],
  exports: [
    ParticipacionCiudadanaModule,
    EstrategiasComunicacionModule,
    BusquedaDocumentosModule,
    CatalogosModule,
  ],
})
export class PublicModule {}
