import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DependenciasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllTiposDependencia(): Promise<any[]> {
    return (this.prisma as any).tipoDependencia.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async findAllDependencias(): Promise<any[]> {
    return (this.prisma as any).dependencia.findMany({
      where: { activo: true },
      include: {
        tipo: true,
        padre: true,
      },
      orderBy: [
        { nivel: 'asc' },
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    });
  }

  async findDependenciasByNivel(nivel: number): Promise<any[]> {
    return (this.prisma as any).dependencia.findMany({
      where: { 
        activo: true,
        nivel: nivel 
      },
      include: {
        tipo: true,
        padre: true,
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    });
  }

  async findDependenciasByTipo(idTipo: number): Promise<any[]> {
    return (this.prisma as any).dependencia.findMany({
      where: { 
        activo: true,
        idTipo: idTipo 
      },
      include: {
        tipo: true,
        padre: true,
      },
      orderBy: [
        { nivel: 'asc' },
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    });
  }

  async findDependenciasByPadre(idPadre: number): Promise<any[]> {
    return (this.prisma as any).dependencia.findMany({
      where: { 
        activo: true,
        idPadre: idPadre 
      },
      include: {
        tipo: true,
        padre: true,
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    });
  }

  async findDependenciaById(id: number): Promise<any> {
    return (this.prisma as any).dependencia.findUnique({
      where: { id },
      include: {
        tipo: true,
        padre: true,
        hijos: {
          where: { activo: true },
          include: {
            tipo: true,
          },
          orderBy: [
            { orden: 'asc' },
            { nombre: 'asc' },
          ],
        },
      },
    });
  }

  async findDependenciasTree(): Promise<any[]> {
    const dependencias = await (this.prisma as any).dependencia.findMany({
      where: { activo: true },
      include: {
        tipo: true,
        padre: true,
        hijos: {
          where: { activo: true },
          include: {
            tipo: true,
            hijos: {
              where: { activo: true },
              include: {
                tipo: true,
              },
              orderBy: [
                { orden: 'asc' },
                { nombre: 'asc' },
              ],
            },
          },
          orderBy: [
            { orden: 'asc' },
            { nombre: 'asc' },
          ],
        },
      },
      orderBy: [
        { nivel: 'asc' },
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    });

    // Filtrar solo las raíces (nivel 1 o sin padre)
    return dependencias.filter((dep: any) => dep.nivel === 1 || !dep.idPadre);
  }

  async findDependenciasForUserSelection(): Promise<any[]> {
    // Solo devolver dependencias de nivel 3 (direcciones) para asignación de usuarios
    return (this.prisma as any).dependencia.findMany({
      where: { 
        activo: true,
        nivel: 3 
      },
      include: {
        tipo: true,
        padre: {
          include: {
            padre: true, // Para obtener la estructura completa
          },
        },
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    });
  }

  async findDependenciasWithFullPath(): Promise<any[]> {
    // Obtener todas las dependencias con tipo
    const dependencias = await (this.prisma as any).dependencia.findMany({
      where: { activo: true },
      include: {
        tipo: true,
      },
      orderBy: [
        { nivel: 'asc' },
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    });

    // Crear un mapa de ID -> dependencia para búsqueda rápida
    const dependenciasMap = new Map<number, any>();
    dependencias.forEach((dep: any) => {
      dependenciasMap.set(dep.id, dep);
    });

    // Función para obtener la ruta completa
    const getFullPath = (dependencia: any): string => {
      let path = dependencia.nombre;
      let currentId = dependencia.idPadre;
      
      while (currentId && dependenciasMap.has(currentId)) {
        const parent = dependenciasMap.get(currentId);
        path = `${parent.nombre} > ${path}`;
        currentId = parent.idPadre;
      }

      return path;
    };

    return dependencias.map((dep: any) => ({
      ...dep,
      path: getFullPath(dep),
    }));
  }
}
