import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CatalogoHijosResponseDto } from './dto/catalogo-hijos-response.dto';
import { DisponibilidadTipoDocumentoDto } from './dto/disponibilidad-tipo-documento.dto';
import { TipoDocumentoResponseDto } from './dto/tipo-documento-response.dto';

@Injectable()
export class CatalogosService {
  constructor(private readonly prisma: PrismaService) {}

  private async obtenerDisponibilidadParaCatalogos(catalogos: any[]): Promise<Map<number, DisponibilidadTipoDocumentoDto[]>> {
    const catalogosConDocumentos = catalogos.filter(catalogo => catalogo.permite_documentos);
    
    if (catalogosConDocumentos.length === 0) {
      return new Map();
    }

    // Obtener todos los tipos de documento activos
    const tiposDocumento = await this.prisma.tipoDocumento.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        extensiones: true,
      },
    });

    // Obtener documentos activos para todos los catálogos en una sola consulta
    const catalogosIds = catalogosConDocumentos.map(c => c.id);
    
    // Obtener el primer documento activo por catálogo y tipo de documento
    const documentos = await this.prisma.documento.findMany({
      where: {
        catalogo_id: { in: catalogosIds },
        activo: true,
      },
      select: {
        id: true,
        catalogo_id: true,
        tipo_documento_id: true,
        nombre: true,
      },
      orderBy: {
        fecha_creacion: 'desc', // Tomar el documento más reciente
      },
    });

    // Crear un mapa para acceso rápido: catalogo_id -> tipo_documento_id -> documento
    const documentosMap = new Map<number, Map<number, { id: string, nombre: string }>>();
    
    documentos.forEach(doc => {
      if (!documentosMap.has(doc.catalogo_id)) {
        documentosMap.set(doc.catalogo_id, new Map());
      }
      // Solo guardar el primer documento encontrado por tipo (el más reciente debido al orderBy)
      if (!documentosMap.get(doc.catalogo_id)!.has(doc.tipo_documento_id)) {
        documentosMap.get(doc.catalogo_id)!.set(doc.tipo_documento_id, {
          id: doc.id.toString(), // Convertir a string para coincidir con el DTO
          nombre: doc.nombre,
        });
      }
    });

    // Construir la respuesta de disponibilidad para cada catálogo
    const disponibilidadPorCatalogo: Map<number, DisponibilidadTipoDocumentoDto[]> = new Map();
    
    catalogosConDocumentos.forEach(catalogo => {
      const disponibilidadCatalogo: DisponibilidadTipoDocumentoDto[] = [];
      
      tiposDocumento.forEach(tipo => {
        const extensiones = tipo.extensiones.split(',').map(ext => ext.trim());
        const extensionPrincipal = extensiones[0] || tipo.nombre.toLowerCase();
        
        const documento = documentosMap.get(catalogo.id)?.get(tipo.id);
        const tieneDocumentos = !!documento;
        
        const disponibilidadDto: DisponibilidadTipoDocumentoDto = {
          tipoDocumentoId: tipo.id,
          nombre: tipo.nombre,
          disponible: tieneDocumentos,
          extension: extensionPrincipal,
        };

        // Si hay documento disponible, agregar su ID y nombre
        if (documento) {
          disponibilidadDto.documentoId = documento.id;
          disponibilidadDto.documentoNombre = documento.nombre;
        }

        disponibilidadCatalogo.push(disponibilidadDto);
      });

      disponibilidadPorCatalogo.set(catalogo.id, disponibilidadCatalogo);
    });

    return disponibilidadPorCatalogo;
  }

  private mapearCatalogoADto(catalogo: any, disponibilidadPorCatalogo?: Map<number, DisponibilidadTipoDocumentoDto[]>): CatalogoHijosResponseDto {
    const response: CatalogoHijosResponseDto = {
      id: catalogo.id,
      nombre: catalogo.nombre,
      descripcion: catalogo.descripcion || undefined,
      descripcionNivel: catalogo.descripcionNivel || undefined,
      icono: catalogo.icono || undefined,

      nivel: catalogo.nivel,
      orden: catalogo.orden,
      permiteDocumentos: catalogo.permite_documentos,
      fechaCreacion: catalogo.fecha_creacion,
      fechaModificacion: catalogo.fecha_modificacion,
    };

    // Solo agregar disponibilidad si el catálogo permite documentos
    if (catalogo.permite_documentos && disponibilidadPorCatalogo) {
      response.disponibilidadTiposDocumento = disponibilidadPorCatalogo.get(catalogo.id) || [];
    }

    return response;
  }

  async obtenerHijosDeCatalogo(catalogoId: number): Promise<CatalogoHijosResponseDto[]> {
    // Verificar que el catálogo padre existe y está activo
    const catalogoPadre = await this.prisma.catalogo.findFirst({
      where: {
        id: catalogoId,
        activo: true,
      },
    });

    if (!catalogoPadre) {
      throw new NotFoundException(`Catálogo con ID ${catalogoId} no encontrado o inactivo`);
    }

    // Obtener todos los hijos activos del catálogo
    const hijos = await this.prisma.catalogo.findMany({
      where: {
        parent_id: catalogoId,
        activo: true,
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    });

    if (hijos.length === 0) {
      return [];
    }

    // Obtener disponibilidad para catálogos que permiten documentos
    const disponibilidadPorCatalogo = await this.obtenerDisponibilidadParaCatalogos(hijos);

    // Mapear los hijos al DTO de respuesta
    return hijos.map(catalogo => this.mapearCatalogoADto(catalogo, disponibilidadPorCatalogo));
  }

  async obtenerCatalogoPorId(catalogoId: number): Promise<CatalogoHijosResponseDto> {
    const catalogo = await this.prisma.catalogo.findFirst({
      where: {
        id: catalogoId,
        activo: true,
      },
    });

    if (!catalogo) {
      throw new NotFoundException(`Catálogo con ID ${catalogoId} no encontrado o inactivo`);
    }

    // Obtener disponibilidad si el catálogo permite documentos
    let disponibilidadPorCatalogo: Map<number, DisponibilidadTipoDocumentoDto[]> | undefined;
    if (catalogo.permite_documentos) {
      disponibilidadPorCatalogo = await this.obtenerDisponibilidadParaCatalogos([catalogo]);
    }

    return this.mapearCatalogoADto(catalogo, disponibilidadPorCatalogo);
  }

  async obtenerCatalogoRaiz(): Promise<CatalogoHijosResponseDto[]> {
    const catalogosRaiz = await this.prisma.catalogo.findMany({
      where: {
        parent_id: null,
        activo: true,
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    });

    if (catalogosRaiz.length === 0) {
      return [];
    }

    // Obtener disponibilidad para catálogos que permiten documentos
    const disponibilidadPorCatalogo = await this.obtenerDisponibilidadParaCatalogos(catalogosRaiz);

    // Mapear los catálogos raíz al DTO de respuesta
    return catalogosRaiz.map(catalogo => this.mapearCatalogoADto(catalogo, disponibilidadPorCatalogo));
  }

  async obtenerTiposDocumento(): Promise<TipoDocumentoResponseDto[]> {
    const tiposDocumento = await this.prisma.tipoDocumento.findMany({
      where: {
        activo: true,
      },
      orderBy: [
        { nombre: 'asc' },
      ],
    });

    return tiposDocumento.map(tipo => this.mapearTipoDocumentoADto(tipo));
  }

  private mapearTipoDocumentoADto(tipoDocumento: any): TipoDocumentoResponseDto {
    const extensiones = tipoDocumento.extensiones.split(',').map(ext => ext.trim());
    const extensionPrincipal = extensiones[0] || tipoDocumento.nombre.toLowerCase();

    return {
      id: tipoDocumento.id,
      nombre: tipoDocumento.nombre,
      descripcion: tipoDocumento.descripcion || undefined,
      extension: extensionPrincipal,
      extensiones: tipoDocumento.extensiones,
      activo: tipoDocumento.activo,
      fechaCreacion: tipoDocumento.fecha_creacion,
      fechaModificacion: tipoDocumento.fecha_modificacion,
    };
  }
}
