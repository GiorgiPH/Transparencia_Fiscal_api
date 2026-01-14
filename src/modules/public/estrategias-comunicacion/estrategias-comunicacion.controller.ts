import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { EstrategiasComunicacionService } from './estrategias-comunicacion.service';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';
import { CreateRedSocialDto } from './dto/create-red-social.dto';
import { UpdateRedSocialDto } from './dto/update-red-social.dto';
import { Noticia } from './entities/noticia.entity';
import { RedSocial } from './entities/red-social.entity';
import { Public } from '../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@ApiTags('Estrategias de Comunicación')
@Controller('estrategias-comunicacion')
export class EstrategiasComunicacionController {
  constructor(
    private readonly estrategiasComunicacionService: EstrategiasComunicacionService,
  ) {}

  // Endpoints públicos para Noticias

  @Public()
  @Get('noticias')
  @ApiOperation({ summary: 'Obtener listado de noticias activas (público)' })
  @ApiQuery({ name: 'skip', required: false, description: 'Número de registros a saltar' })
  @ApiQuery({ name: 'take', required: false, description: 'Número de registros a tomar' })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda en título, descripción o contenido' })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Campo para ordenar', enum: ['fecha_publicacion', 'fecha_creacion'] })
  @ApiQuery({ name: 'order', required: false, description: 'Orden ascendente o descendente', enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'Listado de noticias activas',
    type: [Noticia],
  })
  async getNoticiasPublicas(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: 'fecha_publicacion' | 'fecha_creacion',
    @Query('order') order?: 'asc' | 'desc',
  ): Promise<Noticia[]> {
    return this.estrategiasComunicacionService.findAllNoticias({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      activo: true, // Solo noticias activas para el público
      search,
      orderBy,
      order,
    });
  }

  @Public()
  @Get('noticias/recientes')
  @ApiOperation({ summary: 'Obtener noticias recientes activas (público)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de noticias' })
  @ApiResponse({
    status: 200,
    description: 'Noticias recientes activas',
    type: [Noticia],
  })
  async getNoticiasRecientesPublicas(@Query('limit') limit?: string): Promise<Noticia[]> {
    return this.estrategiasComunicacionService.getNoticiasRecientes(
      limit ? parseInt(limit, 10) : 5,
    );
  }

  @Public()
  @Get('noticias/:id')
  @ApiOperation({ summary: 'Obtener detalle de una noticia activa (público)' })
  @ApiParam({ name: 'id', description: 'ID de la noticia' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la noticia',
    type: Noticia,
  })
  @ApiResponse({ status: 404, description: 'Noticia no encontrada o inactiva' })
  async getNoticiaPublica(@Param('id', ParseIntPipe) id: number): Promise<Noticia> {
    const noticia = await this.estrategiasComunicacionService.findNoticiaById(id);
    if (!noticia.activo) {
      throw new Error('Noticia no disponible');
    }
    return noticia;
  }

  @Public()
  @Get('redes-sociales')
  @ApiOperation({ summary: 'Obtener listado de redes sociales activas (público)' })
  @ApiResponse({
    status: 200,
    description: 'Listado de redes sociales activas',
    type: [RedSocial],
  })
  async getRedesSocialesPublicas(): Promise<RedSocial[]> {
    return this.estrategiasComunicacionService.findAllRedesSociales({
      activo: true, // Solo redes sociales activas para el público
      orderBy: 'orden',
      order: 'asc',
    });
  }

  // Endpoints administrativos para Noticias (requieren autenticación)

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Get('admin/noticias')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener listado completo de noticias (administrativo)' })
  @ApiQuery({ name: 'skip', required: false, description: 'Número de registros a saltar' })
  @ApiQuery({ name: 'take', required: false, description: 'Número de registros a tomar' })
  @ApiQuery({ name: 'activo', required: false, description: 'Filtrar por estado activo/inactivo' })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda en título, descripción o contenido' })
  @ApiResponse({
    status: 200,
    description: 'Listado completo de noticias',
    type: [Noticia],
  })
  async getAllNoticias(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('activo') activo?: string,
    @Query('search') search?: string,
  ): Promise<Noticia[]> {
    return this.estrategiasComunicacionService.findAllNoticias({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      activo: activo ? activo === 'true' : undefined,
      search,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Post('admin/noticias')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva noticia (administrativo)' })
  @ApiResponse({
    status: 201,
    description: 'Noticia creada exitosamente',
    type: Noticia,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async createNoticia(@Body() createNoticiaDto: CreateNoticiaDto): Promise<Noticia> {
    return this.estrategiasComunicacionService.createNoticia(createNoticiaDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Get('admin/noticias/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener detalle de una noticia (administrativo)' })
  @ApiParam({ name: 'id', description: 'ID de la noticia' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la noticia',
    type: Noticia,
  })
  @ApiResponse({ status: 404, description: 'Noticia no encontrada' })
  async getNoticia(@Param('id', ParseIntPipe) id: number): Promise<Noticia> {
    return this.estrategiasComunicacionService.findNoticiaById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Patch('admin/noticias/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una noticia (administrativo)' })
  @ApiParam({ name: 'id', description: 'ID de la noticia' })
  @ApiResponse({
    status: 200,
    description: 'Noticia actualizada exitosamente',
    type: Noticia,
  })
  @ApiResponse({ status: 404, description: 'Noticia no encontrada' })
  async updateNoticia(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNoticiaDto: UpdateNoticiaDto,
  ): Promise<Noticia> {
    return this.estrategiasComunicacionService.updateNoticia(id, updateNoticiaDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Patch('admin/noticias/:id/activo')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar/desactivar una noticia (administrativo)' })
  @ApiParam({ name: 'id', description: 'ID de la noticia' })
  @ApiResponse({
    status: 200,
    description: 'Estado de la noticia actualizado',
    type: Noticia,
  })
  @ApiResponse({ status: 404, description: 'Noticia no encontrada' })
  async toggleNoticiaActivo(
    @Param('id', ParseIntPipe) id: number,
    @Body('activo') activo: boolean,
  ): Promise<Noticia> {
    return this.estrategiasComunicacionService.toggleNoticiaActivo(id, activo);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/noticias/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una noticia (requiere rol ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID de la noticia' })
  @ApiResponse({
    status: 200,
    description: 'Noticia eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Noticia no encontrada' })
  async deleteNoticia(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.estrategiasComunicacionService.deleteNoticia(id);
  }

  // Endpoints administrativos para Redes Sociales (requieren autenticación)

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Get('admin/redes-sociales')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener listado completo de redes sociales (administrativo)' })
  @ApiQuery({ name: 'activo', required: false, description: 'Filtrar por estado activo/inactivo' })
  @ApiResponse({
    status: 200,
    description: 'Listado completo de redes sociales',
    type: [RedSocial],
  })
  async getAllRedesSociales(@Query('activo') activo?: string): Promise<RedSocial[]> {
    return this.estrategiasComunicacionService.findAllRedesSociales({
      activo: activo ? activo === 'true' : undefined,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Post('admin/redes-sociales')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva red social (administrativo)' })
  @ApiResponse({
    status: 201,
    description: 'Red social creada exitosamente',
    type: RedSocial,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async createRedSocial(@Body() createRedSocialDto: CreateRedSocialDto): Promise<RedSocial> {
    return this.estrategiasComunicacionService.createRedSocial(createRedSocialDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Get('admin/redes-sociales/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener detalle de una red social (administrativo)' })
  @ApiParam({ name: 'id', description: 'ID de la red social' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la red social',
    type: RedSocial,
  })
  @ApiResponse({ status: 404, description: 'Red social no encontrada' })
  async getRedSocial(@Param('id', ParseIntPipe) id: number): Promise<RedSocial> {
    return this.estrategiasComunicacionService.findRedSocialById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Patch('admin/redes-sociales/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una red social (administrativo)' })
  @ApiParam({ name: 'id', description: 'ID de la red social' })
  @ApiResponse({
    status: 200,
    description: 'Red social actualizada exitosamente',
    type: RedSocial,
  })
  @ApiResponse({ status: 404, description: 'Red social no encontrada' })
  async updateRedSocial(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRedSocialDto: UpdateRedSocialDto,
  ): Promise<RedSocial> {
    return this.estrategiasComunicacionService.updateRedSocial(id, updateRedSocialDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Patch('admin/redes-sociales/:id/activo')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar/desactivar una red social (administrativo)' })
  @ApiParam({ name: 'id', description: 'ID de la red social' })
  @ApiResponse({
    status: 200,
    description: 'Estado de la red social actualizado',
    type: RedSocial,
  })
  @ApiResponse({ status: 404, description: 'Red social no encontrada' })
  async toggleRedSocialActivo(
    @Param('id', ParseIntPipe) id: number,
    @Body('activo') activo: boolean,
  ): Promise<RedSocial> {
    return this.estrategiasComunicacionService.toggleRedSocialActivo(id, activo);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/redes-sociales/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una red social (requiere rol ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID de la red social' })
  @ApiResponse({
    status: 200,
    description: 'Red social eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Red social no encontrada' })
  async deleteRedSocial(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.estrategiasComunicacionService.deleteRedSocial(id);
  }

  // Endpoints para estadísticas (requieren autenticación)

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Get('admin/estadisticas')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas del módulo (administrativo)' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del módulo',
  })
  async getEstadisticas() {
    return this.estrategiasComunicacionService.getEstadisticas();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Get('admin/noticias/count')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Contar noticias (administrativo)' })
  @ApiQuery({ name: 'activo', required: false, description: 'Filtrar por estado activo/inactivo' })
  @ApiResponse({
    status: 200,
    description: 'Número de noticias',
    type: Number,
  })
  async countNoticias(@Query('activo') activo?: string): Promise<number> {
    return this.estrategiasComunicacionService.countNoticias(
      activo ? activo === 'true' : undefined,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Get('admin/redes-sociales/count')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Contar redes sociales (administrativo)' })
  @ApiQuery({ name: 'activo', required: false, description: 'Filtrar por estado activo/inactivo' })
  @ApiResponse({
    status: 200,
    description: 'Número de redes sociales',
    type: Number,
  })
  async countRedesSociales(@Query('activo') activo?: string): Promise<number> {
    return this.estrategiasComunicacionService.countRedesSociales(
      activo ? activo === 'true' : undefined,
    );
  }
}
