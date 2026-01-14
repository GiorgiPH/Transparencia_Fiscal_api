import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsUUID, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateDocumentoDto } from './create-documento.dto';

export class UpdateDocumentoDto extends PartialType(CreateDocumentoDto) {
  @ApiProperty({
    description: 'Estado activo/inactivo del documento',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'activo debe ser un valor booleano' })
  activo?: boolean;
}
