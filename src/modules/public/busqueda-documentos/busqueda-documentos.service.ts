import { Injectable } from '@nestjs/common';
import { DocumentosRepository } from '../../admin/documentos/documentos.repository';
import { CatalogosRepository } from '../../admin/catalogos/catalogos.repository';
import { BuscarDocumentosDto } from './dto/buscar-documentos.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BusquedaDocumentosService {
  constructor(
    private readonly documentosRepository: DocumentosRepository,
    private readonly catalogosRepository: CatalogosRepository,
    private readonly prisma: PrismaService,
  ) {}

  async buscarDocumentos(buscarDto: BuscarDocumentosDto) {
    const {
      search,
      catalogoId,
      anio,
      extension,
      periodicidad,
      institucion,
      page = 1,
      pageSize = 20,
      orderBy = 'fecha_publicacion',
      order = 'desc',
      categorias,
    } = buscarDto;

    // Calcular skip para paginación
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Construir condiciones de búsqueda
    const where: any = {
      activo: true,
    };

    // Filtro por texto de búsqueda
    if (search && search.trim().length >= 2) {
      where.OR = [
        { nombre: { contains: search.trim() } },
        { descripcion: { contains: search.trim()} },
      ];
    }

     // Filtro por catálogo - MODIFICADO para incluir descendientes
    if (catalogoId) {
      
      // Obtener todos los IDs de catálogos descendientes
      const idsDescendientes = await this.obtenerDescendientesCatalogo(catalogoId);
      
      where.catalogo_id = {
        in: idsDescendientes
      };
    }
    // Filtro por año
    if (anio) {
      where.ejercicio_fiscal = anio;
    }

    // Filtro por extensión
    if (extension) {
      where.tipo_documento_id = parseInt(extension);
      console.log(extension)
    }

    // Filtro por periodicidad (asumiendo que está en el nombre o descripción)
    if (periodicidad) {
      where.periodicidad = periodicidad;

    }

    // Filtro por institución
    if (institucion) {
      where.institucion_emisora = { contains: institucion };
    }

    // Filtro por múltiples categorías - MODIFICADO para incluir descendientes
    if (categorias && categorias.length > 0) {
      console.log("este: "+categorias);
      // Obtener todos los IDs de catálogos descendientes de las categorías seleccionadas
      const idsDescendientes = await this.obtenerDescendientesMultiplesCatalogo(categorias);
      
      where.catalogo_id = {
        in: idsDescendientes
      };
    }

    // Mapear orderBy a campos de Prisma
    const orderByField = this.mapOrderByField(orderBy);

    // Realizar la búsqueda
    const [documentos, total] = await Promise.all([
      this.documentosRepository.findAll({
        skip,
        take,
        where,
        orderBy: { [orderByField]: order },
      }),
      this.documentosRepository.count(where),
    ]);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(total / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      documentos,
      paginacion: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  async obtenerFiltrosDisponibles() {
    // Obtener años disponibles usando una consulta directa
    const años = await this.obtenerValoresDistintos('ejercicio_fiscal');
    
    // Obtener extensiones disponibles
    const extensiones = await this.obtenerValoresDistintos('extension');
    
    // Obtener instituciones disponibles
    const instituciones = await this.obtenerValoresDistintos('institucion_emisora');

    // Obtener categorías principales (nivel 0 o 1)
    const categorias = await this.catalogosRepository.findAll({
      where: {
        activo: true,
        permite_documentos: true,
        nivel: { in: [0, 1] },
      },
      orderBy: { orden: 'asc' },
    });

    return {
      años: años.filter(año => año).sort((a, b) => b - a), // Orden descendente
      extensiones: extensiones.filter(ext => ext).sort(),
      instituciones: instituciones.filter(inst => inst).sort(),
      categorias,
    };
  }

  async obtenerDocumentoPorId(id: string) {
    const idNum = parseInt(id, 10);
    const documento = await this.documentosRepository.findById(idNum);

    if (!documento || !documento.activo) {
      return null;
    }

    // Incrementar contador de descargas (opcional)
    await this.registrarDescarga(id);

    return documento;
  }

  async obtenerDocumentosRecientes(limit: number = 10) {
    return this.documentosRepository.getRecentDocuments(limit);
  }

  async obtenerEstadisticas() {
    const totalDocumentos = await this.documentosRepository.count({
      activo: true,
    });

    // Obtener estadísticas por año
    const años = await this.obtenerValoresDistintos('ejercicio_fiscal');
    const documentosPorAño = await Promise.all(
      años.map(async (año) => {
        const count = await this.documentosRepository.count({
          activo: true,
          ejercicio_fiscal: año,
        });
        return { ejercicio_fiscal: año, _count: count };
      })
    );

    // Obtener estadísticas por extensión
    const extensiones = await this.obtenerValoresDistintos('extension');
    const documentosPorExtension = await Promise.all(
      extensiones.map(async (ext) => {
        const count = await this.documentosRepository.count({
          activo: true,
          extension: ext,
        });
        return { extension: ext, _count: count };
      })
    );

    return {
      totalDocumentos,
      documentosPorAño: documentosPorAño
        .filter(item => item.ejercicio_fiscal)
        .sort((a, b) => b.ejercicio_fiscal - a.ejercicio_fiscal),
      documentosPorExtension: documentosPorExtension
        .filter(item => item.extension)
        .sort((a, b) => b._count - a._count),
    };
  }

  private async obtenerValoresDistintos(campo: string): Promise<any[]> {
    // Usar Prisma directamente para obtener valores distintos
    const resultados = await this.prisma.documento.findMany({
      where: { activo: true },
      select: { [campo]: true },
      distinct: [campo as any],
    });
    
    return resultados.map(r => r[campo]).filter(val => val !== null && val !== undefined);
  }

  private mapOrderByField(orderBy: string): string {
    const mapping: Record<string, string> = {
      nombre: 'nombre',
      fecha_publicacion: 'fecha_publicacion',
      ejercicio_fiscal: 'ejercicio_fiscal',
      fecha_creacion: 'fecha_creacion',
    };
    return mapping[orderBy] || 'fecha_creacion';
  }

  private async registrarDescarga(documentoId: string) {
    // Implementar registro de descargas si es necesario
    // Esto podría ir a una tabla de bitácora
    console.log(`Descarga registrada para documento: ${documentoId}`);
  }
  // En tu BusquedaDocumentosService, agrega:
  private descendentCache = new Map<number, number[]>();

  private async obtenerDescendientesCatalogo(catalogoId: number): Promise<number[]> {
    // Verificar cache primero
    if (this.descendentCache.has(catalogoId)) {
      return this.descendentCache.get(catalogoId)!;
    }
  
    const query = `
      WITH DescendientesCTE AS (
        SELECT catalogo_id, parent_id
        FROM catalogos
        WHERE catalogo_id = ${catalogoId} AND activo = 1
        
        UNION ALL
        
        SELECT c.catalogo_id, c.parent_id
        FROM catalogos c
        INNER JOIN DescendientesCTE d ON c.parent_id = d.catalogo_id
        WHERE c.activo = 1
      )
      SELECT catalogo_id FROM DescendientesCTE
    `;
    
    const result: Array<{ catalogo_id: number }> = await this.prisma.$queryRawUnsafe(query);
    const ids = result.map(row => row.catalogo_id);
    
    // Guardar en cache por 5 minutos
    this.descendentCache.set(catalogoId, ids);
    setTimeout(() => {
      this.descendentCache.delete(catalogoId);
    }, 5 * 60 * 1000); // 5 minutos
    
    return ids;
  }

  private async obtenerDescendientesMultiplesCatalogo(catalogoIds: number[]): Promise<number[]> {
    if (catalogoIds.length === 0) {
      return [];
    }

    // Verificar cache para cada ID y obtener los que no están en cache
    const idsNoCache: number[] = [];
    const idsDesdeCache: number[] = [];

    for (const id of catalogoIds) {
      if (this.descendentCache.has(id)) {
        idsDesdeCache.push(...this.descendentCache.get(id)!);
      } else {
        idsNoCache.push(id);
      }
    }

    // Si todos están en cache, retornar combinado
    if (idsNoCache.length === 0) {
      return [...new Set(idsDesdeCache)]; // Eliminar duplicados
    }

    // Construir query para múltiples IDs
    const idsString = idsNoCache.join(',');
    const query = `
      WITH DescendientesCTE AS (
        SELECT catalogo_id, parent_id
        FROM catalogos
        WHERE catalogo_id IN (${idsString}) AND activo = 1
        
        UNION ALL
        
        SELECT c.catalogo_id, c.parent_id
        FROM catalogos c
        INNER JOIN DescendientesCTE d ON c.parent_id = d.catalogo_id
        WHERE c.activo = 1
      )
      SELECT catalogo_id FROM DescendientesCTE
    `;
    
    const result: Array<{ catalogo_id: number }> = await this.prisma.$queryRawUnsafe(query);
    const idsDesdeDB = result.map(row => row.catalogo_id);
    
    // Guardar en cache cada ID individualmente
    for (const id of idsNoCache) {
      // Filtrar los descendientes que corresponden a este ID específico
      // Para simplificar, guardaremos todos los IDs de la consulta para cada ID padre
      // En una implementación más optimizada, se podría separar por cada ID padre
      this.descendentCache.set(id, idsDesdeDB);
      setTimeout(() => {
        this.descendentCache.delete(id);
      }, 5 * 60 * 1000); // 5 minutos
    }
    
    // Combinar todos los IDs y eliminar duplicados
    const todosIds = [...idsDesdeCache, ...idsDesdeDB];
    return [...new Set(todosIds)];
  }
}
