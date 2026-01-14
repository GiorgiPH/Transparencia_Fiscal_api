import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Documento, Prisma } from '@prisma/client';

@Injectable()
export class DocumentosRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.DocumentoCreateInput): Promise<Documento> {
    return this.prisma.documento.create({
      data,
    });
  }

  async findById(id: number): Promise<Documento | null> {
    return this.prisma.documento.findUnique({
      where: { id },
      include: {
        catalogo: true,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DocumentoWhereInput;
    orderBy?: Prisma.DocumentoOrderByWithRelationInput;
  }): Promise<Documento[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.documento.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        catalogo: true,
      },
    });
  }

  async findByCatalogoId(catalogoId: number, params?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.DocumentoOrderByWithRelationInput;
  }): Promise<Documento[]> {
    const { skip, take, orderBy } = params || {};
    return this.prisma.documento.findMany({
      skip,
      take,
      where: {
        catalogo_id: catalogoId,
        activo: true,
      },
      orderBy: orderBy || { fecha_creacion: 'desc' },
      include: {
        catalogo: true,
      },
    });
  }

  async findPublicDocuments(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DocumentoWhereInput;
    orderBy?: Prisma.DocumentoOrderByWithRelationInput;
  }): Promise<Documento[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.documento.findMany({
      skip,
      take,
      where: {
        ...where,
        activo: true,
      },
      orderBy,
      include: {
        catalogo: true,
      },
    });
  }

  async update(id: number, data: Prisma.DocumentoUpdateInput): Promise<Documento> {
    return this.prisma.documento.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Documento> {
    return this.prisma.documento.update({
      where: { id },
      data: { activo: false },
    });
  }

  async count(where?: Prisma.DocumentoWhereInput): Promise<number> {
    return this.prisma.documento.count({ where });
  }

  async search(params: {
    query: string;
    skip?: number;
    take?: number;
    catalogoId?: number;
    ejercicioFiscal?: number;
  }): Promise<Documento[]> {
    const { query, skip, take, catalogoId, ejercicioFiscal } = params;
    
    const where: Prisma.DocumentoWhereInput = {
      AND: [
        {
          OR: [
            { nombre: { contains: query } },
            { descripcion: { contains: query } },
          ],
        },
        { activo: true },
      ],
    };

    if (catalogoId) {
      (where.AND as any[]).push({ catalogo_id: catalogoId });
    }

    if (ejercicioFiscal) {
      (where.AND as any[]).push({ ejercicio_fiscal: ejercicioFiscal });
    }

    return this.prisma.documento.findMany({
      skip,
      take,
      where,
      orderBy: { fecha_creacion: 'desc' },
      include: {
        catalogo: true,
      },
    });
  }

  async getStatsByCatalogo(catalogoId: number) {
    const total = await this.prisma.documento.count({
      where: {
        catalogo_id: catalogoId,
        activo: true,
      },
    });

    const porEjercicio = await this.prisma.documento.groupBy({
      by: ['ejercicio_fiscal'],
      where: {
        catalogo_id: catalogoId,
        activo: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        ejercicio_fiscal: 'desc',
      },
    });

    return {
      total,
      porEjercicio,
    };
  }

  async getRecentDocuments(limit: number = 10): Promise<Documento[]> {
    return this.prisma.documento.findMany({
      where: {
        activo: true,
      },
      orderBy: { fecha_creacion: 'desc' },
      take: limit,
      include: {
        catalogo: true,
      },
    });
  }
}
