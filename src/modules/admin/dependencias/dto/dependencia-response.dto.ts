import { ApiProperty } from '@nestjs/swagger';

export class DependenciaResponseDto {
  @ApiProperty({ description: 'ID de la dependencia' })
  id: number;

  @ApiProperty({ description: 'Nombre de la dependencia' })
  nombre: string;

  @ApiProperty({ description: 'ID del tipo de dependencia' })
  idTipo: number;

  @ApiProperty({ description: 'Nombre del tipo de dependencia', required: false })
  tipoNombre?: string;

  @ApiProperty({ description: 'ID de la dependencia padre', required: false })
  idPadre?: number;

  @ApiProperty({ description: 'Nombre de la dependencia padre', required: false })
  padreNombre?: string;

  @ApiProperty({ description: 'Nivel jerárquico (1, 2, 3)' })
  nivel: number;

  @ApiProperty({ description: 'Orden de visualización' })
  orden: number;

  @ApiProperty({ description: 'Indica si está activa' })
  activo: boolean;

  @ApiProperty({ description: 'Fecha de alta' })
  fechaAlta: Date;

  @ApiProperty({ description: 'Fecha de creación' })
  fechaCreacion: Date;

  @ApiProperty({ description: 'Fecha de modificación' })
  fechaModificacion: Date;

  @ApiProperty({ description: 'Dependencias hijas', type: [DependenciaResponseDto], required: false })
  hijos?: DependenciaResponseDto[];
}

export class DependenciaTreeResponseDto {
  @ApiProperty({ description: 'Lista de dependencias organizadas en árbol' })
  dependencias: DependenciaResponseDto[];
}

export class TipoDependenciaResponseDto {
  @ApiProperty({ description: 'ID del tipo de dependencia' })
  id: number;

  @ApiProperty({ description: 'Nombre del tipo de dependencia' })
  nombre: string;

  @ApiProperty({ description: 'Fecha de creación' })
  fechaCreacion: Date;

  @ApiProperty({ description: 'Fecha de modificación' })
  fechaModificacion: Date;
}