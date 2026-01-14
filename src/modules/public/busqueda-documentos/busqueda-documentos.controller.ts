import {
  Controller,
  Get,
  Query,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpStatus,
  Res,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import express from 'express';
import { BusquedaDocumentosService } from './busqueda-documentos.service';
import { BuscarDocumentosDto } from './dto/buscar-documentos.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { TransformInterceptor } from '../../../common/interceptors/response.interceptor';
import { FileDownloadService } from '../../../common/services/file-download.service';
import type { FileDownloadOptions } from '../../../common/services/file-download.service';

@ApiTags('Búsqueda de Documentos (Público)')
@Controller('busqueda-documentos')
@UseInterceptors(TransformInterceptor)
@UseInterceptors(ClassSerializerInterceptor)
@Public()
export class BusquedaDocumentosController {
  constructor(
    private readonly busquedaDocumentosService: BusquedaDocumentosService,
    private readonly fileDownloadService: FileDownloadService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Buscar documentos públicos',
    description: 'Permite buscar y filtrar documentos públicos de transparencia fiscal',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de documentos encontrados con paginación',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de búsqueda inválidos',
  })
  async buscarDocumentos(@Query() buscarDto: BuscarDocumentosDto) {
    return this.busquedaDocumentosService.buscarDocumentos(buscarDto);
  }

  @Get('filtros')
  @ApiOperation({
    summary: 'Obtener filtros disponibles',
    description: 'Obtiene los valores disponibles para los filtros de búsqueda',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Filtros disponibles para búsqueda',
  })
  async obtenerFiltrosDisponibles() {
    return this.busquedaDocumentosService.obtenerFiltrosDisponibles();
  }

  @Get('recientes')
  @ApiOperation({
    summary: 'Obtener documentos recientes',
    description: 'Obtiene los documentos más recientes publicados',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número máximo de documentos (default: 10)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Documentos recientes',
  })
  async obtenerDocumentosRecientes(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.busquedaDocumentosService.obtenerDocumentosRecientes(limitNum);
  }

  @Get('estadisticas')
  @ApiOperation({
    summary: 'Obtener estadísticas de documentos',
    description: 'Obtiene estadísticas generales sobre los documentos públicos',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas de documentos',
  })
  async obtenerEstadisticas() {
    return this.busquedaDocumentosService.obtenerEstadisticas();
  }
  @Get(':id/descargar')
  @ApiOperation({
    summary: 'Descargar documento',
    description: 'Descarga el archivo del documento desde el sistema de archivos',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del documento',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Archivo descargado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Documento no encontrado o no disponible',
  })
  async descargarDocumento(@Param('id') id: string, @Res() res: express.Response) {
    //console.log('🔥 ENTRÓ A DESCARGAR 🔥');

    const documento = await this.busquedaDocumentosService.obtenerDocumentoPorId(id);
    
    if (!documento) {
      throw new NotFoundException('Documento no encontrado o no disponible');
    }

    // Verificar que el documento tenga una ruta de archivo
    if (!documento.ruta_archivo) {
      throw new NotFoundException('El documento no tiene un archivo asociado');
    }

    // Configurar opciones de descarga
    const downloadOptions = {
      filePath: documento.ruta_archivo,
      downloadName: `${documento.nombre}.${documento.extension}`,
      asAttachment: true,
    };

    // Descargar el archivo
    await this.fileDownloadService.downloadFile(res, downloadOptions);

    // Nota: No retornamos nada ya que el archivo se envía directamente en la respuesta
    // El interceptor TransformInterceptor no se aplicará a esta respuesta
  }
  @Get(':id/visualizar')
  @ApiOperation({
    summary: 'Visualizar documento en el navegador',
    description: 'Muestra el archivo del documento directamente en el navegador (inline)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del documento',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Archivo visualizado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Documento no encontrado o no disponible',
  })
  async visualizarDocumento(@Param('id') id: string, @Res() res: express.Response) {
    const documento = await this.busquedaDocumentosService.obtenerDocumentoPorId(id);
    
    if (!documento) {
      throw new NotFoundException('Documento no encontrado o no disponible');
    }

    // Verificar que el documento tenga una ruta de archivo
    if (!documento.ruta_archivo) {
      throw new NotFoundException('El documento no tiene un archivo asociado');
    }

    // Configurar opciones para visualización (inline)
    const downloadOptions = {
      filePath: documento.ruta_archivo,
      downloadName: `${documento.nombre}.${documento.extension}`,
      asAttachment: false, // Importante: false para visualizar en el navegador
    };

    // Visualizar el archivo (inline)
    await this.fileDownloadService.downloadFile(res, downloadOptions);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de documento',
    description: 'Obtiene el detalle completo de un documento público',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del documento',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalle del documento',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Documento no encontrado o no disponible',
  })
  async obtenerDocumentoPorId(@Param('id') id: string) {
    const documento = await this.busquedaDocumentosService.obtenerDocumentoPorId(id);
    
    if (!documento) {
      throw new NotFoundException('Documento no encontrado o no disponible');
    }

    return documento;
  }

  
}
