import { ApiProperty } from '@nestjs/swagger';

export class PeriodicidadResponseDto {
  @ApiProperty({
    description: 'ID de la periodicidad',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre de la periodicidad',
    example: 'Anual',
  })
  nombre: string;

  @ApiProperty({
    description: 'Nombre de la periodicidad que aparecerá en el portal',
    example: 'Anual',
  })
  nombrePortal: string;

  @ApiProperty({
    description: 'Meses por periodo',
    example: 12,
  })
  mesesPorPeriodo: number;

  @ApiProperty({
    description: 'Periodos por año',
    example: 1,
  })
  periodosPorAnio: number;

  @ApiProperty({
    description: 'Indica si la periodicidad está activa',
    example: true,
  })
  activo: boolean;
}