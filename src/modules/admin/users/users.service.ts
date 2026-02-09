import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { FileUploadService } from '../../../common/services/file-upload.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(createUserDto: CreateUserDto, currentUserId: number): Promise<User> {
    // Verificar si el correo ya existe
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Preparar datos del usuario
    const userData = {
      email: createUserDto.email,
      password: hashedPassword,
      name: createUserDto.name,
      dependenciaId: createUserDto.dependenciaId,
      area_departamento: createUserDto.area_departamento,
      telefono: createUserDto.telefono,
      requiere_2fa: createUserDto.requiere_2fa ?? false,
      usuario_creacion_id: currentUserId,
      fecha_ultimo_cambio_pass: new Date(),
    };

    // Crear usuario con roles si se especifican
    const user = await this.usersRepository.create(userData, createUserDto.roleIds);

    // Ocultar contraseña en la respuesta
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    search?: string;
    activo?: boolean;
    includeRoles?: boolean;
  }): Promise<User[]> {
    const where: any = {};

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.activo !== undefined) {
      where.activo = params.activo;
    }

    const users = await this.usersRepository.findAll({
      skip: params?.skip,
      take: params?.take,
      where,
      orderBy: { fecha_creacion: 'desc' },
      includeRoles: params?.includeRoles,
    });

    // Ocultar contraseñas en la respuesta
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  async findOne(id: number, includeRoles: boolean = false): Promise<User> {
    const user = await this.usersRepository.findOne({ id }, includeRoles);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Ocultar contraseña en la respuesta
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async update(id: number, updateUserDto: UpdateUserDto, currentUserId: number): Promise<User> {
    // Verificar si el usuario existe
    const existingUser = await this.usersRepository.findOne({ id });
    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si se está intentando cambiar el correo y si ya existe
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.usersRepository.findByEmail(updateUserDto.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
    }

    // Preparar datos de actualización
    const updateData: any = {
      usuario_modif_id: currentUserId,
    };

    if (updateUserDto.name !== undefined) updateData.name = updateUserDto.name;
    if (updateUserDto.email !== undefined) updateData.email = updateUserDto.email;
    if (updateUserDto.dependenciaId !== undefined) updateData.dependenciaId = updateUserDto.dependenciaId;
    if (updateUserDto.area_departamento !== undefined) updateData.area_departamento = updateUserDto.area_departamento;
    if (updateUserDto.telefono !== undefined) updateData.telefono = updateUserDto.telefono;
    if (updateUserDto.requiere_2fa !== undefined) updateData.requiere_2fa = updateUserDto.requiere_2fa;
    if (updateUserDto.activo !== undefined) updateData.activo = updateUserDto.activo;
    if (updateUserDto.foto_perfil !== undefined) updateData.foto_perfil = updateUserDto.foto_perfil;

    // Actualizar usuario
    const updatedUser = await this.usersRepository.update(
      { id },
      updateData,
      updateUserDto.roleIds,
    );

    // Ocultar contraseña en la respuesta
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ id });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Soft delete
    await this.usersRepository.softDelete(id);
  }

  async restore(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ id });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const restoredUser = await this.usersRepository.restore(id);
    
    // Ocultar contraseña en la respuesta
    const { password, ...userWithoutPassword } = restoredUser;
    return userWithoutPassword as User;
  }

  async forcePasswordReset(id: number): Promise<{ message: string; temporaryPassword?: string }> {
    const user = await this.usersRepository.findOne({ id });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Forzar restablecimiento de contraseña
    const updatedUser = await this.usersRepository.forcePasswordReset(id);

    // En un entorno real, aquí se enviaría la contraseña temporal por correo
    // Por ahora, retornamos un mensaje (en producción no se debe retornar la contraseña)
    return {
      message: 'Contraseña restablecida exitosamente. Se ha generado una contraseña temporal.',
      // Nota: En producción, NO retornar la contraseña temporal
      // temporaryPassword: 'Solo para desarrollo - enviar por correo en producción',
    };
  }

  async getSystemMetrics() {
    return this.usersRepository.getSystemMetrics();
  }

  async getPermissionsMatrix() {
    return this.usersRepository.getPermissionsMatrix();
  }

  async getUsersByRole(roleId: number): Promise<User[]> {
    const users = await this.usersRepository.getUsersByRole(roleId);
    
    // Ocultar contraseñas en la respuesta
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  async count(params?: { activo?: boolean }): Promise<number> {
    const where: any = {};
    if (params?.activo !== undefined) {
      where.activo = params.activo;
    }
    return this.usersRepository.count(where);
  }

  async validateAdminPermission(currentUserId: number): Promise<boolean> {
    // Esta función debería implementarse con un guard de permisos
    // Por ahora, retornamos true para propósitos de desarrollo
    // En producción, verificar si el usuario actual tiene rol de administrador
    return true;
  }

  async getAllRoles(params?: { activo?: boolean }): Promise<any[]> {
    return this.usersRepository.findAllRoles(params);
  }
}
