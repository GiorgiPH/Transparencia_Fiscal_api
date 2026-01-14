import { ApiProperty } from '@nestjs/swagger';
import { DisponibilidadTipoDocumentoDto } from './disponibilidad-tipo-documento.dto';

export class CatalogoHijosResponseDto {
  @ApiProperty({
    description: 'ID del catálogo',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre del catálogo',
    example: 'Finanzas Públicas',
  })
  nombre: string;

  @ApiProperty({
    description: 'Descripción del catálogo',
    example: 'Información sobre finanzas públicas del estado',
    required: false,
  })
  descripcion?: string;

  @ApiProperty({
    description: 'Descripción del Nievl',
    example: 'Información sobre el nivel',
    required: false,
  })
  descripcionNivel?: string;
  
  @ApiProperty({
    description: 'Icono del nivel padre',
    example: 'Chart',
  })
  icono: string;


  @ApiProperty({
    description: 'Nivel del catálogo en la jerarquía',
    example: 1,
  })
  nivel: number;

  

  @ApiProperty({
    description: 'Orden de visualización',
    example: 0,
  })
  orden: number;

  @ApiProperty({
    description: 'Indica si el catálogo permite documentos',
    example: true,
  })
  permiteDocumentos: boolean;

  @ApiProperty({
    description: 'Disponibilidad de tipos de documento (solo si permiteDocumentos = true)',
    type: [DisponibilidadTipoDocumentoDto],
    required: false,
  })
  disponibilidadTiposDocumento?: DisponibilidadTipoDocumentoDto[];

  @ApiProperty({
    description: 'Fecha de creación del catálogo',
    example: '2025-12-28T14:30:00.000Z',
  })
  fechaCreacion: Date;

  @ApiProperty({
    description: 'Fecha de última modificación del catálogo',
    example: '2025-12-28T14:30:00.000Z',
  })
  fechaModificacion: Date;
}
