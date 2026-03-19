import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ForgotPasswordRequestDto, ForgotPasswordResponseDto } from './dto/forgot-password.dto';
import { ResetPasswordRequestDto, ResetPasswordResponseDto } from './dto/reset-password.dto';
import { Request } from 'express';
import { MailService } from '../../../common/services/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 10;
  private readonly RESET_TOKEN_EXPIRATION_MINUTES = 15;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
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

  /**
   * Solicita el restablecimiento de contraseña
   * Genera un token seguro y envía un correo al usuario
   * IMPORTANTE: Siempre devuelve respuesta genérica para no revelar si el email existe
   */
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordRequestDto,
  ): Promise<ForgotPasswordResponseDto> {
    const { email, requestIp, userAgent } = forgotPasswordDto;

    this.logger.log(`Solicitud de restablecimiento de contraseña para: ${email}`);

    // Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Si el usuario existe y está activo, procesar la solicitud
    if (user && user.activo) {
      try {
        // Invalidar tokens anteriores no usados del mismo usuario
        await this.prisma.resetPasswordToken.updateMany({
          where: {
            usuario_id: user.id,
            usado: false,
          },
          data: {
            usado: true,
            fecha_uso: new Date(),
          },
        });

        // Generar token seguro criptográficamente
        const resetToken = this.generateSecureResetToken();

        // Calcular fecha de expiración (15 minutos)
        const fechaCreacion = new Date();
        const fechaExpiracion = new Date(
          fechaCreacion.getTime() + this.RESET_TOKEN_EXPIRATION_MINUTES * 60 * 1000,
        );

        // Guardar token en base de datos
        await this.prisma.resetPasswordToken.create({
          data: {
            token: resetToken,
            usuario_id: user.id,
            fecha_creacion: fechaCreacion,
            fecha_expiracion: fechaExpiracion,
            usado: false,
          },
        });

        // Construir URL de reset
        const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
        const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

        // Enviar correo al usuario
        await this.mailService.sendResetPasswordEmail(
          user.name || user.email,
          user.email,
          resetUrl,
        );

        this.logger.log(`Token de restablecimiento generado exitosamente para usuario ID: ${user.id}`);
      } catch (error) {
        // Log del error pero no revelar al usuario
        this.logger.error(`Error al procesar solicitud de restablecimiento: ${error.message}`);
      }
    } else {
      // Usuario no existe o está inactivo - no hacer nada pero no revelar
      this.logger.warn(`Solicitud de restablecimiento para email no registrado o usuario inactivo: ${email}`);
    }

    // Siempre devolver respuesta genérica
    return {
      message: 'Si el correo está registrado, se enviará un enlace para restablecer la contraseña.',
      success: true,
    };
  }

  /**
   * Restablece la contraseña del usuario usando un token válido
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordRequestDto,
  ): Promise<ResetPasswordResponseDto> {
    const { token, newPassword, requestIp, userAgent } = resetPasswordDto;

    this.logger.log('Procesando solicitud de restablecimiento de contraseña');

    // Buscar el token en la base de datos
    const tokenRecord = await this.prisma.resetPasswordToken.findFirst({
      where: {
        token: token,
      },
      include: {
        usuario: true,
      },
    });

    // Validar que el token exista
    if (!tokenRecord) {
      this.logger.warn('Intento de restablecimiento con token inválido');
      throw new BadRequestException('El enlace de restablecimiento es inválido o ha expirado.');
    }

    // Validar que el token no haya sido usado
    if (tokenRecord.usado) {
      this.logger.warn(`Intento de reutilización de token ya usado. Token ID: ${tokenRecord.id}`);
      throw new BadRequestException('Este enlace de restablecimiento ya ha sido utilizado. Por favor, solicite uno nuevo.');
    }

    // Validar que el token no haya expirado
    const ahora = new Date();
    if (tokenRecord.fecha_expiracion < ahora) {
      this.logger.warn(`Intento de uso de token expirado. Token ID: ${tokenRecord.id}`);
      throw new BadRequestException('El enlace de restablecimiento ha expirado. Por favor, solicite uno nuevo.');
    }

    // Obtener el usuario asociado
    const user = tokenRecord.usuario;

    if (!user) {
      this.logger.error(`Token válido pero usuario no encontrado. Token ID: ${tokenRecord.id}`);
      throw new BadRequestException('Error al procesar la solicitud. Por favor, intente nuevamente.');
    }

    // Verificar que el usuario esté activo
    if (!user.activo) {
      this.logger.warn(`Intento de restablecimiento para usuario inactivo. Usuario ID: ${user.id}`);
      throw new BadRequestException('La cuenta de usuario no está activa.');
    }

    try {
      // Hashear la nueva contraseña usando el mismo mecanismo del sistema
      const hashedPassword = await this.hashPassword(newPassword);

      // Actualizar la contraseña del usuario y la fecha de último cambio
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          fecha_ultimo_cambio_pass: ahora,
          fecha_modificacion: ahora,
        },
      });

      // Marcar el token como usado
      await this.prisma.resetPasswordToken.update({
        where: { id: tokenRecord.id },
        data: {
          usado: true,
          fecha_uso: ahora,
        },
      });

      // Invalidar todos los refresh tokens activos del usuario por seguridad
      await this.prisma.refreshToken.updateMany({
        where: {
          usuario_id: user.id,
          activo: true,
        },
        data: {
          activo: false,
        },
      });

      this.logger.log(`Contraseña restablecida exitosamente para usuario ID: ${user.id}`);

      return {
        message: 'Su contraseña ha sido actualizada exitosamente. Ya puede iniciar sesión con su nueva contraseña.',
        success: true,
      };
    } catch (error) {
      this.logger.error(`Error al restablecer contraseña: ${error.message}`);
      throw new BadRequestException('Error al actualizar la contraseña. Por favor, intente nuevamente.');
    }
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

  /**
   * Genera un token aleatorio usando crypto (utilizado en refresh tokens)
   */
  private generateRandomToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Genera un token seguro criptográficamente para reset de contraseña
   * Usa crypto.randomBytes para máxima seguridad
   */
  private generateSecureResetToken(): string {
    return crypto.randomBytes(64).toString('hex');
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
