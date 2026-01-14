import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { MensajeParticipacionCiudadana, Prisma } from '@prisma/client';

@Injectable()
export class ParticipacionCiudadanaRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.MensajeParticipacionCiudadanaCreateInput): Promise<MensajeParticipacionCiudadana> {
    // Generar folio único
    const folio = this.generateFolio();
    
    return this.prisma.mensajeParticipacionCiudadana.create({
      data: {
        ...data,
        folio,
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.MensajeParticipacionCiudadanaWhereInput;
    orderBy?: Prisma.MensajeParticipacionCiudadanaOrderByWithRelationInput;
  }): Promise<MensajeParticipacionCiudadana[]> {
    return this.prisma.mensajeParticipacionCiudadana.findMany(params);
  }

  async findOne(where: Prisma.MensajeParticipacionCiudadanaWhereUniqueInput): Promise<MensajeParticipacionCiudadana | null> {
    return this.prisma.mensajeParticipacionCiudadana.findUnique({ where });
  }

  async update(
    where: Prisma.MensajeParticipacionCiudadanaWhereUniqueInput,
    data: Prisma.MensajeParticipacionCiudadanaUpdateInput,
  ): Promise<MensajeParticipacionCiudadana> {
    return this.prisma.mensajeParticipacionCiudadana.update({ where, data });
  }

  async delete(where: Prisma.MensajeParticipacionCiudadanaWhereUniqueInput): Promise<MensajeParticipacionCiudadana> {
    return this.prisma.mensajeParticipacionCiudadana.delete({ where });
  }

  async count(where?: Prisma.MensajeParticipacionCiudadanaWhereInput): Promise<number> {
    return this.prisma.mensajeParticipacionCiudadana.count({ where });
  }

  async getEstadisticas() {
    const total = await this.prisma.mensajeParticipacionCiudadana.count();
    const pendientes = await this.prisma.mensajeParticipacionCiudadana.count({
      where: { estatus: 'pendiente' },
    });
    const respondidos = await this.prisma.mensajeParticipacionCiudadana.count({
      where: { estatus: 'respondido' },
    });
    const enProceso = await this.prisma.mensajeParticipacionCiudadana.count({
      where: { estatus: 'en_proceso' },
    });

    // Mensajes por canal
    const porCanal = await this.prisma.mensajeParticipacionCiudadana.groupBy({
      by: ['canal'],
      _count: {
        canal: true,
      },
    });

    // Mensajes por área destino
    const porAreaDestino = await this.prisma.mensajeParticipacionCiudadana.groupBy({
      by: ['area_destino'],
      _count: {
        area_destino: true,
      },
      where: {
        area_destino: {
          not: null,
        },
      },
    });

    return {
      total,
      pendientes,
      respondidos,
      enProceso,
      porCanal: porCanal.map(item => ({
        canal: item.canal,
        cantidad: item._count.canal,
      })),
      porAreaDestino: porAreaDestino.map(item => ({
        areaDestino: item.area_destino,
        cantidad: item._count.area_destino,
      })),
    };
  }

  async getMensajesRecientes(limit: number = 10): Promise<MensajeParticipacionCiudadana[]> {
    return this.prisma.mensajeParticipacionCiudadana.findMany({
      take: limit,
      orderBy: {
        fecha_creacion: 'desc',
      },
    });
  }

  async responderMensaje(
    id: string,
    respuesta: string,
    areaDestino?: string,
  ): Promise<MensajeParticipacionCiudadana> {
    return this.prisma.mensajeParticipacionCiudadana.update({
      where: { id },
      data: {
        respuesta,
        area_destino: areaDestino,
        estatus: 'respondido',
        fecha_respuesta: new Date(),
      },
    });
  }

  async cambiarEstatus(id: string, estatus: string): Promise<MensajeParticipacionCiudadana> {
    const estatusValidos = ['pendiente', 'en_proceso', 'respondido', 'cerrado'];
    
    if (!estatusValidos.includes(estatus)) {
      throw new Error(`Estatus inválido. Debe ser uno de: ${estatusValidos.join(', ')}`);
    }

    return this.prisma.mensajeParticipacionCiudadana.update({
      where: { id },
      data: { estatus },
    });
  }

  private generateFolio(): string {
    const prefix = 'MSG';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }
}
