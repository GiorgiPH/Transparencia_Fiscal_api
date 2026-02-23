import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreateNoticiaDto {
  @ApiProperty({ description: 'Título de la noticia', example: 'Nueva estrategia de transparencia fiscal' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ description: 'Descripción corta de la noticia', example: 'El gobierno presenta nueva estrategia...' })
  @IsString()
  @IsNotEmpty()
  descripcion_corta: string;

  @ApiProperty({ description: 'Contenido completo de la noticia', example: 'Contenido detallado de la noticia...' })
  @IsString()
  @IsNotEmpty()
  contenido: string;

  @ApiProperty({ description: 'URL de la imagen de la noticia', required: false, example: 'https://example.com/imagen.jpg' })
  @IsString()
  @IsOptional()
  imagen_url?: string;

  @ApiProperty({ description: 'linkn de la noticia', required: false, example: 'https://example.com/imagen.jpg' })
  @IsString()
  @IsOptional()
  link?: string;


  @ApiProperty({ description: 'Fecha de publicación de la noticia', example: '2025-12-26T10:00:00.000Z' })
  @IsDateString()
  fecha_publicacion: Date;

  @ApiProperty({ description: 'Indica si la noticia está activa', example: true, default: true })
  @Transform(({ value }) => (value === undefined ? undefined : value === 'true' || value === true))
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
