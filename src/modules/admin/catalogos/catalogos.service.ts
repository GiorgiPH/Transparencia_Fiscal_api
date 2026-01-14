import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CatalogosRepository } from './catalogos.repository';
import { CreateCatalogoDto } from './dto/create-catalogo.dto';
import { UpdateCatalogoDto } from './dto/update-catalogo.dto';
import { User } from '../users/entities/user.entity';
import { PrismaService } from '../../../prisma/prisma.service';
import { DisponibilidadTipoDocumentoDto } from '../../public/catalogos/dto/disponibilidad-tipo-documento.dto';

@Injectable()
export class CatalogosService {
  constructor(
    private readonly catalogosRepository: CatalogosRepository,
    private readonly prisma: PrismaService,
  ) {}

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

  private mapearCatalogoConDisponibilidad(catalogo: any, disponibilidadPorCatalogo?: Map<number, DisponibilidadTipoDocumentoDto[]>): any {
    const response = {
      ...catalogo,
    };

    // Solo agregar disponibilidad si el catálogo permite documentos
    if (catalogo.permite_documentos && disponibilidadPorCatalogo) {
      response.disponibilidadTiposDocumento = disponibilidadPorCatalogo.get(catalogo.id) || [];
    }

    return response;
  }

  async create(createCatalogoDto: CreateCatalogoDto, user: User) {
    const { parent_id, ...rest } = createCatalogoDto;

    // Calcular nivel
    let nivel = 0;
    if (parent_id) {
      const parentIdNum = parseInt(parent_id, 10);
      const parent = await this.catalogosRepository.findById(parentIdNum);
      if (!parent) {
        throw new NotFoundException(`Catálogo padre con ID ${parent_id} no encontrado`);
      }
      nivel = parent.nivel + 1;
    }

    const data = {
      ...rest,
      nivel,
      usuario_creacion_id: user.id,
      ...(parent_id && { parent: { connect: { id: parseInt(parent_id, 10) } } }),
    };

    return this.catalogosRepository.create(data);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  }) {
    return this.catalogosRepository.findAll(params);
  }

  async findOne(id: number) {
    const catalogo = await this.catalogosRepository.findById(id);
    if (!catalogo) {
      throw new NotFoundException(`Catálogo con ID ${id} no encontrado`);
    }
    return catalogo;
  }

  async findRootCatalogs() {
    return this.catalogosRepository.findRootCatalogs();
  }

  async findChildren(parentId: number) {
    const parent = await this.catalogosRepository.findById(parentId);
    if (!parent) {
      throw new NotFoundException(`Catálogo padre con ID ${parentId} no encontrado`);
    }
    
    const hijos = await this.catalogosRepository.findChildren(parentId);
    
    if (hijos.length === 0) {
      return [];
    }

    // Obtener disponibilidad para catálogos que permiten documentos
    const disponibilidadPorCatalogo = await this.obtenerDisponibilidadParaCatalogos(hijos);

    // Mapear los hijos incluyendo disponibilidad
    return hijos.map(catalogo => this.mapearCatalogoConDisponibilidad(catalogo, disponibilidadPorCatalogo));
  }

  async findTree(parentId?: number) {
    if (parentId) {
      const parent = await this.catalogosRepository.findById(parentId);
      if (!parent) {
        throw new NotFoundException(`Catálogo padre con ID ${parentId} no encontrado`);
      }
    }
    return this.catalogosRepository.findTree(parentId);
  }

  async update(id: number, updateCatalogoDto: UpdateCatalogoDto, user: User) {
    const catalogo = await this.catalogosRepository.findById(id);
    if (!catalogo) {
      throw new NotFoundException(`Catálogo con ID ${id} no encontrado`);
    }

    const { parent_id, ...rest } = updateCatalogoDto;

    // Si se cambia el parent, recalcular nivel
    let nivel = catalogo.nivel;
    if (parent_id !== undefined) {
      if (parent_id === null) {
        nivel = 0;
      } else {
        const parentIdNum = parseInt(parent_id, 10);
        const parent = await this.catalogosRepository.findById(parentIdNum);
        if (!parent) {
          throw new NotFoundException(`Catálogo padre con ID ${parent_id} no encontrado`);
        }
        nivel = parent.nivel + 1;
      }
    }

    const data = {
      ...rest,
      nivel,
      usuario_modif_id: user.id,
      ...(parent_id !== undefined && {
        parent: parent_id === null ? { disconnect: true } : { connect: { id: parseInt(parent_id, 10) } },
      }),
    };

    return this.catalogosRepository.update(id, data);
  }

  async remove(id: number) {
    const catalogo = await this.catalogosRepository.findById(id);
    if (!catalogo) {
      throw new NotFoundException(`Catálogo con ID ${id} no encontrado`);
    }

    // Verificar si tiene hijos activos
    const children = await this.catalogosRepository.findChildren(id);
    if (children.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar el catálogo porque tiene subcategorías asociadas. ' +
        'Primero elimine o mueva las subcategorías.'
      );
    }

    // Verificar si tiene documentos activos
    const hasDocuments = await this.catalogosRepository.hasDocuments(id);
    if (hasDocuments) {
      throw new BadRequestException(
        'No se puede eliminar el catálogo porque tiene documentos asociados. ' +
        'Primero elimine o mueva los documentos.'
      );
    }

    return this.catalogosRepository.delete(id);
  }

  async searchByName(name: string) {
    if (!name || name.trim().length < 2) {
      throw new BadRequestException('El término de búsqueda debe tener al menos 2 caracteres');
    }
    return this.catalogosRepository.searchByName(name.trim());
  }

  async count() {
    return this.catalogosRepository.count({ activo: true });
  }

  async updateOrden(id: number, orden: number) {
    const catalogo = await this.catalogosRepository.findById(id);
    if (!catalogo) {
      throw new NotFoundException(`Catálogo con ID ${id} no encontrado`);
    }
    await this.catalogosRepository.updateOrden(id, orden);
    return { message: 'Orden actualizado correctamente' };
  }

  async findCatalogWithChildren(id: number) {
    const catalogo = await this.catalogosRepository.findById(id);
    if (!catalogo) {
      throw new NotFoundException(`Catálogo con ID ${id} no encontrado`);
    }

    // Obtener hijos recursivamente usando el método findTree del repository
    const children = await this.catalogosRepository.findTree(id);
    
    // Obtener disponibilidad para catálogos que permiten documentos (incluyendo hijos)
    const catalogosConDocumentos = this.obtenerCatalogosConDocumentosRecursivamente([catalogo, ...children]);
    const disponibilidadPorCatalogo = await this.obtenerDisponibilidadParaCatalogos(catalogosConDocumentos);

    // Mapear el catálogo principal con sus hijos
    return this.mapearCatalogoConDisponibilidadRecursivamente(catalogo, children, disponibilidadPorCatalogo);
  }

  async findDocumentAvailability(id: number) {
    const catalogo = await this.catalogosRepository.findById(id);
    if (!catalogo) {
      throw new NotFoundException(`Catálogo con ID ${id} no encontrado`);
    }

    // Solo obtener disponibilidad para este catálogo específico
    const disponibilidadPorCatalogo = await this.obtenerDisponibilidadParaCatalogos([catalogo]);
    
    return {
      id: catalogo.id,
      nombre: catalogo.nombre,
      permite_documentos: catalogo.permite_documentos,
      disponibilidadTiposDocumento: disponibilidadPorCatalogo.get(catalogo.id) || []
    };
  }

  private obtenerCatalogosConDocumentosRecursivamente(catalogos: any[]): any[] {
    const result: any[] = [];
    
    const procesarCatalogo = (catalogo: any) => {
      if (catalogo.permite_documentos) {
        result.push(catalogo);
      }
      
      if (catalogo.children && Array.isArray(catalogo.children)) {
        catalogo.children.forEach((child: any) => procesarCatalogo(child));
      }
    };
    
    catalogos.forEach(catalogo => procesarCatalogo(catalogo));
    return result;
  }

  private mapearCatalogoConDisponibilidadRecursivamente(
    catalogo: any, 
    children: any[], 
    disponibilidadPorCatalogo: Map<number, DisponibilidadTipoDocumentoDto[]>
  ): any {
    const response = this.mapearCatalogoConDisponibilidad(catalogo, disponibilidadPorCatalogo);
    
    if (children && children.length > 0) {
      response.children = children.map(child => 
        this.mapearCatalogoConDisponibilidadRecursivamente(child, child.children || [], disponibilidadPorCatalogo)
      );
    }
    
    return response;
  }
}
