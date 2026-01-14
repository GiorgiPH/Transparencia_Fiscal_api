import { ApiProperty } from '@nestjs/swagger';

export class DisponibilidadTipoDocumentoDto {
  @ApiProperty({
    description: 'ID del tipo de documento',
    example: 1,
  })
  tipoDocumentoId: number;

  @ApiProperty({
    description: 'Nombre del tipo de documento',
    example: 'CSV',
  })
  nombre: string;

  @ApiProperty({
    description: 'Indica si existe al menos un documento activo de este tipo en el catálogo',
    example: true,
  })
  disponible: boolean;

  @ApiProperty({
    description: 'Extensiones permitidas para este tipo de documento',
    example: 'csv',
  })
  extension: string;

  @ApiProperty({
    description: 'ID del documento disponible (si existe)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  documentoId?: string;

  @ApiProperty({
    description: 'Nombre del documento disponible (si existe)',
    example: 'datos_financieros_2024.csv',
    required: false,
  })
  documentoNombre?: string;
}
