import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ParticipacionCiudadanaRepository } from './participacion-ciudadana.repository';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { Mensaje } from './entities/mensaje.entity';
import { Request } from 'express';
import { MailService } from '../../../common/services/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ParticipacionCiudadanaService {
  private readonly logger = new Logger(ParticipacionCiudadanaService.name);

  constructor(
    private readonly participacionCiudadanaRepository: ParticipacionCiudadanaRepository,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async create(createMensajeDto: CreateMensajeDto, request?: Request): Promise<any> {
    // Preparar datos del mensaje
    const mensajeData: any = {
      nombre_completo: createMensajeDto.nombre_completo,
      correo_electronico: createMensajeDto.correo_electronico,
      asunto: createMensajeDto.asunto,
      mensaje: createMensajeDto.mensaje,
      canal: createMensajeDto.canal || 'web',
      area_destino: createMensajeDto.area_destino,
      estatus: 'pendiente',
    };

    // Capturar información del cliente si está disponible
    if (request) {
      const ip = request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress;
      const userAgent = request.headers['user-agent'];

      if (ip && typeof ip === 'string') {
        mensajeData.direccion_ip = ip;
      }
      
      if (userAgent && typeof userAgent === 'string') {
        mensajeData.agente_usuario = userAgent;
      }
    }

    // Crear el mensaje
    const mensaje = await this.participacionCiudadanaRepository.create(mensajeData);

    // Enviar correos de confirmación y notificación
    try {
      await this.enviarCorreosConfirmacion(mensaje, createMensajeDto);
    } catch (error) {
      // No fallar la operación principal si el correo falla, solo registrar el error
      this.logger.error('Error al enviar correos de confirmación:', error);
    }

    // Devolver respuesta simplificada para el frontend
    return {
      message: 'Mensaje enviado correctamente. Se ha enviado una confirmación a su correo electrónico.',
      data: {
        folio: mensaje.folio,
        fechaCreacion: mensaje.fecha_creacion,
      },
    };
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    estatus?: string;
    canal?: string;
    search?: string;
  }): Promise<Mensaje[]> {
    const where: any = {};

    if (params?.estatus) {
      where.estatus = params.estatus;
    }

    if (params?.canal) {
      where.canal = params.canal;
    }

    if (params?.search) {
      where.OR = [
        { nombre_completo: { contains: params.search, mode: 'insensitive' } },
        { correo_electronico: { contains: params.search, mode: 'insensitive' } },
        { asunto: { contains: params.search, mode: 'insensitive' } },
        { mensaje: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const mensajes = await this.participacionCiudadanaRepository.findAll({
      skip: params?.skip,
      take: params?.take,
      where,
      orderBy: { fecha_creacion: 'desc' },
    });

    return mensajes.map(mensaje => this.mapToEntity(mensaje));
  }

  async findOne(id: string): Promise<Mensaje> {
    const mensaje = await this.participacionCiudadanaRepository.findOne({ id });
    if (!mensaje) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    return this.mapToEntity(mensaje);
  }

  async findByFolio(folio: string): Promise<Mensaje> {
    const mensaje = await this.participacionCiudadanaRepository.findOne({ folio });
    if (!mensaje) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    return this.mapToEntity(mensaje);
  }

  async responderMensaje(id: string, respuesta: string, areaDestino?: string): Promise<Mensaje> {
    const mensaje = await this.participacionCiudadanaRepository.findOne({ id });
    if (!mensaje) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    if (mensaje.estatus === 'respondido') {
      throw new BadRequestException('El mensaje ya ha sido respondido');
    }

    const mensajeActualizado = await this.participacionCiudadanaRepository.responderMensaje(
      id,
      respuesta,
      areaDestino,
    );

    // En un entorno real, aquí se enviaría la respuesta por correo al ciudadano

    return this.mapToEntity(mensajeActualizado);
  }

  async cambiarEstatus(id: string, estatus: string): Promise<Mensaje> {
    const mensaje = await this.participacionCiudadanaRepository.findOne({ id });
    if (!mensaje) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    const mensajeActualizado = await this.participacionCiudadanaRepository.cambiarEstatus(id, estatus);
    return this.mapToEntity(mensajeActualizado);
  }

  async getEstadisticas() {
    return this.participacionCiudadanaRepository.getEstadisticas();
  }

  async getMensajesRecientes(limit: number = 10): Promise<Mensaje[]> {
    const mensajes = await this.participacionCiudadanaRepository.getMensajesRecientes(limit);
    return mensajes.map(mensaje => this.mapToEntity(mensaje));
  }

  async count(params?: { estatus?: string; canal?: string }): Promise<number> {
    const where: any = {};

    if (params?.estatus) {
      where.estatus = params.estatus;
    }

    if (params?.canal) {
      where.canal = params.canal;
    }

    return this.participacionCiudadanaRepository.count(where);
  }

  async delete(id: string): Promise<void> {
    const mensaje = await this.participacionCiudadanaRepository.findOne({ id });
    if (!mensaje) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    await this.participacionCiudadanaRepository.delete({ id });
  }

  private mapToEntity(mensaje: any): Mensaje {
    return {
      id: mensaje.id,
      folio: mensaje.folio,
      nombre_completo: mensaje.nombre_completo,
      correo_electronico: mensaje.correo_electronico,
      asunto: mensaje.asunto,
      mensaje: mensaje.mensaje,
      estatus: mensaje.estatus,
      canal: mensaje.canal,
      area_destino: mensaje.area_destino,
      respuesta: mensaje.respuesta,
      fecha_respuesta: mensaje.fecha_respuesta,
      fecha_creacion: mensaje.fecha_creacion,
      fecha_actualizacion: mensaje.fecha_actualizacion,
      direccion_ip: mensaje.direccion_ip,
      agente_usuario: mensaje.agente_usuario,
    };
  }

  private async enviarCorreosConfirmacion(
    mensaje: any,
    createMensajeDto: CreateMensajeDto,
  ): Promise<void> {
    try {
      // 1. Enviar correo de confirmación al ciudadano
      await this.mailService.sendParticipacionCiudadanaConfirmacion(
        mensaje.nombre_completo,
        mensaje.correo_electronico,
        mensaje.folio,
        mensaje.asunto,
        mensaje.area_destino || 'Unidad de Transparencia Fiscal',
      );

      // 2. Enviar notificación interna al personal administrativo
      const destinatariosInternos = this.configService
        .get<string>('MAIL_INTERNAL_NOTIFICATIONS', 'admin@morelos.gob.mx')
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (destinatariosInternos.length > 0) {
        await this.mailService.sendNotificacionInterna(
          mensaje.nombre_completo,
          mensaje.correo_electronico,
          mensaje.folio,
          mensaje.asunto,
          mensaje.mensaje,
          mensaje.area_destino || 'Unidad de Transparencia Fiscal',
          mensaje.canal || 'web',
          destinatariosInternos,
        );
      }

      this.logger.log(`Correos enviados exitosamente para el mensaje con folio: ${mensaje.folio}`);
    } catch (error) {
      this.logger.error(`Error al enviar correos para el mensaje ${mensaje.folio}:`, error);
      throw error;
    }
  }
}
