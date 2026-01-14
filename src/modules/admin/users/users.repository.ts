import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    includeRoles?: boolean;
  }): Promise<User[]> {
    const { includeRoles, ...restParams } = params || {};
    const include = includeRoles ? { roles: { include: { rol: true } } } : undefined;
    
    const users = await this.prisma.user.findMany({
      ...restParams,
      include,
    });

    // Si se incluyen roles, transformar la estructura para devolver solo los roles
    if (includeRoles) {
      return users.map(user => {
        const userWithRoles = user as any;
        return {
          ...user,
          roles: userWithRoles.roles?.map((usuarioRol: any) => usuarioRol.rol) || []
        };
      });
    }

    return users;
  }

  async findOne(where: Prisma.UserWhereUniqueInput, includeRoles: boolean = false): Promise<User | null> {
    const include = includeRoles ? { roles: { include: { rol: true } } } : undefined;
    
    const user = await this.prisma.user.findUnique({
      where,
      include,
    });

    if (!user) return null;

    // Si se incluyen roles, transformar la estructura para devolver solo los roles
    if (includeRoles) {
      const userWithRoles = user as any;
      return {
        ...user,
        roles: userWithRoles.roles?.map((usuarioRol: any) => usuarioRol.rol) || []
      };
    }

    return user;
  }

  async create(data: Prisma.UserCreateInput, roleIds?: number[]): Promise<User> {
    const userData = { ...data };
    
    if (roleIds && roleIds.length > 0) {
      userData.roles = {
        create: roleIds.map(rolId => ({
          rol: { connect: { id: rolId } },
        })),
      };
    }

    const user = await this.prisma.user.create({
      data: userData,
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });

    // Transformar la estructura para devolver solo los roles
    const userWithRoles = user as any;
    return {
      ...user,
      roles: userWithRoles.roles?.map((usuarioRol: any) => usuarioRol.rol) || []
    };
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
    roleIds?: number[],
  ): Promise<User> {
    // Si se proporcionan roleIds, actualizar los roles
    if (roleIds !== undefined) {
      // Eliminar roles existentes
      await this.prisma.usuarioRol.deleteMany({
        where: { usuario_id: where.id as number },
      });

      // Crear nuevos roles si hay IDs
      if (roleIds.length > 0) {
        data.roles = {
          create: roleIds.map(rolId => ({
            rol: { connect: { id: rolId } },
          })),
        };
      }
    }

    const user = await this.prisma.user.update({
      where,
      data,
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });

    // Transformar la estructura para devolver solo los roles
    const userWithRoles = user as any;
    return {
      ...user,
      roles: userWithRoles.roles?.map((usuarioRol: any) => usuarioRol.rol) || []
    };
  }

  async softDelete(id: number): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { activo: false },
    });
  }

  async restore(id: number): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { activo: true },
    });
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({ where });
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return this.prisma.user.count({ where });
  }

  async findByEmail(email: string, includeRoles: boolean = false): Promise<User | null> {
    const include = includeRoles ? { roles: { include: { rol: true } } } : undefined;
    
    const user = await this.prisma.user.findUnique({
      where: { email },
      include,
    });

    if (!user) return null;

    // Si se incluyen roles, transformar la estructura para devolver solo los roles
    if (includeRoles) {
      const userWithRoles = user as any;
      return {
        ...user,
        roles: userWithRoles.roles?.map((usuarioRol: any) => usuarioRol.rol) || []
      };
    }

    return user;
  }

  async updatePassword(userId: number, newPassword: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        fecha_ultimo_cambio_pass: new Date(),
      },
    });
  }

  async forcePasswordReset(userId: number): Promise<User> {
    // Generar una contraseña temporal
    const tempPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        fecha_ultimo_cambio_pass: new Date(),
      },
    });
  }

  async getUserWithRoles(userId: number): Promise<(User & { roles: any[] }) | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });

    if (!user) return null;

    // Transformar la estructura para devolver solo los roles
    const userWithRoles = user as any;
    return {
      ...user,
      roles: userWithRoles.roles?.map((usuarioRol: any) => usuarioRol.rol) || []
    };
  }

  async getUsersByRole(roleId: number): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        roles: {
          some: {
            rol_id: roleId,
          },
        },
        activo: true,
      },
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });

    // Transformar la estructura para devolver solo los roles
    return users.map(user => {
      const userWithRoles = user as any;
      return {
        ...user,
        roles: userWithRoles.roles?.map((usuarioRol: any) => usuarioRol.rol) || []
      };
    });
  }

  async getSystemMetrics() {
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({ where: { activo: true } });
    const inactiveUsers = await this.prisma.user.count({ where: { activo: false } });
    const usersWith2FA = await this.prisma.user.count({ where: { requiere_2fa: true } });
    
    // Usuarios por rol
    const usersByRole = await this.prisma.rol.findMany({
      include: {
        usuarios: {
          include: {
            usuario: true,
          },
        },
      },
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersWith2FA,
      usersByRole: usersByRole.map(role => ({
        roleName: role.nombre,
        userCount: role.usuarios.length,
      })),
    };
  }

  async getPermissionsMatrix() {
    const rolesWithPermissions = await this.prisma.rol.findMany({
      include: {
        permisos: {
          include: {
            permiso: true,
          },
        },
      },
    });

    return rolesWithPermissions.map(role => ({
      roleId: role.id,
      roleName: role.nombre,
      permissions: role.permisos.map(rp => ({
        permissionId: rp.permiso.id,
        permissionCode: rp.permiso.codigo,
        permissionDescription: rp.permiso.descripcion,
      })),
    }));
  }

  async findAllRoles(params?: {
    activo?: boolean;
  }): Promise<any[]> {
    const where: any = {};
    
    if (params?.activo !== undefined) {
      where.activo = params.activo;
    }

    return this.prisma.rol.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });
  }

  private generateTemporaryPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }
}
