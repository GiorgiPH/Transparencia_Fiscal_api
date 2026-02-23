import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class NoticiaCarouselDto {
  @ApiProperty({ description: 'ID de la noticia', example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Título de la noticia', example: 'Nueva estrategia de transparencia fiscal' })
  @IsString()
  titulo: string;

  @ApiProperty({ description: 'Fecha de publicación formateada', example: 'Diciembre 2025' })
  @IsString()
  fecha_formateada: string;

  @ApiProperty({ description: 'Descripción corta de la noticia', example: 'El gobierno presenta nueva estrategia...' })
  @IsString()
  descripcion_corta: string;

  @ApiProperty({ description: 'URL de la imagen de la noticia', required: false, example: 'https://example.com/imagen.jpg' })
  @IsString()
  @IsOptional()
  imagen_url?: string;

  @ApiProperty({ description: 'link imagen de la noticia', required: false, example: 'https://example.com/imagen.jpg' })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiProperty({ description: 'Texto alternativo para la imagen', example: 'Nueva estrategia de transparencia fiscal' })
  @IsString()
  imagen_alt: string;

  @ApiProperty({ description: 'URL para ver más detalles de la noticia', example: '/estrategias-comunicacion/noticias/1' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Fecha de publicación original', example: '2025-12-26T10:00:00.000Z' })
  @IsDateString()
  fecha_publicacion: Date;
}