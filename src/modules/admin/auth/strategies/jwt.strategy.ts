import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: any) {
    // Buscar usuario en base de datos
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
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
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Extraer permisos
    const permissions = this.extractPermissions(user);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: payload.roles || [],
      permissions: permissions,
    };
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
}
