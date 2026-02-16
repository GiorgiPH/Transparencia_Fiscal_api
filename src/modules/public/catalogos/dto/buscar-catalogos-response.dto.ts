import { ApiProperty } from '@nestjs/swagger';
import { CatalogoHijosResponseDto } from './catalogo-hijos-response.dto';

export class CatalogoPathItemDto {
  @ApiProperty({
    description: 'ID del catálogo en el path',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre del catálogo en el path',
    example: 'Finanzas Públicas',
  })
  nombre: string;

  @ApiProperty({
    description: 'Nivel del catálogo en el path',
    example: 0,
  })
  nivel: number;
}

export class BuscarCatalogosResponseDto extends CatalogoHijosResponseDto {
  @ApiProperty({
    description: 'Path completo desde la raíz hasta este catálogo',
    type: [CatalogoPathItemDto],
    example: [
      { id: 1, nombre: 'Finanzas Públicas', nivel: 0 },
      { id: 2, nombre: 'Presupuesto', nivel: 1 },
      { id: 3, nombre: 'Ejecución Presupuestal', nivel: 2 },
    ],
  })
  path: CatalogoPathItemDto[];
}