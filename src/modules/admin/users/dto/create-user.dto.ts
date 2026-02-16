import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, Matches, IsOptional, IsArray, IsBoolean, IsNumber } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez López',
  })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@morelos.gob.mx',
  })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @MaxLength(100, { message: 'El correo no puede exceder los 100 caracteres' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'ContraseñaSegura123!',
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(4, { message: 'La contraseña debe tener al menos 4 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder los 50 caracteres' })
  password: string;

  @ApiProperty({
    description: 'ID de la dependencia del usuario',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de dependencia debe ser un número' })
  dependenciaId?: number;

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
  telefono?: string;

  @ApiProperty({
    description: 'IDs de roles a asignar al usuario',
    example: [1, 2],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Los roles deben ser un array' })
  @IsNumber({}, { each: true, message: 'Cada ID de rol debe ser un número' })
  roleIds?: number[];

  @ApiProperty({
    description: 'Indica si el usuario requiere verificación en dos pasos',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo requiere_2fa debe ser booleano' })
  requiere_2fa?: boolean;

  @ApiProperty({
    description: 'Ruta de la foto de perfil del usuario',
    example: '/uploads/users/foto.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La foto de perfil debe ser una cadena de texto' })
  foto_perfil?: string;

  @ApiProperty({
    description: 'Estado activo/inactivo del usuario',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser booleano' })
  activo?: boolean;
}
