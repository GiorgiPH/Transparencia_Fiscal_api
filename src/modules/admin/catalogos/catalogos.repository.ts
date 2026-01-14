import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Catalogo, Prisma } from '@prisma/client';

@Injectable()
export class CatalogosRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CatalogoCreateInput): Promise<Catalogo> {
    return this.prisma.catalogo.create({
      data,
    });
  }

  async findById(id: number): Promise<Catalogo | null> {
    return this.prisma.catalogo.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        documentos: {
          where: { activo: true },
          orderBy: { fecha_creacion: 'desc' },
          take: 10,
        },
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CatalogoWhereInput;
    orderBy?: Prisma.CatalogoOrderByWithRelationInput;
  }): Promise<Catalogo[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.catalogo.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        parent: true,
        _count: {
          select: {
            children: true,
            documentos: true,
          },
        },
      },
    });
  }

  async findRootCatalogs(): Promise<Catalogo[]> {
    return this.prisma.catalogo.findMany({
      where: {
        parent_id: null,
        activo: true,
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
      include: {
        _count: {
          select: {
            children: true,
            documentos: {
              where: { activo: true }  // ← Agregar este filtro
            },
          },
        },
      },
    });
  }

  async findChildren(parentId: number): Promise<Catalogo[]> {
    return this.prisma.catalogo.findMany({
      where: {
        parent_id: parentId,
        activo: true,
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
      include: {
        _count: {
          select: {
            children: true,
            documentos: {
              where: { activo: true }  // ← Agregar este filtro
            },
          },
        },
      },
    });
  }

  async findTree(parentId?: number): Promise<any[]> {
    const where = parentId 
      ? { parent_id: parentId, activo: true }
      : { parent_id: null, activo: true };

    const catalogos = await this.prisma.catalogo.findMany({
      where,
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
      include: {
        _count: {
          select: {
            children: true,
            documentos: {
              where: { activo: true }  // ← Agregar este filtro
            },
          },
        },
      },
    });

    // Recursivamente obtener hijos
    const result = await Promise.all(
      catalogos.map(async (catalogo) => {
        const children = await this.findTree(catalogo.id);
        return {
          ...catalogo,
          children,
        };
      })
    );

    return result;
  }

  async update(id: number, data: Prisma.CatalogoUpdateInput): Promise<Catalogo> {
    return this.prisma.catalogo.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Catalogo> {
    return this.prisma.catalogo.update({
      where: { id },
      data: { activo: false },
    });
  }

  async count(where?: Prisma.CatalogoWhereInput): Promise<number> {
    return this.prisma.catalogo.count({ where });
  }

  async searchByName(name: string): Promise<Catalogo[]> {
    return this.prisma.catalogo.findMany({
      where: {
        nombre: {
          contains: name,
        },
        activo: true,
      },
      orderBy: [
        { nivel: 'asc' },
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
      include: {
        parent: true,
        _count: {
          select: {
            documentos: true,
          },
        },
      },
    });
  }

  async updateNivel(id: number, nivel: number): Promise<void> {
    await this.prisma.catalogo.update({
      where: { id },
      data: { nivel },
    });
  }

  async updateOrden(id: number, orden: number): Promise<void> {
    await this.prisma.catalogo.update({
      where: { id },
      data: { orden },
    });
  }

  async hasDocuments(id: number): Promise<boolean> {
    const count = await this.prisma.documento.count({
      where: {
        catalogo_id: id,
        activo: true,
      },
    });
    return count > 0;
  }
}
