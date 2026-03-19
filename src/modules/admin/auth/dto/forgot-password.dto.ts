import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordRequestDto {
  @ApiProperty({
    description: 'Email del usuario registrado',
    example: 'usuario@morelos.gob.mx',
  })
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Dirección IP de la solicitud',
    example: '192.168.1.1',
    required: false,
  })
  @IsString()
  @IsOptional()
  requestIp?: string;

  @ApiProperty({
    description: 'User Agent del navegador',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: false,
  })
  @IsString()
  @IsOptional()
  userAgent?: string;
}

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Mensaje genérico de respuesta',
    example: 'Si el correo está registrado, se enviará un enlace para restablecer la contraseña.',
  })
  message: string;

  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;
}
