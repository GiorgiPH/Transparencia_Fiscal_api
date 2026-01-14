import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyCodeDto {
  @ApiProperty({
    description: 'Código de verificación enviado al correo electrónico',
    example: '123456',
  })
  @IsNotEmpty({ message: 'El código de verificación es requerido' })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  code: string;
}
