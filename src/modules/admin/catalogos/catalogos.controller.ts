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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CatalogosService } from './catalogos.service';
import { CreateCatalogoDto } from './dto/create-catalogo.dto';
import { UpdateCatalogoDto } from './dto/update-catalogo.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { TransformInterceptor } from '../../../common/interceptors/response.interceptor';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Catalogos')
@ApiBearerAuth()
@Controller('admin/catalogos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(TransformInterceptor)
@UseInterceptors(ClassSerializerInterceptor)
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  @Post()
  @Permissions('ROL_GESTIONAR')
  @ApiOperation({ summary: 'Crear un nuevo catálogo' })
  @ApiResponse({ status: 201, description: 'Catálogo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  create(@Body() createCatalogoDto: CreateCatalogoDto, @CurrentUser() user: User) {
    return this.catalogosService.create(createCatalogoDto, user);
  }
  @Public()
  @Get()
  //@Permissions('REPORTE_VER')
  @ApiOperation({ summary: 'Obtener todos los catálogos' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Número de registros a saltar' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Número de registros a tomar' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Término de búsqueda por nombre' })
  @ApiResponse({ status: 200, description: 'Lista de catálogos obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
  ) {
    const params: any = {};
    
    if (skip) params.skip = parseInt(skip, 10);
    if (take) params.take = parseInt(take, 10);
    
    if (search) {
      params.where = {
        nombre: {
          contains: search,
        },
        activo: true,
      };
    } else {
      params.where = { activo: true };
    }
    
    params.orderBy = { nombre: 'asc' };
    
    return this.catalogosService.findAll(params);
  }

  @Get('periodicidades')
  @Permissions('REPORTE_VER')
  @ApiOperation({ summary: 'Obtener todas las periodicidades activas' })
  @ApiResponse({ status: 200, description: 'Lista de periodicidades activas obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  obtenerPeriodicidades() {
    return this.catalogosService.obtenerPeriodicidades();
  }

  @Get('raices')
  @Permissions('REPORTE_VER')
  @ApiOperation({ summary: 'Obtener catálogos raíz (sin padre)' })
  @ApiResponse({ status: 200, description: 'Catálogos raíz obtenidos exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  findRootCatalogs() {
    return this.catalogosService.findRootCatalogs();
  }

  @Get('arbol')
  @Permissions('REPORTE_VER')
  @ApiOperation({ summary: 'Obtener árbol completo de catálogos' })
  @ApiQuery({ name: 'parentId', required: false, type: String, description: 'ID del catálogo padre para obtener subárbol' })
  @ApiResponse({ status: 200, description: 'Árbol de catálogos obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  findTree(@Query('parentId') parentId?: string) {
    const parentIdNum = parentId ? parseInt(parentId, 10) : undefined;
    return this.catalogosService.findTree(parentIdNum);
  }

  @Get(':id')
  @Permissions('REPORTE_VER')
  @ApiOperation({ summary: 'Obtener un catálogo por ID' })
  @ApiParam({ name: 'id', description: 'ID del catálogo' })
  @ApiResponse({ status: 200, description: 'Catálogo obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Catálogo no encontrado' })
  findOne(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    return this.catalogosService.findOne(idNum);
  }

  @Get(':id/hijos')
  @Permissions('REPORTE_VER')
  @ApiOperation({ summary: 'Obtener hijos de un catálogo' })
  @ApiParam({ name: 'id', description: 'ID del catálogo padre' })
  @ApiResponse({ status: 200, description: 'Hijos del catálogo obtenidos exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Catálogo padre no encontrado' })
  findChildren(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    return this.catalogosService.findChildren(idNum);
  }

  @Get(':id/with-children')
  @Permissions('REPORTE_VER')
  @ApiOperation({ summary: 'Obtener catálogo con todos sus hijos anidados' })
  @ApiParam({ name: 'id', description: 'ID del catálogo' })
  @ApiResponse({ status: 200, description: 'Catálogo con hijos obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Catálogo no encontrado' })
  findCatalogWithChildren(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    return this.catalogosService.findCatalogWithChildren(idNum);
  }

  @Get(':id/document-availability')
  @Permissions('REPORTE_VER')
  @ApiOperation({ summary: 'Obtener disponibilidad de documentos de un catálogo' })
  @ApiParam({ name: 'id', description: 'ID del catálogo' })
  @ApiResponse({ status: 200, description: 'Disponibilidad de documentos obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Catálogo no encontrado' })
  findDocumentAvailability(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    return this.catalogosService.findDocumentAvailability(idNum);
  }

  @Patch(':id')
  @Permissions('ROL_GESTIONAR')
  @ApiOperation({ summary: 'Actualizar un catálogo' })
  @ApiParam({ name: 'id', description: 'ID del catálogo' })
  @ApiResponse({ status: 200, description: 'Catálogo actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Catálogo no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateCatalogoDto: UpdateCatalogoDto,
    @CurrentUser() user: User,
  ) {
    const idNum = parseInt(id, 10);
    return this.catalogosService.update(idNum, updateCatalogoDto, user);
  }

  @Delete(':id')
  @Permissions('ROL_GESTIONAR')
  @ApiOperation({ summary: 'Eliminar (desactivar) un catálogo' })
  @ApiParam({ name: 'id', description: 'ID del catálogo' })
  @ApiResponse({ status: 200, description: 'Catálogo eliminado exitosamente' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar el catálogo' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Catálogo no encontrado' })
  remove(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    return this.catalogosService.remove(idNum);
  }

  @Get('buscar/:nombre')
  @Permissions('REPORTE_VER')
  @ApiOperation({ summary: 'Buscar catálogos por nombre' })
  @ApiParam({ name: 'nombre', description: 'Nombre o parte del nombre a buscar' })
  @ApiResponse({ status: 200, description: 'Resultados de búsqueda obtenidos exitosamente' })
  @ApiResponse({ status: 400, description: 'Término de búsqueda inválido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  searchByName(@Param('nombre') nombre: string) {
    return this.catalogosService.searchByName(nombre);
  }

  @Get('estadisticas/total')
  @Permissions('REPORTE_VER')
  @ApiOperation({ summary: 'Obtener estadísticas de catálogos' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  async getStats() {
    const total = await this.catalogosService.count();
    return { total };
  }

  @Patch(':id/orden/:orden')
  @Permissions('ROL_GESTIONAR')
  @ApiOperation({ summary: 'Actualizar orden de un catálogo' })
  @ApiParam({ name: 'id', description: 'ID del catálogo' })
  @ApiParam({ name: 'orden', description: 'Nuevo orden' })
  @ApiResponse({ status: 200, description: 'Orden actualizado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Catálogo no encontrado' })
  updateOrden(
    @Param('id') id: string,
    @Param('orden') orden: string,
  ) {
    const idNum = parseInt(id, 10);
    return this.catalogosService.updateOrden(idNum, parseInt(orden, 10));
  }
}
