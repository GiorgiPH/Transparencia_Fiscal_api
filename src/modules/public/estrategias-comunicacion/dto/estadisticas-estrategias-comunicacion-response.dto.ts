import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class EstadisticasEstrategiasComunicacionResponseDto {
  @ApiProperty({
    description: 'Total de noticias',
    example: 150,
  })
  @IsInt()
  totalNoticias: number;

  @ApiProperty({
    description: 'Total de noticias activas',
    example: 125,
  })
  @IsInt()
  noticiasActivas: number;

  @ApiProperty({
    description: 'Total de noticias inactivas',
    example: 25,
  })
  @IsInt()
  noticiasInactivas: number;

  @ApiProperty({
    description: 'Total de redes sociales',
    example: 10,
  })
  @IsInt()
  totalRedesSociales: number;

  @ApiProperty({
    description: 'Total de redes sociales activas',
    example: 8,
  })
  @IsInt()
  redesSocialesActivas: number;

  @ApiProperty({
    description: 'Total de redes sociales inactivas',
    example: 2,
  })
  @IsInt()
  redesSocialesInactivas: number;

  @ApiProperty({
    description: 'Total de elementos de comunicación (noticias + redes sociales)',
    example: 160,
  })
  @IsInt()
  totalElementosComunicacion: number;

  constructor(
    totalNoticias: number,
    noticiasActivas: number,
    noticiasInactivas: number,
    totalRedesSociales: number,
    redesSocialesActivas: number,
    redesSocialesInactivas: number,
  ) {
    this.totalNoticias = totalNoticias;
    this.noticiasActivas = noticiasActivas;
    this.noticiasInactivas = noticiasInactivas;
    this.totalRedesSociales = totalRedesSociales;
    this.redesSocialesActivas = redesSocialesActivas;
    this.redesSocialesInactivas = redesSocialesInactivas;
    this.totalElementosComunicacion = totalNoticias + totalRedesSociales;
  }
}