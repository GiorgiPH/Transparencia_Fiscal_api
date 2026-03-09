import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class EstadisticasUsuariosResponseDto {
  @ApiProperty({
    description: 'Total de usuarios activos',
    example: 150,
  })
  @IsInt()
  totalUsuariosActivos: number;

  @ApiProperty({
    description: 'Total de usuarios inactivos',
    example: 25,
  })
  @IsInt()
  totalUsuariosInactivos: number;

  @ApiProperty({
    description: 'Total de usuarios con rol ADMIN',
    example: 10,
  })
  @IsInt()
  totalUsuariosAdmin: number;

  @ApiProperty({
    description: 'Total de usuarios con rol CARGA',
    example: 45,
  })
  @IsInt()
  totalUsuariosCarga: number;

  @ApiProperty({
    description: 'Total de usuarios con rol EDICION',
    example: 95,
  })
  @IsInt()
  totalUsuariosEdicion: number;

  @ApiProperty({
    description: 'Total de usuarios con 2FA habilitado',
    example: 120,
  })
  @IsInt()
  totalUsuariosCon2FA: number;

  @ApiProperty({
    description: 'Total de usuarios con foto de perfil',
    example: 85,
  })
  @IsInt()
  totalUsuariosConFotoPerfil: number;

  @ApiProperty({
    description: 'Total de usuarios con dependencia asignada',
    example: 130,
  })
  @IsInt()
  totalUsuariosConDependencia: number;

  @ApiProperty({
    description: 'Total de usuarios registrados en el último mes',
    example: 15,
  })
  @IsInt()
  totalUsuariosUltimoMes: number;

  constructor(
    totalUsuariosActivos: number,
    totalUsuariosInactivos: number,
    totalUsuariosAdmin: number,
    totalUsuariosCarga: number,
    totalUsuariosEdicion: number,
    totalUsuariosCon2FA: number,
    totalUsuariosConFotoPerfil: number,
    totalUsuariosConDependencia: number,
    totalUsuariosUltimoMes: number,
  ) {
    this.totalUsuariosActivos = totalUsuariosActivos;
    this.totalUsuariosInactivos = totalUsuariosInactivos;
    this.totalUsuariosAdmin = totalUsuariosAdmin;
    this.totalUsuariosCarga = totalUsuariosCarga;
    this.totalUsuariosEdicion = totalUsuariosEdicion;
    this.totalUsuariosCon2FA = totalUsuariosCon2FA;
    this.totalUsuariosConFotoPerfil = totalUsuariosConFotoPerfil;
    this.totalUsuariosConDependencia = totalUsuariosConDependencia;
    this.totalUsuariosUltimoMes = totalUsuariosUltimoMes;
  }
}