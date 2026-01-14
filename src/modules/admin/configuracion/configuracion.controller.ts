import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ConfiguracionService } from './configuracion.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { TransformInterceptor } from '../../../common/interceptors/response.interceptor';

@ApiTags('Configuración de Usuario')
@ApiBearerAuth()
@Controller('admin/configuracion')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@UseInterceptors(ClassSerializerInterceptor)
export class ConfiguracionController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  @Get('perfil')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  getProfile(@CurrentUser() user: User) {
    return this.configuracionService.getProfile(user.id);
  }

  @Patch('perfil')
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para actualizar este perfil' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() user: User,
  ) {
    return this.configuracionService.updateProfile(user.id, updateProfileDto, user);
  }

  @Post('cambio-contrasena/solicitar')
  @ApiOperation({ summary: 'Solicitar cambio de contraseña (Paso 1)' })
  @ApiResponse({ status: 200, description: 'Código de verificación generado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  requestPasswordChange(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: User,
  ) {
    return this.configuracionService.requestPasswordChange(user.id, changePasswordDto);
  }

  @Post('cambio-contrasena/verificar')
  @ApiOperation({ summary: 'Verificar código y cambiar contraseña (Paso 2)' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Código inválido o datos incorrectos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  verifyAndChangePassword(
    @Body() verifyCodeDto: VerifyCodeDto,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: User,
  ) {
    return this.configuracionService.verifyAndChangePassword(
      user.id,
      verifyCodeDto,
      changePasswordDto,
    );
  }

  @Get('accesos')
  @ApiOperation({ summary: 'Obtener historial de accesos del usuario' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de registros (default: 10)' })
  @ApiResponse({ status: 200, description: 'Historial de accesos obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  getAccessLogs(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.configuracionService.getAccessLogs(user.id, limitNum);
  }

  @Patch('2fa/:accion')
  @ApiOperation({ summary: 'Habilitar/deshabilitar verificación en dos pasos (2FA)' })
  @ApiParam({ name: 'accion', description: 'Acción a realizar: "habilitar" o "deshabilitar"' })
  @ApiResponse({ status: 200, description: '2FA actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Acción inválida' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  toggle2FA(
    @Param('accion') accion: string,
    @CurrentUser() user: User,
  ) {
    if (accion !== 'habilitar' && accion !== 'deshabilitar') {
      throw new Error('Acción inválida. Use "habilitar" o "deshabilitar"');
    }

    const enable = accion === 'habilitar';
    return this.configuracionService.toggle2FA(user.id, enable);
  }

  @Get('perfil/:userId')
  @ApiOperation({ summary: 'Obtener perfil de otro usuario (solo administradores)' })
  @ApiParam({ name: 'userId', description: 'ID del usuario a consultar' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  getOtherUserProfile(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: User,
  ) {
    // Verificar si el usuario actual tiene permisos de administrador
    // Esta lógica debería implementarse con un guard de permisos
    // Por ahora, verificamos si tiene roles de administrador
    const userRoles = currentUser.roles || [];
    const isAdmin = userRoles.some((role: any) => 
      role.rol?.nombre === 'ADMIN' || role.rol?.nombre === 'SUPERADMIN'
    );

    if (!isAdmin) {
      throw new Error('No tiene permisos para ver perfiles de otros usuarios');
    }

    const userIdNum = parseInt(userId, 10);
    return this.configuracionService.getProfile(userIdNum);
  }
}
