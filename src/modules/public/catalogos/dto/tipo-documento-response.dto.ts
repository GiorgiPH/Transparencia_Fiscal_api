import { ApiProperty } from '@nestjs/swagger';

export class TipoDocumentoResponseDto {
  @ApiProperty({
    description: 'ID del tipo de documento',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre del tipo de documento',
    example: 'CSV',
  })
  nombre: string;

  @ApiProperty({
    description: 'Descripción del tipo de documento',
    example: 'Archivo de valores separados por comas',
    required: false,
  })
  descripcion?: string;

  @ApiProperty({
    description: 'Extensiones permitidas para este tipo de documento',
    example: 'csv',
  })
  extension: string;

  @ApiProperty({
    description: 'Lista de extensiones separadas por comas',
    example: 'csv,tsv',
  })
  extensiones: string;

  @ApiProperty({
    description: 'Indica si el tipo de documento está activo',
    example: true,
  })
  activo: boolean;

  @ApiProperty({
    description: 'Fecha de creación del tipo de documento',
    example: '2025-12-28T14:30:00.000Z',
  })
  fechaCreacion: Date;

  @ApiProperty({
    description: 'Fecha de última modificación del tipo de documento',
    example: '2025-12-28T14:30:00.000Z',
  })
  fechaModificacion: Date;
}
