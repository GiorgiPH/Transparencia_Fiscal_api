import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { Request } from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: {
                    permiso: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último acceso
    await this.prisma.user.update({
      where: { id: user.id },
      data: { ultimo_acceso: new Date() },
    });

    return user;
  }

  async login(loginDto: LoginDto, req: Request): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Obtener roles y permisos
    const roles = user.roles.map((ur) => ur.rol.nombre);
    const permissions = this.extractPermissions(user);

    // Generar tokens
    const accessToken = await this.generateAccessToken(user, roles, permissions);
    const refreshToken = await this.generateRefreshToken(user.id, req);

    // Crear respuesta
    return {
      accessToken,
      refreshToken,
      expiresIn: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email,
        roles,
        permissions,
      },
    };
  }

  async refreshToken(refreshToken: string, req: Request): Promise<LoginResponseDto> {
    // Buscar token en base de datos
    //const tokenHash = await this.hashRefreshToken(refreshToken);
    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: {
        token_hash: refreshToken,
        activo: true,
        fecha_expiracion: { gt: new Date() },
      },
      include: {
        usuario: {
          include: {
            roles: {
              include: {
                rol: {
                  include: {
                    permisos: {
                      include: {
                        permiso: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }

    const user = tokenRecord.usuario;

    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Obtener roles y permisos
    const roles = user.roles.map((ur) => ur.rol.nombre);
    const permissions = this.extractPermissions(user);

    // Generar nuevo access token
    const accessToken = await this.generateAccessToken(user, roles, permissions);
    
    // Actualizar último acceso
    await this.prisma.user.update({
      where: { id: user.id },
      data: { ultimo_acceso: new Date() },
    });

    return {
      accessToken,
      refreshToken, // Mantener el mismo refresh token
      expiresIn: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email,
        roles,
        permissions,
      },
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = await this.hashRefreshToken(refreshToken);
    
    await this.prisma.refreshToken.updateMany({
      where: { token_hash: tokenHash, activo: true },
      data: { activo: false },
    });
  }

  private async generateAccessToken(
    user: any,
    roles: string[],
    permissions: string[],
  ): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles,
      permissions,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.secret'),
      expiresIn: '30m',
    });
  }

  private async generateRefreshToken(userId: number, req: Request): Promise<string> {
    const refreshToken = this.generateRandomToken();
   // const tokenHash = await this.hashRefreshToken(refreshToken);

    // Obtener información de la solicitud
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Calcular fecha de expiración (7 días)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    // Guardar token en base de datos
    await this.prisma.refreshToken.create({
      data: {
        usuario_id: userId,
        token_hash: refreshToken,
        ip_origen: ip.toString(),
        user_agent: userAgent,
        fecha_expiracion: expirationDate,
        activo: true,
      },
    });

    return refreshToken;
  }

  private extractPermissions(user: any): string[] {
    const permissions = new Set<string>();
    
    user.roles.forEach((userRole: any) => {
      userRole.rol.permisos.forEach((rolePermission: any) => {
        permissions.add(rolePermission.permiso.codigo);
      });
    });

    return Array.from(permissions);
  }

  private generateRandomToken(): string {
    return require('crypto').randomBytes(64).toString('hex');
  }

  private async hashRefreshToken(token: string): Promise<string> {
    return bcrypt.hash(token, this.SALT_ROUNDS);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
