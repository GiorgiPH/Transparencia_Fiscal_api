import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';
import { CreateRedSocialDto } from './dto/create-red-social.dto';
import { UpdateRedSocialDto } from './dto/update-red-social.dto';

@Injectable()
export class EstrategiasComunicacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Métodos para Noticias

  async createNoticia(data: CreateNoticiaDto) {
    return this.prisma.noticia.create({
      data: {
        titulo: data.titulo,
        descripcion_corta: data.descripcion_corta,
        contenido: data.contenido,
        imagen_url: data.imagen_url,
        fecha_publicacion: data.fecha_publicacion,
        activo: data.activo ?? true,
      },
    });
  }

  async findAllNoticias(params?: {
    skip?: number;
    take?: number;
    activo?: boolean;
    search?: string;
    orderBy?: 'fecha_publicacion' | 'fecha_creacion';
    order?: 'asc' | 'desc';
  }) {
    const { skip, take, activo, search, orderBy = 'fecha_publicacion', order = 'desc' } = params || {};

    const where: any = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { descripcion_corta: { contains: search, mode: 'insensitive' } },
        { contenido: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.noticia.findMany({
      skip,
      take,
      where,
      orderBy: {
        [orderBy]: order,
      },
    });
  }

  async findNoticiaById(id: number) {
    return this.prisma.noticia.findUnique({
      where: { id },
    });
  }

  async updateNoticia(id: number, data: UpdateNoticiaDto) {
    return this.prisma.noticia.update({
      where: { id },
      data: {
        titulo: data.titulo,
        descripcion_corta: data.descripcion_corta,
        contenido: data.contenido,
        imagen_url: data.imagen_url,
        fecha_publicacion: data.fecha_publicacion,
        activo: data.activo,
      },
    });
  }

  async toggleNoticiaActivo(id: number, activo: boolean) {
    return this.prisma.noticia.update({
      where: { id },
      data: { activo },
    });
  }

  async deleteNoticia(id: number) {
    return this.prisma.noticia.delete({
      where: { id },
    });
  }

  async countNoticias(where?: any) {
    return this.prisma.noticia.count({ where });
  }

  async getNoticiasRecientes(limit: number = 5) {
    return this.prisma.noticia.findMany({
      where: { activo: true },
      orderBy: { fecha_publicacion: 'desc' },
      take: limit,
    });
  }

  // Métodos para Redes Sociales

  async createRedSocial(data: CreateRedSocialDto) {
    return this.prisma.redSocial.create({
      data: {
        nombre: data.nombre,
        url: data.url,
        descripcion : data.descripcion,
        icono: data.icono,
        activo: data.activo ?? true,
        orden: data.orden ?? 0,
      },
    });
  }

  async findAllRedesSociales(params?: {
    activo?: boolean;
    orderBy?: 'orden' | 'nombre';
    order?: 'asc' | 'desc';
  }) {
    const { activo, orderBy = 'orden', order = 'asc' } = params || {};

    const where: any = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    return this.prisma.redSocial.findMany({
      where,
      orderBy: {
        [orderBy]: order,
      },
    });
  }

  async findRedSocialById(id: number) {
    return this.prisma.redSocial.findUnique({
      where: { id },
    });
  }

  async updateRedSocial(id: number, data: UpdateRedSocialDto) {
    return this.prisma.redSocial.update({
      where: { id },
      data: {
        nombre: data.nombre,
        url: data.url,
        icono: data.icono,
        activo: data.activo,
        orden: data.orden,
      },
    });
  }

  async toggleRedSocialActivo(id: number, activo: boolean) {
    return this.prisma.redSocial.update({
      where: { id },
      data: { activo },
    });
  }

  async deleteRedSocial(id: number) {
    return this.prisma.redSocial.delete({
      where: { id },
    });
  }

  async countRedesSociales(where?: any) {
    return this.prisma.redSocial.count({ where });
  }

  // Métodos para estadísticas

  async getEstadisticas() {
    const [totalNoticias, noticiasActivas, totalRedesSociales, redesSocialesActivas] = await Promise.all([
      this.prisma.noticia.count(),
      this.prisma.noticia.count({ where: { activo: true } }),
      this.prisma.redSocial.count(),
      this.prisma.redSocial.count({ where: { activo: true } }),
    ]);

    return {
      totalNoticias,
      noticiasActivas,
      noticiasInactivas: totalNoticias - noticiasActivas,
      totalRedesSociales,
      redesSocialesActivas,
      redesSocialesInactivas: totalRedesSociales - redesSocialesActivas,
    };
  }
}
