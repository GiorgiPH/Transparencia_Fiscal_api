import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class EstadisticasCatalogosResponseDto {
  @ApiProperty({
    description: 'Total de catálogos activos',
    example: 150,
  })
  @IsInt()
  totalCatalogos: number;

  @ApiProperty({
    description: 'Total de documentos activos',
    example: 1250,
  })
  @IsInt()
  totalDocumentos: number;

  @ApiProperty({
    description: 'Cantidad de catálogos por nivel (nivel 0)',
    example: 10,
  })
  @IsInt()
  catalogosNivel0: number;

  @ApiProperty({
    description: 'Cantidad de catálogos por nivel (nivel 1)',
    example: 45,
  })
  @IsInt()
  catalogosNivel1: number;

  @ApiProperty({
    description: 'Cantidad de catálogos por nivel (nivel 2)',
    example: 95,
  })
  @IsInt()
  catalogosNivel2: number;

  @ApiProperty({
    description: 'Cantidad de catálogos que permiten documentos',
    example: 120,
  })
  @IsInt()
  catalogosConPermisoDocumentos: number;

  @ApiProperty({
    description: 'Cantidad de catálogos raíz (sin padre)',
    example: 10,
  })
  @IsInt()
  catalogosRaiz: number;

  @ApiProperty({
    description: 'Cantidad de catálogos con documentos subidos',
    example: 85,
  })
  @IsInt()
  catalogosConDocumentos: number;

  constructor(
    totalCatalogos: number,
    totalDocumentos: number,
    catalogosNivel0: number,
    catalogosNivel1: number,
    catalogosNivel2: number,
    catalogosConPermisoDocumentos: number,
    catalogosRaiz: number,
    catalogosConDocumentos: number,
  ) {
    this.totalCatalogos = totalCatalogos;
    this.totalDocumentos = totalDocumentos;
    this.catalogosNivel0 = catalogosNivel0;
    this.catalogosNivel1 = catalogosNivel1;
    this.catalogosNivel2 = catalogosNivel2;
    this.catalogosConPermisoDocumentos = catalogosConPermisoDocumentos;
    this.catalogosRaiz = catalogosRaiz;
    this.catalogosConDocumentos = catalogosConDocumentos;
  }
}
