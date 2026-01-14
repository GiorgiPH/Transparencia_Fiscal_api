import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { User, VerificationCode, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ConfiguracionRepository {
  constructor(private prisma: PrismaService) {}

  async findUserById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });
  }

  async updateUser(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async verifyPassword(userId: number, password: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return false;
    }

    return bcrypt.compare(password, user.password);
  }

  async updatePassword(userId: number, newPassword: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        usuario_modif_id: userId,
      },
    });
  }

  async createVerificationCode(data: {
    usuario_id: number;
    codigo: string;
    tipo: string;
    fecha_expiracion: Date;
  }): Promise<VerificationCode> {
    // Invalidar códigos anteriores del mismo tipo
    await this.prisma.verificationCode.updateMany({
      where: {
        usuario_id: data.usuario_id,
        tipo: data.tipo,
        usado: false,
      },
      data: {
        usado: true,
        fecha_uso: new Date(),
      },
    });

    return this.prisma.verificationCode.create({
      data,
    });
  }

  async findValidVerificationCode(
    usuario_id: number,
    codigo: string,
    tipo: string,
  ): Promise<VerificationCode | null> {
    return this.prisma.verificationCode.findFirst({
      where: {
        usuario_id,
        codigo,
        tipo,
        usado: false,
        fecha_expiracion: {
          gt: new Date(),
        },
      },
    });
  }

  async markCodeAsUsed(codeId: string): Promise<VerificationCode> {
    return this.prisma.verificationCode.update({
      where: { id: codeId },
      data: {
        usado: true,
        fecha_uso: new Date(),
      },
    });
  }

  async getUserAccessLogs(userId: number, limit: number = 10) {
    return this.prisma.refreshToken.findMany({
      where: {
        usuario_id: userId,
        activo: false, // Tokens inactivos representan accesos anteriores
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
      take: limit,
      select: {
        ip_origen: true,
        user_agent: true,
        fecha_creacion: true,
      },
    });
  }

  async updateLastAccess(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ultimo_acceso: new Date(),
      },
    });
  }
}
