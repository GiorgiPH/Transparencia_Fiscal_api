import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsArray, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserFormDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez López',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@morelos.gob.mx',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email?: string;

  @ApiProperty({
    description: 'ID de la institución del usuario',
    example: 'inst-001',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El ID de institución debe ser una cadena de texto' })
  institucion_id?: string;

  @ApiProperty({
    description: 'Área o departamento del usuario',
    example: 'Secretaría de Administración y Finanzas',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El área/departamento debe ser una cadena de texto' })
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
    example: '[1, 2]',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    // Si es string, intentar parsear como JSON
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        // Si no es JSON válido, intentar split por comas
        if (value.includes(',')) {
          return value.split(',').map(Number);
        }
        // Si es un solo número, convertirlo a array
        const num = Number(value);
        return isNaN(num) ? [] : [num];
      }
    }
    // Si ya es array, devolverlo
    if (Array.isArray(value)) {
      return value.map(v => Number(v));
    }
    // Si es undefined o null, devolver array vacío
    return [];
  })
  @IsArray({ message: 'Los roles deben ser un array' })
  @IsNumber({}, { each: true, message: 'Cada ID de rol debe ser un número' })
  roleIds?: number[];

  @ApiProperty({
    description: 'Indica si el usuario requiere verificación en dos pasos',
    example: 'false',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'El campo requiere_2fa debe ser booleano' })
  requiere_2fa?: boolean;

  @ApiProperty({
    description: 'Indica si el usuario está activo',
    example: 'true',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'El campo activo debe ser booleano' })
  activo?: boolean;

  @ApiProperty({
    description: 'Foto de perfil del usuario',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  foto_perfil?: any;
}