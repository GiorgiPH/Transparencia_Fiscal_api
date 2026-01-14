import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateMensajeDto {
  @ApiProperty({
    description: 'Nombre completo del ciudadano',
    example: 'Juan Pérez López',
  })
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @MaxLength(200, { message: 'El nombre completo no puede exceder los 200 caracteres' })
  nombre_completo: string;

  @ApiProperty({
    description: 'Correo electrónico del ciudadano',
    example: 'juan.perez@example.com',
  })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @MaxLength(100, { message: 'El correo electrónico no puede exceder los 100 caracteres' })
  correo_electronico: string;

  @ApiProperty({
    description: 'Asunto del mensaje',
    example: 'Sugerencia para mejorar el portal',
  })
  @IsNotEmpty({ message: 'El asunto es requerido' })
  @IsString({ message: 'El asunto debe ser una cadena de texto' })
  @MaxLength(200, { message: 'El asunto no puede exceder los 200 caracteres' })
  asunto: string;

  @ApiProperty({
    description: 'Contenido del mensaje',
    example: 'Me gustaría sugerir que agreguen más gráficos interactivos...',
  })
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  @IsString({ message: 'El mensaje debe ser una cadena de texto' })
  @MaxLength(5000, { message: 'El mensaje no puede exceder los 5000 caracteres' })
  mensaje: string;

  @ApiProperty({
    description: 'Canal por el cual se envía el mensaje',
    example: 'web',
    required: false,
    enum: ['web', 'email', 'telefono', 'presencial'],
  })
  @IsOptional()
  @IsString({ message: 'El canal debe ser una cadena de texto' })
  @IsIn(['web', 'email', 'telefono', 'presencial'], {
    message: 'El canal debe ser uno de: web, email, telefono, presencial',
  })
  canal?: string;

  @ApiProperty({
    description: 'Área destino del mensaje',
    example: 'Unidad de Transparencia',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El área destino debe ser una cadena de texto' })
  @MaxLength(200, { message: 'El área destino no puede exceder los 200 caracteres' })
  area_destino?: string;

  @ApiProperty({
    description: 'Dirección IP del remitente (capturada automáticamente)',
    example: '192.168.1.1',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La dirección IP debe ser una cadena de texto' })
  direccion_ip?: string;

  @ApiProperty({
    description: 'Agente de usuario del navegador (capturado automáticamente)',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El agente de usuario debe ser una cadena de texto' })
  agente_usuario?: string;
}
