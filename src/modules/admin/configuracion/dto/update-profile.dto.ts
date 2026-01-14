import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez López',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  name?: string;

  @ApiProperty({
    description: 'URL de la foto de perfil',
    example: 'https://storage.morelos.gob.mx/perfiles/usuario123.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La foto de perfil debe ser una URL válida' })
  foto_perfil?: string;

  @ApiProperty({
    description: 'Área o departamento del usuario',
    example: 'Secretaría de Administración y Finanzas',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El área/departamento debe ser una cadena de texto' })
  @MaxLength(200, { message: 'El área/departamento no puede exceder los 200 caracteres' })
  area_departamento?: string;

  @ApiProperty({
    description: 'Número de teléfono',
    example: '7771234567',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Matches(/^[0-9]{10}$/, { message: 'El teléfono debe tener 10 dígitos numéricos' })
  telefono?: string;
}
