import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt, Min, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateCatalogoDto } from './create-catalogo.dto';

export class UpdateCatalogoDto extends PartialType(CreateCatalogoDto) {
  @ApiProperty({
    description: 'Estado activo/inactivo del catálogo',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'activo debe ser un valor booleano' })
  activo?: boolean;
}
