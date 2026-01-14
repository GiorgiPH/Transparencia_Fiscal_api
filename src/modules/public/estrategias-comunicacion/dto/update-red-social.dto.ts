import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateRedSocialDto {
  @ApiProperty({ description: 'Nombre de la red social', required: false, example: 'Facebook Actualizado' })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ description: 'URL de la red social', required: false, example: 'https://facebook.com/gobiernomorelos-actualizado' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({ description: 'Icono de la red social', required: false, example: 'facebook-square' })
  @IsString()
  @IsOptional()
  icono?: string;

  @ApiProperty({ description: 'Indica si la red social está activa', required: false, example: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @ApiProperty({ description: 'Orden de aparición en la interfaz', required: false, example: 2 })
  @IsInt()
  @Min(0)
  @IsOptional()
  orden?: number;
}
