import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserFormDto } from './dto/create-user-form.dto';
import { UpdateUserFormDto } from './dto/update-user-form.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { TransformInterceptor } from '../../../common/interceptors/response.interceptor';
import { FileUploadService } from '../../../common/services/file-upload.service';

@ApiTags('Gestión de Usuarios')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
@UseInterceptors(ClassSerializerInterceptor)
@Roles('ADMIN')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario (FormData)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateUserFormDto })
  @UseInterceptors(FileInterceptor('foto_perfil'))
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El correo electrónico ya está registrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  async create(
    @Body() createUserFormDto: CreateUserFormDto,
    @CurrentUser() currentUser: User,
    @UploadedFile() foto_perfil?: any,
  ) {
    // Convertir FormData a CreateUserDto
    const createUserDto: CreateUserDto = {
      name: createUserFormDto.name,
      email: createUserFormDto.email,
      password: createUserFormDto.password,
      dependenciaId: createUserFormDto.dependenciaId,
      telefono: createUserFormDto.telefono,
      roleIds: createUserFormDto.roleIds,
      requiere_2fa: createUserFormDto.requiere_2fa,
      activo: createUserFormDto.activo,
    };

    // Si hay archivo, subirlo y agregar la ruta al DTO
    if (foto_perfil) {
      const uploadedFile = await this.fileUploadService.uploadFile({
        file: foto_perfil,
        subdirectory: 'users',
        customName: `user-${Date.now()}`,
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
      });
      createUserDto.foto_perfil = uploadedFile.relativePath;
    }

    return this.usersService.create(createUserDto, currentUser.id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de usuarios' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Número de registros a omitir' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Número de registros a tomar' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Texto para búsqueda (nombre o email)' })
  @ApiQuery({ name: 'activo', required: false, type: Boolean, description: 'Filtrar por estado activo/inactivo' })
  @ApiQuery({ name: 'includeRoles', required: false, type: Boolean, description: 'Incluir información de roles' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('activo') activo?: string,
    @Query('includeRoles') includeRoles?: string,
  ) {
    const params = {
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      search,
      activo: activo ? activo === 'true' : undefined,
      includeRoles: includeRoles ? includeRoles === 'true' : false,
    };
    return this.usersService.findAll(params);
  }
  @Get('roles')
  @ApiOperation({ summary: 'Obtener todos los roles disponibles' })
  @ApiQuery({ name: 'activo', required: false, type: Boolean, description: 'Filtrar por estado activo/inactivo' })
  @ApiResponse({ status: 200, description: 'Lista de roles obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  getAllRoles(@Query('activo') activo?: string) {
    const params = {
      activo: activo ? activo === 'true' : undefined,
    };
    return this.usersService.getAllRoles(params);
  }
  @Get('count')
  @ApiOperation({ summary: 'Contar usuarios' })
  @ApiQuery({ name: 'activo', required: false, type: Boolean, description: 'Filtrar por estado activo/inactivo' })
  @ApiResponse({ status: 200, description: 'Conteo de usuarios obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  count(@Query('activo') activo?: string) {
    const params = {
      activo: activo ? activo === 'true' : undefined,
    };
    return this.usersService.count(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiQuery({ name: 'includeRoles', required: false, type: Boolean, description: 'Incluir información de roles' })
  @ApiResponse({ status: 200, description: 'Usuario obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  findOne(
    @Param('id') id: string,
    @Query('includeRoles') includeRoles?: string,
  ) {
    const includeRolesBool = includeRoles ? includeRoles === 'true' : false;
    const userId = parseInt(id, 10);
    return this.usersService.findOne(userId, includeRolesBool);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario (FormData)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateUserFormDto })
  @UseInterceptors(FileInterceptor('foto_perfil'))
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'El correo electrónico ya está registrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  async update(
    @Param('id') id: string,
    @Body() updateUserFormDto: UpdateUserFormDto,
    @CurrentUser() currentUser: User,
    @UploadedFile() foto_perfil?: any,
  ) {
    const userId = parseInt(id, 10);
    
    // Convertir FormData a UpdateUserDto
    const updateUserDto: UpdateUserDto = {
      name: updateUserFormDto.name,
      email: updateUserFormDto.email,
      dependenciaId: updateUserFormDto.dependenciaId,
      area_departamento: updateUserFormDto.area_departamento,
      telefono: updateUserFormDto.telefono,
      roleIds: updateUserFormDto.roleIds,
      requiere_2fa: updateUserFormDto.requiere_2fa,
      activo: updateUserFormDto.activo,
    };

    // Si hay archivo, subirlo y agregar la ruta al DTO
    if (foto_perfil) {
      const uploadedFile = await this.fileUploadService.uploadFile({
        file: foto_perfil,
        subdirectory: 'users',
        customName: `user-${userId}-${Date.now()}`,
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
      });
      updateUserDto.foto_perfil = uploadedFile.relativePath;
    }

    return this.usersService.update(userId, updateUserDto, currentUser.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  remove(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    return this.usersService.remove(userId);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restaurar un usuario eliminado' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario restaurado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  restore(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    return this.usersService.restore(userId);
  }

  @Post(':id/force-password-reset')
  @ApiOperation({ summary: 'Forzar restablecimiento de contraseña' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  forcePasswordReset(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    return this.usersService.forcePasswordReset(userId);
  }

  @Get('role/:roleId')
  @ApiOperation({ summary: 'Obtener usuarios por rol' })
  @ApiParam({ name: 'roleId', description: 'ID del rol' })
  @ApiResponse({ status: 200, description: 'Usuarios obtenidos exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  getUsersByRole(@Param('roleId') roleId: string) {
    const roleIdNum = parseInt(roleId, 10);
    return this.usersService.getUsersByRole(roleIdNum);
  }



  @Get('metrics/system')
  @ApiOperation({ summary: 'Obtener métricas del sistema' })
  @ApiResponse({ status: 200, description: 'Métricas obtenidas exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  getSystemMetrics() {
    return this.usersService.getSystemMetrics();
  }

  @Get('permissions/matrix')
  @ApiOperation({ summary: 'Obtener matriz de permisos por rol' })
  @ApiResponse({ status: 200, description: 'Matriz de permisos obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  getPermissionsMatrix() {
    return this.usersService.getPermissionsMatrix();
  }
}
