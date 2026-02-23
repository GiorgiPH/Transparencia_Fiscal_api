import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CatalogosService } from './catalogos.service';
import { CatalogoHijosResponseDto } from './dto/catalogo-hijos-response.dto';
import { TipoDocumentoResponseDto } from './dto/tipo-documento-response.dto';
import { PeriodicidadResponseDto } from './dto/periodicidad-response.dto';
import { BuscarCatalogosDto } from './dto/buscar-catalogos.dto';
import { BuscarCatalogosResponseDto } from './dto/buscar-catalogos-response.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { TransformInterceptor } from '../../../common/interceptors/response.interceptor';

@ApiTags('Catálogos (Público)')
@Controller('catalogos')
@UseInterceptors(TransformInterceptor)
@UseInterceptors(ClassSerializerInterceptor)
@Public()
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  @Get('tipos-documento')
  @ApiOperation({
    summary: 'Obtener todos los tipos de documento activos',
    description: 'Obtiene la lista de todos los tipos de documento activos disponibles en el sistema. Útil para alimentar combobox en formularios.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de tipos de documento activos',
    type: [TipoDocumentoResponseDto],
  })
  async obtenerTiposDocumento(): Promise<TipoDocumentoResponseDto[]> {
    return this.catalogosService.obtenerTiposDocumento();
  }

  @Get('periodicidades')
  @ApiOperation({
    summary: 'Obtener todas las periodicidades activas',
    description: 'Obtiene la lista de todas las periodicidades activas disponibles en el sistema. Útil para alimentar combobox en formularios de carga de documentos.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de periodicidades activas',
    type: [PeriodicidadResponseDto],
  })
  async obtenerPeriodicidades(): Promise<PeriodicidadResponseDto[]> {
    return this.catalogosService.obtenerPeriodicidades();
  }

  @Get(':id/hijos')
  @ApiOperation({
    summary: 'Obtener hijos de un catálogo',
    description: 'Obtiene los catálogos hijos de un catálogo específico, incluyendo información de disponibilidad de tipos de documento para catálogos que permiten documentos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del catálogo padre',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de catálogos hijos con información de disponibilidad',
    type: [CatalogoHijosResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Catálogo padre no encontrado o inactivo',
  })
  async obtenerHijosDeCatalogo(@Param('id') id: string): Promise<CatalogoHijosResponseDto[]> {
    const catalogoId = parseInt(id, 10);
    return this.catalogosService.obtenerHijosDeCatalogo(catalogoId);
  }

  

  @Get('raiz')
  @ApiOperation({
    summary: 'Obtener catálogos raíz',
    description: 'Obtiene los catálogos que no tienen padre (nivel 0), incluyendo información de disponibilidad de tipos de documento para catálogos que permiten documentos.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de catálogos raíz con información de disponibilidad',
    type: [CatalogoHijosResponseDto],
  })
  async obtenerCatalogoRaiz(): Promise<CatalogoHijosResponseDto[]> {
    return this.catalogosService.obtenerCatalogoRaiz();
  }

/*   @Get(':id')
  @ApiOperation({
    summary: 'Obtener información de un catálogo',
    description: 'Obtiene la información básica de un catálogo específico, incluyendo información de disponibilidad de tipos de documento si el catálogo permite documentos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del catálogo',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Información del catálogo con disponibilidad',
    type: CatalogoHijosResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Catálogo no encontrado o inactivo',
  })
  async obtenerCatalogoPorId(@Param('id') id: string): Promise<CatalogoHijosResponseDto> {
    const catalogoId = parseInt(id, 10);
    return this.catalogosService.obtenerCatalogoPorId(catalogoId);
  }
 */
  @Get('buscar')
  @ApiOperation({
    summary: 'Buscar catálogos por texto',
    description: 'Busca catálogos por nombre o descripción y devuelve los resultados con su path completo desde la raíz.',
  })
  @ApiQuery({
    name: 'q',
    description: 'Texto de búsqueda (mínimo 2 caracteres)',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de catálogos coincidentes con su path completo',
    type: [BuscarCatalogosResponseDto],
  })
  async buscarCatalogos(@Query() buscarDto: BuscarCatalogosDto): Promise<BuscarCatalogosResponseDto[]> {
    return this.catalogosService.buscarCatalogos(buscarDto.q || '');
  }
}
