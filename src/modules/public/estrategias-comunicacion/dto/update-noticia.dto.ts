import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class UpdateNoticiaDto {
  @ApiProperty({ description: 'Título de la noticia', required: false, example: 'Nueva estrategia de transparencia fiscal actualizada' })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({ description: 'Descripción corta de la noticia', required: false, example: 'El gobierno presenta nueva estrategia actualizada...' })
  @IsString()
  @IsOptional()
  descripcion_corta?: string;

  @ApiProperty({ description: 'Contenido completo de la noticia', required: false, example: 'Contenido detallado actualizado...' })
  @IsString()
  @IsOptional()
  contenido?: string;

  @ApiProperty({ description: 'URL de la imagen de la noticia', required: false, example: 'https://example.com/imagen-actualizada.jpg' })
  @IsString()
  @IsOptional()
  imagen_url?: string;

  @ApiProperty({ description: 'link de la noticia', required: false, example: 'https://example.com/imagen-actualizada.jpg' })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiProperty({ description: 'Fecha de publicación de la noticia', required: false, example: '2025-12-27T10:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  fecha_publicacion?: Date;

  @ApiProperty({ description: 'Indica si la noticia está activa', required: false, example: true })
  @Transform(({ value }) => (value === undefined ? undefined : value === 'true' || value === true))
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
