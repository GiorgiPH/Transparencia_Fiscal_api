import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token de refresco',
    example: 'refresh-token-123456',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Fecha de expiración del token de acceso',
    example: '2025-12-26T14:00:00.000Z',
  })
  expiresIn: Date;

  @ApiProperty({
    description: 'Información del usuario autenticado',
  })
  user: {
    id: number;
    email: string;
    name: string;
    roles: string[];
    permissions: string[];
  };
}
