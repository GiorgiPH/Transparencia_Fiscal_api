import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DependenciasService } from './dependencias.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { DependenciaResponseDto } from './dto/dependencia-response.dto';

@ApiTags('admin/dependencias')
@Controller('admin/dependencias')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DependenciasController {
  constructor(private readonly dependenciasService: DependenciasService) {}

  @Get('tipos')
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @ApiOperation({ summary: 'Obtener todos los tipos de dependencia' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de tipos de dependencia',
    type: [Object]
  })
  async findAllTiposDependencia() {
    const tipos = await this.dependenciasService.findAllTiposDependencia();
    return {
      statusCode: 200,
      message: 'Tipos de dependencia obtenidos exitosamente',
      data: tipos,
    };
  }

  @Get()
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @ApiOperation({ summary: 'Obtener todas las dependencias' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de dependencias',
    type: [DependenciaResponseDto]
  })
  async findAllDependencias() {
    const dependencias = await this.dependenciasService.findAllDependencias();
    return {
      statusCode: 200,
      message: 'Dependencias obtenidas exitosamente',
      data: dependencias,
    };
  }

  @Get('nivel/:nivel')
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @ApiOperation({ summary: 'Obtener dependencias por nivel' })
  @ApiParam({ name: 'nivel', description: 'Nivel de dependencia (1, 2 o 3)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de dependencias del nivel especificado',
    type: [DependenciaResponseDto]
  })
  async findDependenciasByNivel(@Param('nivel') nivel: string) {
    const nivelNum = parseInt(nivel, 10);
    const dependencias = await this.dependenciasService.findDependenciasByNivel(nivelNum);
    return {
      statusCode: 200,
      message: `Dependencias del nivel ${nivel} obtenidas exitosamente`,
      data: dependencias,
    };
  }

  @Get('tipo/:idTipo')
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @ApiOperation({ summary: 'Obtener dependencias por tipo' })
  @ApiParam({ name: 'idTipo', description: 'ID del tipo de dependencia' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de dependencias del tipo especificado',
    type: [DependenciaResponseDto]
  })
  async findDependenciasByTipo(@Param('idTipo') idTipo: string) {
    const tipoId = parseInt(idTipo, 10);
    const dependencias = await this.dependenciasService.findDependenciasByTipo(tipoId);
    return {
      statusCode: 200,
      message: `Dependencias del tipo ${idTipo} obtenidas exitosamente`,
      data: dependencias,
    };
  }

  @Get('padre/:idPadre')
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @ApiOperation({ summary: 'Obtener dependencias por padre' })
  @ApiParam({ name: 'idPadre', description: 'ID de la dependencia padre' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de dependencias hijas',
    type: [DependenciaResponseDto]
  })
  async findDependenciasByPadre(@Param('idPadre') idPadre: string) {
    const padreId = parseInt(idPadre, 10);
    const dependencias = await this.dependenciasService.findDependenciasByPadre(padreId);
    return {
      statusCode: 200,
      message: `Dependencias hijas de ${idPadre} obtenidas exitosamente`,
      data: dependencias,
    };
  }

  @Get(':id')
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @ApiOperation({ summary: 'Obtener una dependencia por ID' })
  @ApiParam({ name: 'id', description: 'ID de la dependencia' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dependencia encontrada',
    type: DependenciaResponseDto
  })
  async findDependenciaById(@Param('id') id: string) {
    const dependenciaId = parseInt(id, 10);
    const dependencia = await this.dependenciasService.findDependenciaById(dependenciaId);
    return {
      statusCode: 200,
      message: 'Dependencia obtenida exitosamente',
      data: dependencia,
    };
  }

  @Get('arbol/estructura')
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @ApiOperation({ summary: 'Obtener estructura completa de dependencias en formato árbol' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estructura de dependencias en formato árbol',
    type: [DependenciaResponseDto]
  })
  async findDependenciasTree() {
    const tree = await this.dependenciasService.findDependenciasTree();
    return {
      statusCode: 200,
      message: 'Estructura de dependencias obtenida exitosamente',
      data: tree,
    };
  }

  @Get('seleccion/usuario')
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @ApiOperation({ summary: 'Obtener dependencias para selección de usuario (nivel 3)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de dependencias de nivel 3 para asignación de usuarios',
    type: [DependenciaResponseDto]
  })
  async findDependenciasForUserSelection() {
    const dependencias = await this.dependenciasService.findDependenciasForUserSelection();
    return {
      statusCode: 200,
      message: 'Dependencias para selección de usuario obtenidas exitosamente',
      data: dependencias,
    };
  }

  @Get('ruta/completa')
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @ApiOperation({ summary: 'Obtener dependencias con ruta completa' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de dependencias con ruta completa',
    type: [Object]
  })
  async findDependenciasWithFullPath() {
    const dependencias = await this.dependenciasService.findDependenciasWithFullPath();
    return {
      statusCode: 200,
      message: 'Dependencias con ruta completa obtenidas exitosamente',
      data: dependencias,
    };
  }

  @Get('estructura/completa')
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @ApiOperation({ summary: 'Obtener estructura completa de dependencias' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estructura completa de dependencias',
    type: Object
  })
  async getDependenciaStructure() {
    const estructura = await this.dependenciasService.getDependenciaStructure();
    return {
      statusCode: 200,
      message: 'Estructura de dependencias obtenida exitosamente',
      data: estructura,
    };
  }

  @Get('niveles/todos')
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @ApiOperation({ summary: 'Obtener dependencias agrupadas por nivel' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dependencias agrupadas por nivel',
    type: Object
  })
  async getDependenciasByLevel() {
    const niveles = await this.dependenciasService.getDependenciasByLevel();
    return {
      statusCode: 200,
      message: 'Dependencias por nivel obtenidas exitosamente',
      data: niveles,
    };
  }

  // @Get('ruta/:id')
  // @Roles('ADMIN', 'CARGA', 'EDICION')
  // @ApiOperation({ summary: 'Obtener ruta completa de una dependencia' })
  // @ApiParam({ name: 'id', description: 'ID de la dependencia' })
  // @ApiResponse({ 
  //   status: 200, 
  //   description: 'Ruta completa de la dependencia',
  //   type: Object
  // })
  // async getDependenciaPath(@Param('id') id: string) {
  //   const dependenciaId = parseInt(id, 10);
  //   const path = await this.dependenciasService.getDependenciaPath(dependenciaId);
  //   return {
  //     statusCode: 200,
  //     message: 'Ruta de dependencia obtenida exitosamente',
  //     data: { path },
  //   };
  // }

  @Get('estadisticas/conteo')
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @ApiOperation({ summary: 'Obtener estadísticas de conteo de dependencias' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas de conteo de dependencias',
    type: Object
  })
  async getDependenciasCount() {
    const estadisticas = await this.dependenciasService.getDependenciasCount();
    return {
      statusCode: 200,
      message: 'Estadísticas de dependencias obtenidas exitosamente',
      data: estadisticas,
    };
  }

  @Get('validar/existe/:id')
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @ApiOperation({ summary: 'Validar si una dependencia existe' })
  @ApiParam({ name: 'id', description: 'ID de la dependencia' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultado de validación',
    type: Object
  })
  async validateDependenciaExists(@Param('id') id: string) {
    const dependenciaId = parseInt(id, 10);
    const existe = await this.dependenciasService.validateDependenciaExists(dependenciaId);
    return {
      statusCode: 200,
      message: 'Validación completada',
      data: { existe },
    };
  }
}