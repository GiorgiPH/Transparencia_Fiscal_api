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
  ApiConsumes,
} from '@nestjs/swagger';
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { TransformInterceptor } from '../../../common/interceptors/response.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Documentos')
@ApiBearerAuth()
@Controller('admin/documentos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(TransformInterceptor)
@UseInterceptors(ClassSerializerInterceptor)
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post()
  @Permissions('DOCUMENTO_CARGAR')
  @UseInterceptors(FileInterceptor('archivo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear un nuevo documento con archivo' })
  @ApiResponse({ status: 201, description: 'Documento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Catálogo no encontrado' })
  create(
    @Body() createDocumentoDto: CreateDocumentoDto,
    @UploadedFile() archivo: any,
    @CurrentUser() user: User,
  ) {
    return this.documentosService.createWithFile(createDocumentoDto, archivo, user);
  }

  @Get()
  @Permissions('REPORTE_VER')
  @ApiOperation({ summary: 'Obtener todos los documentos' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Número de registros a saltar' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Número de registros a tomar' })
  @ApiQuery({ name: 'catalogoId', required: false, type: String, description: 'Filtrar por ID de catálogo' })
  @ApiQuery({ name: 'ejercicioFiscal', required: false, type: Number, description: 'Filtrar por ejercicio fiscal' })
  @ApiResponse({ status: 200, description: 'Lista de documentos obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('catalogoId') catalogoId?: number,
    @Query('ejercicioFiscal') ejercicioFiscal?: string,
  ) {
    const params: any = {};
    
    if (skip) params.skip = parseInt(skip, 10);
    if (take) params.take = parseInt(take, 10);
    
    const where: any = { activo: true };
    if (catalogoId) where.catalogo_id = catalogoId;
    if (ejercicioFiscal) where.ejercicio_fiscal = parseInt(ejercicioFiscal, 10);
    
    params.where = where;
    params.orderBy = { fecha_creacion: 'desc' };
    
    return this.documentosService.findAll(params);
  }

  @Get('publicos')
  @ApiOperation({ summary: 'Obtener documentos públicos' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Número de registros a saltar' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Número de registros a tomar' })
  @ApiResponse({ status: 200, description: 'Lista de documentos públicos obtenida exitosamente' })
  findPublicDocuments(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const params: any = {};
    
    if (skip) params.skip = parseInt(skip, 10);
    if (take) params.take = parseInt(take, 10);
    
    params.where = { activo: true };
    params.orderBy = { fecha_creacion: 'desc' };
    
    return this.documentosService.findPublicDocuments(params);
  }

  @Get('catalogo/:catalogoId')
  @Permissions('REPORTE_VER')
  @ApiOperation({ summary: 'Obtener documentos por catálogo' })
  @ApiParam({ name: 'catalogoId', description: 'ID del catálogo' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Número de registros a saltar' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Número de registros a tomar' })
  @ApiResponse({ status: 200, description: 'Documentos del catálogo obtenidos exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Catálogo no encontrado' })
  findByCatalogoId(
    @Param('catalogoId') catalogoId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const params: any = {};
    
    if (skip) params.skip = parseInt(skip, 10);
    if (take) params.take = parseInt(take, 10);
    
    const catalogoIdNum = parseInt(catalogoId, 10);
    return this.documentosService.findByCatalogoId(catalogoIdNum, params);
  }

  @Get('recientes')
  @ApiOperation({ summary: 'Obtener documentos recientes' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de documentos (default: 10)' })
  @ApiResponse({ status: 200, description: 'Documentos recientes obtenidos exitosamente' })
  getRecentDocuments(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.documentosService.getRecentDocuments(limitNum);
  }

  @Get('buscar')
  @Permissions('REPORTE_VER')
  @ApiOperation({ summary: 'Buscar documentos' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Término de búsqueda' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Número de registros a saltar' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Número de registros a tomar' })
  @ApiQuery({ name: 'catalogoId', required: false, type: String, description: 'Filtrar por ID de catálogo' })
  @ApiQuery({ name: 'ejercicioFiscal', required: false, type: Number, description: 'Filtrar por ejercicio fiscal' })
  @ApiResponse({ status: 200, description: 'Resultados de búsqueda obtenidos exitosamente' })
  @ApiResponse({ status: 400, description: 'Término de búsqueda inválido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  search(
    @Query('q') query: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('catalogoId') catalogoId?: string,
    @Query('ejercicioFiscal') ejercicioFiscal?: string,
  ) {
    const params: any = {
      query,
    };
    
    if (skip) params.skip = parseInt(skip, 10);
    if (take) params.take = parseInt(take, 10);
    if (catalogoId) params.catalogoId = catalogoId;
    if (ejercicioFiscal) params.ejercicioFiscal = parseInt(ejercicioFiscal, 10);
    
    return this.documentosService.search(params);
  }

  @Get(':id')
  @Permissions('REPORTE_VER')
  @ApiOperation({ summary: 'Obtener un documento por ID' })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  @ApiResponse({ status: 200, description: 'Documento obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  findOne(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    return this.documentosService.findOne(idNum);
  }

  @Patch(':id')
  @Permissions('DOCUMENTO_EDITAR')
  @UseInterceptors(FileInterceptor('archivo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Actualizar un documento con archivo opcional' })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  @ApiResponse({ status: 200, description: 'Documento actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateDocumentoDto: UpdateDocumentoDto,
    @UploadedFile() archivo: any,
    @CurrentUser() user: User,
  ) {
    const idNum = parseInt(id, 10);
    return this.documentosService.updateWithFile(idNum, updateDocumentoDto, archivo, user);
  }

  @Delete(':id')
  @Permissions('DOCUMENTO_ELIMINAR')
  @ApiOperation({ summary: 'Eliminar (desactivar) un documento' })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  @ApiResponse({ status: 200, description: 'Documento eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  remove(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    return this.documentosService.remove(idNum);
  }

  @Get('estadisticas/catalogo/:catalogoId')
  @Permissions('REPORTE_VER')
  @ApiOperation({ summary: 'Obtener estadísticas de documentos por catálogo' })
  @ApiParam({ name: 'catalogoId', description: 'ID del catálogo' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Catálogo no encontrado' })
  getStatsByCatalogo(@Param('catalogoId') catalogoId: string) {
    const catalogoIdNum = parseInt(catalogoId, 10);
    return this.documentosService.getStatsByCatalogo(catalogoIdNum);
  }

  @Get('estadisticas/total')
  @Permissions('REPORTE_VER')
  @ApiOperation({ summary: 'Obtener estadísticas generales de documentos' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  async getStats() {
    const total = await this.documentosService.count({ activo: true });
    return { total };
  }
}
