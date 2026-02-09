import { Injectable, NotFoundException } from '@nestjs/common';
import { DependenciasRepository } from './dependencias.repository';
import { Dependencia, TipoDependencia } from '@prisma/client';

@Injectable()
export class DependenciasService {
  constructor(
    private readonly dependenciasRepository: DependenciasRepository,
  ) {}

  async findAllTiposDependencia(): Promise<TipoDependencia[]> {
    return this.dependenciasRepository.findAllTiposDependencia();
  }

  async findAllDependencias(): Promise<Dependencia[]> {
    return this.dependenciasRepository.findAllDependencias();
  }

  async findDependenciasByNivel(nivel: number): Promise<Dependencia[]> {
    if (nivel < 1 || nivel > 3) {
      throw new NotFoundException('Nivel de dependencia no válido. Los niveles válidos son 1, 2 o 3.');
    }
    return this.dependenciasRepository.findDependenciasByNivel(nivel);
  }

  async findDependenciasByTipo(idTipo: number): Promise<Dependencia[]> {
    return this.dependenciasRepository.findDependenciasByTipo(idTipo);
  }

  async findDependenciasByPadre(idPadre: number): Promise<Dependencia[]> {
    return this.dependenciasRepository.findDependenciasByPadre(idPadre);
  }

  async findDependenciaById(id: number): Promise<Dependencia> {
    const dependencia = await this.dependenciasRepository.findDependenciaById(id);
    if (!dependencia) {
      throw new NotFoundException(`Dependencia con ID ${id} no encontrada`);
    }
    return dependencia;
  }

  async findDependenciasTree(): Promise<Dependencia[]> {
    return this.dependenciasRepository.findDependenciasTree();
  }

  async findDependenciasForUserSelection(): Promise<Dependencia[]> {
    return this.dependenciasRepository.findDependenciasForUserSelection();
  }

  async findDependenciasWithFullPath(): Promise<any[]> {
    return this.dependenciasRepository.findDependenciasWithFullPath();
  }

  async getDependenciaStructure(): Promise<{
    tipos: TipoDependencia[];
    dependencias: Dependencia[];
    tree: Dependencia[];
  }> {
    const [tipos, dependencias, tree] = await Promise.all([
      this.findAllTiposDependencia(),
      this.findAllDependencias(),
      this.findDependenciasTree(),
    ]);

    return {
      tipos,
      dependencias,
      tree,
    };
  }

  async getDependenciasByLevel(): Promise<{
    nivel1: Dependencia[];
    nivel2: Dependencia[];
    nivel3: Dependencia[];
  }> {
    const [nivel1, nivel2, nivel3] = await Promise.all([
      this.findDependenciasByNivel(1),
      this.findDependenciasByNivel(2),
      this.findDependenciasByNivel(3),
    ]);

    return {
      nivel1,
      nivel2,
      nivel3,
    };
  }

  async validateDependenciaExists(id: number): Promise<boolean> {
    const dependencia = await this.dependenciasRepository.findDependenciaById(id);
    return !!dependencia;
  }

//   async getDependenciaPath(id: number): Promise<string> {
//     const dependencia = await this.findDependenciaById(id);
    
//     let path = dependencia.nombre;
//     let current = dependencia.padre;
    
//     while (current) {
//       path = `${current.nombre} > ${path}`;
//       current = current.padre;
//     }

//     return path;
//   }

  async getDependenciasCount(): Promise<{
    total: number;
    byLevel: { nivel: number; count: number }[];
    byType: { tipoId: number; tipoNombre: string; count: number }[];
  }> {
    const dependencias = await this.findAllDependencias();
    
    const byLevel = [1, 2, 3].map(nivel => ({
      nivel,
      count: dependencias.filter(d => d.nivel === nivel).length,
    }));

    // Agrupar por tipo
    const tipoMap = new Map<number, { tipoNombre: string; count: number }>();
    dependencias.forEach(dep => {
      const tipoId = dep.idTipo;
      if (!tipoMap.has(tipoId)) {
        tipoMap.set(tipoId, { tipoNombre: `Tipo ${tipoId}`, count: 0 });
      }
      tipoMap.get(tipoId)!.count++;
    });

    const byType = Array.from(tipoMap.entries()).map(([tipoId, data]) => ({
      tipoId,
      tipoNombre: data.tipoNombre,
      count: data.count,
    }));

    return {
      total: dependencias.length,
      byLevel,
      byType,
    };
  }
}