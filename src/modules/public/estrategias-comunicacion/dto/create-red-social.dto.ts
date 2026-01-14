import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateRedSocialDto {
  @ApiProperty({ description: 'Nombre de la red social', example: 'Facebook' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'URL de la red social', example: 'https://facebook.com/gobiernomorelos' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: 'Icono de la red social', example: 'facebook' })
  @IsString()
  @IsNotEmpty()
  icono: string;

  @ApiProperty({ description: 'Descripcion de la red social', example: '@Gob.Morelos' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ description: 'Indica si la red social está activa', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @ApiProperty({ description: 'Orden de aparición en la interfaz', example: 1, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  orden?: number;
}
