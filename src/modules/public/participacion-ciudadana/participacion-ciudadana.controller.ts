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
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ParticipacionCiudadanaService } from './participacion-ciudadana.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { Mensaje } from './entities/mensaje.entity';
import { Public } from '../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { Request } from 'express';

@ApiTags('Participación Ciudadana')
@Controller('participacion-ciudadana')
export class ParticipacionCiudadanaController {
  constructor(
    private readonly participacionCiudadanaService: ParticipacionCiudadanaService,
  ) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo mensaje de participación ciudadana' })
  @ApiResponse({
    status: 201,
    description: 'Mensaje creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Mensaje enviado correctamente. Se ha enviado una confirmación a su correo electrónico.' },
        data: {
          type: 'object',
          properties: {
            folio: { type: 'string', example: 'PC-2025-00123' },
            fechaCreacion: { type: 'string', format: 'date-time', example: '2025-12-29T10:30:00.000Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async create(
    @Body() createMensajeDto: CreateMensajeDto,
    @Req() request: Request,
  ): Promise<any> {
    return this.participacionCiudadanaService.create(createMensajeDto, request);
  }

  @Public()
  @Get('folio/:folio')
  @ApiOperation({ summary: 'Consultar un mensaje por su folio' })
  @ApiParam({ name: 'folio', description: 'Folio del mensaje' })
  @ApiResponse({
    status: 200,
    description: 'Mensaje encontrado',
    type: Mensaje,
  })
  @ApiResponse({ status: 404, description: 'Mensaje no encontrado' })
  async findByFolio(@Param('folio') folio: string): Promise<Mensaje> {
    return this.participacionCiudadanaService.findByFolio(folio);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los mensajes (requiere autenticación)' })
  @ApiQuery({ name: 'skip', required: false, description: 'Número de registros a saltar' })
  @ApiQuery({ name: 'take', required: false, description: 'Número de registros a tomar' })
  @ApiQuery({ name: 'estatus', required: false, description: 'Filtrar por estatus' })
  @ApiQuery({ name: 'canal', required: false, description: 'Filtrar por canal' })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda en texto' })
  @ApiResponse({
    status: 200,
    description: 'Lista de mensajes',
    type: [Mensaje],
  })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('estatus') estatus?: string,
    @Query('canal') canal?: string,
    @Query('search') search?: string,
  ): Promise<Mensaje[]> {
    return this.participacionCiudadanaService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      estatus,
      canal,
      search,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Get('estadisticas')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de mensajes (requiere autenticación)' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de mensajes',
  })
  async getEstadisticas() {
    return this.participacionCiudadanaService.getEstadisticas();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Get('recientes')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mensajes recientes (requiere autenticación)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de mensajes' })
  @ApiResponse({
    status: 200,
    description: 'Mensajes recientes',
    type: [Mensaje],
  })
  async getMensajesRecientes(@Query('limit') limit?: string): Promise<Mensaje[]> {
    return this.participacionCiudadanaService.getMensajesRecientes(
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Get('count')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Contar mensajes (requiere autenticación)' })
  @ApiQuery({ name: 'estatus', required: false, description: 'Filtrar por estatus' })
  @ApiQuery({ name: 'canal', required: false, description: 'Filtrar por canal' })
  @ApiResponse({
    status: 200,
    description: 'Número de mensajes',
    type: Number,
  })
  async count(
    @Query('estatus') estatus?: string,
    @Query('canal') canal?: string,
  ): Promise<number> {
    return this.participacionCiudadanaService.count({ estatus, canal });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un mensaje por ID (requiere autenticación)' })
  @ApiParam({ name: 'id', description: 'ID del mensaje' })
  @ApiResponse({
    status: 200,
    description: 'Mensaje encontrado',
    type: Mensaje,
  })
  @ApiResponse({ status: 404, description: 'Mensaje no encontrado' })
  async findOne(@Param('id') id: string): Promise<Mensaje> {
    return this.participacionCiudadanaService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Patch(':id/responder')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Responder a un mensaje (requiere autenticación)' })
  @ApiParam({ name: 'id', description: 'ID del mensaje' })
  @ApiResponse({
    status: 200,
    description: 'Mensaje respondido exitosamente',
    type: Mensaje,
  })
  @ApiResponse({ status: 400, description: 'El mensaje ya ha sido respondido' })
  @ApiResponse({ status: 404, description: 'Mensaje no encontrado' })
  async responderMensaje(
    @Param('id') id: string,
    @Body('respuesta') respuesta: string,
    @Body('areaDestino') areaDestino?: string,
  ): Promise<Mensaje> {
    return this.participacionCiudadanaService.responderMensaje(id, respuesta, areaDestino);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARGA', 'EDICION')
  @Patch(':id/estatus')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar el estatus de un mensaje (requiere autenticación)' })
  @ApiParam({ name: 'id', description: 'ID del mensaje' })
  @ApiResponse({
    status: 200,
    description: 'Estatus cambiado exitosamente',
    type: Mensaje,
  })
  @ApiResponse({ status: 404, description: 'Mensaje no encontrado' })
  async cambiarEstatus(
    @Param('id') id: string,
    @Body('estatus') estatus: string,
  ): Promise<Mensaje> {
    return this.participacionCiudadanaService.cambiarEstatus(id, estatus);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un mensaje (requiere rol ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID del mensaje' })
  @ApiResponse({
    status: 200,
    description: 'Mensaje eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Mensaje no encontrado' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.participacionCiudadanaService.delete(id);
  }
}
