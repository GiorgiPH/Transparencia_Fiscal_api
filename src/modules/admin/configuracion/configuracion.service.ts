import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfiguracionRepository } from './configuracion.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ConfiguracionService {
  constructor(private readonly configuracionRepository: ConfiguracionRepository) {}

  async getProfile(userId: number) {
    const user = await this.configuracionRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Actualizar último acceso
    await this.configuracionRepository.updateLastAccess(userId);

    // Type assertion para manejar la relación roles
    const userWithRoles = user as any;
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      foto_perfil: user.foto_perfil,
      area_departamento: user.area_departamento,
      telefono: user.telefono,
      requiere_2fa: user.requiere_2fa,
      activo: user.activo,
      ultimo_acceso: user.ultimo_acceso,
      fecha_creacion: user.fecha_creacion,
      fecha_modificacion: user.fecha_modificacion,
      roles: userWithRoles.roles ? userWithRoles.roles.map((ur: any) => ur.rol) : [],
    };
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto, currentUser: User) {
    const user = await this.configuracionRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que el usuario solo pueda actualizar su propio perfil
    if (user.id !== currentUser.id) {
      throw new ForbiddenException('No tiene permisos para actualizar este perfil');
    }

    const data: any = {
      usuario_modif_id: userId,
    };

    if (updateProfileDto.name !== undefined) {
      data.name = updateProfileDto.name;
    }

    if (updateProfileDto.foto_perfil !== undefined) {
      // Validar formato de imagen (solo JPG/PNG)
      if (updateProfileDto.foto_perfil) {
        const validExtensions = ['.jpg', '.jpeg', '.png'];
        const hasValidExtension = validExtensions.some(ext => 
          updateProfileDto.foto_perfil!.toLowerCase().endsWith(ext)
        );
        
        if (!hasValidExtension) {
          throw new BadRequestException('La foto de perfil debe ser JPG o PNG');
        }
      }
      data.foto_perfil = updateProfileDto.foto_perfil;
    }

    if (updateProfileDto.area_departamento !== undefined) {
      data.area_departamento = updateProfileDto.area_departamento;
    }

    if (updateProfileDto.telefono !== undefined) {
      data.telefono = updateProfileDto.telefono;
    }

    const updatedUser = await this.configuracionRepository.updateUser(userId, data);
    
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      foto_perfil: updatedUser.foto_perfil,
      area_departamento: updatedUser.area_departamento,
      telefono: updatedUser.telefono,
      fecha_modificacion: updatedUser.fecha_modificacion,
    };
  }

  async requestPasswordChange(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.configuracionRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Validar contraseña actual
    const isValidPassword = await this.configuracionRepository.verifyPassword(
      userId,
      changePasswordDto.currentPassword,
    );

    if (!isValidPassword) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Validar que la nueva contraseña sea diferente a la actual
    if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
      throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
    }

    // Validar confirmación de contraseña
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Generar código de verificación
    const code = this.generateVerificationCode();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 5); // 5 minutos de validez

    await this.configuracionRepository.createVerificationCode({
      usuario_id: userId,
      codigo: code,
      tipo: 'password_change',
      fecha_expiracion: expirationDate,
    });

    // En un entorno real, aquí se enviaría el código por correo
    // Por ahora, lo retornamos para pruebas
    return {
      message: 'Código de verificación generado',
      code: code, // Solo para desarrollo, en producción no se debe retornar
      expiresAt: expirationDate,
    };
  }

  async verifyAndChangePassword(
    userId: number,
    verifyCodeDto: VerifyCodeDto,
    changePasswordDto: ChangePasswordDto,
  ) {
    const user = await this.configuracionRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Buscar código válido
    const validCode = await this.configuracionRepository.findValidVerificationCode(
      userId,
      verifyCodeDto.code,
      'password_change',
    );

    if (!validCode) {
      throw new BadRequestException('Código de verificación inválido o expirado');
    }

    // Validar contraseña actual (nuevamente por seguridad)
    const isValidPassword = await this.configuracionRepository.verifyPassword(
      userId,
      changePasswordDto.currentPassword,
    );

    if (!isValidPassword) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Validar confirmación de contraseña
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Marcar código como usado
    await this.configuracionRepository.markCodeAsUsed(validCode.id);

    // Actualizar contraseña
    const updatedUser = await this.configuracionRepository.updatePassword(
      userId,
      changePasswordDto.newPassword,
    );

    return {
      message: 'Contraseña actualizada exitosamente',
      userId: updatedUser.id,
      updatedAt: updatedUser.fecha_modificacion,
    };
  }

  async getAccessLogs(userId: number, limit?: number) {
    const user = await this.configuracionRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const logs = await this.configuracionRepository.getUserAccessLogs(userId, limit);
    
    return logs.map(log => ({
      ip: log.ip_origen,
      userAgent: log.user_agent,
      fecha: log.fecha_creacion,
    }));
  }

  async toggle2FA(userId: number, enable: boolean) {
    const user = await this.configuracionRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updatedUser = await this.configuracionRepository.updateUser(userId, {
      requiere_2fa: enable,
      usuario_modif_id: userId,
    });

    return {
      message: enable ? '2FA habilitado' : '2FA deshabilitado',
      requiere_2fa: updatedUser.requiere_2fa,
    };
  }

  private generateVerificationCode(): string {
    // Generar código de 6 dígitos
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
