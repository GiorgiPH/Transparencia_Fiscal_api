import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DocumentosRepository } from './documentos.repository';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { CatalogosRepository } from '../catalogos/catalogos.repository';
import { User } from '../users/entities/user.entity';
import { FileUploadService } from '../../../common/services/file-upload.service';

@Injectable()
export class DocumentosService {
  constructor(
    private readonly documentosRepository: DocumentosRepository,
    private readonly catalogosRepository: CatalogosRepository,
    private readonly fileUploadService: FileUploadService,
  ) {}



  async createWithFile(createDocumentoDto: CreateDocumentoDto, archivo: any, user: User) {
    // Verificar que el catálogo existe y permite documentos
    const catalogoIdNum = createDocumentoDto.catalogo_id;
    const catalogo = await this.catalogosRepository.findById(catalogoIdNum);
    if (!catalogo) {
      throw new NotFoundException(`Catálogo con ID ${createDocumentoDto.catalogo_id} no encontrado`);
    }

    if (!catalogo.permite_documentos) {
      throw new BadRequestException(`El catálogo "${catalogo.nombre}" no permite documentos`);
    }

    // Subir el archivo
    const uploadedFile = await this.fileUploadService.uploadFile({
      file: archivo,
      subdirectory: `catalogo-${catalogoIdNum}`,
      customName: createDocumentoDto.nombre,
      allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.json', '.xml', '.zip', '.rar', '.7z'],
      maxSize: 50 * 1024 * 1024, // 50MB
    });

    // Mapear DTO a datos de Prisma
    const data: any = {
      nombre: createDocumentoDto.nombre,
      descripcion: createDocumentoDto.descripcion,
      ejercicio_fiscal: createDocumentoDto.ejercicio_fiscal || new Date().getFullYear(),
      ruta_archivo: uploadedFile.relativePath,
      extension: uploadedFile.extension.replace('.', ''),
      peso_archivo: uploadedFile.size.toString(),
      periodicidad: createDocumentoDto.periodicidad,
      fecha_publicacion: createDocumentoDto.fecha_publicacion ? new Date(createDocumentoDto.fecha_publicacion) : null,
      institucion_emisora: 'Gobierno del Estado de Morelos',
      usuario_creacion_id: user.id,
      catalogo: {
        connect: { id: createDocumentoDto.catalogo_id },
      },
    };

    // Si se proporciona tipo_documento_id, conectar con TipoDocumento
    if (createDocumentoDto.tipo_documento_id) {
      data.tipo_documento = {
        connect: { id: createDocumentoDto.tipo_documento_id },
      };
    }

    return this.documentosRepository.create(data);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  }) {
    return this.documentosRepository.findAll(params);
  }

  async findOne(id: number) {
    const documento = await this.documentosRepository.findById(id);
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }
    return documento;
  }

  async findByCatalogoId(catalogoId: number, params?: {
    skip?: number;
    take?: number;
    orderBy?: any;
  }) {
    // Verificar que el catálogo existe
    const catalogo = await this.catalogosRepository.findById(catalogoId);
    if (!catalogo) {
      throw new NotFoundException(`Catálogo con ID ${catalogoId} no encontrado`);
    }

    return this.documentosRepository.findByCatalogoId(catalogoId, params);
  }

  async findPublicDocuments(params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  }) {
    return this.documentosRepository.findPublicDocuments(params);
  }

  
  async updateWithFile(id: number, updateDocumentoDto: UpdateDocumentoDto, archivo: any, user: User) {
    const documento = await this.documentosRepository.findById(id);
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Si se cambia el catálogo, verificar que existe y permite documentos
    if (updateDocumentoDto.catalogo_id) {
      const catalogoIdNum = updateDocumentoDto.catalogo_id;
      const catalogo = await this.catalogosRepository.findById(catalogoIdNum);
      if (!catalogo) {
        throw new NotFoundException(`Catálogo con ID ${updateDocumentoDto.catalogo_id} no encontrado`);
      }

      if (!catalogo.permite_documentos) {
        throw new BadRequestException(`El catálogo "${catalogo.nombre}" no permite documentos`);
      }
    }

    // Mapear DTO a datos de Prisma
    const data: any = {
      usuario_modif_id: user.id,
    };

    if (updateDocumentoDto.nombre !== undefined) {
      data.nombre = updateDocumentoDto.nombre;
    }

    if (updateDocumentoDto.descripcion !== undefined) {
      data.descripcion = updateDocumentoDto.descripcion;
    }

    if (updateDocumentoDto.ejercicio_fiscal !== undefined) {
      data.ejercicio_fiscal = updateDocumentoDto.ejercicio_fiscal;
    }

   /*  if (updateDocumentoDto.tipo_documento_id !== undefined) {
      data.tipo_documento = {
        connect: { id: updateDocumentoDto.tipo_documento_id },
      };
    } */

    if (updateDocumentoDto.fecha_publicacion !== undefined) {
      data.fecha_publicacion = updateDocumentoDto.fecha_publicacion ? new Date(updateDocumentoDto.fecha_publicacion) : null;
    }

    if (updateDocumentoDto.catalogo_id !== undefined) {
      data.catalogo = {
        connect: { id: updateDocumentoDto.catalogo_id },
      };
    }

    if (updateDocumentoDto.activo !== undefined) {
      data.activo = updateDocumentoDto.activo;
    }

    // Si se proporciona un archivo, subirlo y actualizar la información del archivo
    if (archivo) {
      // Eliminar el archivo anterior si existe
      if (documento.ruta_archivo) {
        await this.fileUploadService.deleteFile(documento.ruta_archivo);
      }

      // Obtener el ID del catálogo (usar el nuevo si se proporciona, o el existente)
      const catalogoId = updateDocumentoDto.catalogo_id || documento.catalogo_id.toString();
      const catalogoIdNum = catalogoId;

      // Subir el nuevo archivo
      const uploadedFile = await this.fileUploadService.uploadFile({
        file: archivo,
        subdirectory: `catalogo-${catalogoIdNum}`,
        customName: updateDocumentoDto.nombre ,
        allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.json', '.xml', '.zip', '.rar', '.7z'],
        maxSize: 50 * 1024 * 1024, // 50MB
      });

      data.ruta_archivo = uploadedFile.relativePath;
      data.extension = uploadedFile.extension.replace('.', '');
      data.peso_archivo = uploadedFile.size.toString();
    } 

    return this.documentosRepository.update(id, data);
  }

  async remove(id: number) {
    const documento = await this.documentosRepository.findById(id);
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    return this.documentosRepository.delete(id);
  }

  async search(params: {
    query: string;
    skip?: number;
    take?: number;
    catalogoId?: number;
    ejercicioFiscal?: number;
  }) {
    if (!params.query || params.query.trim().length < 2) {
      throw new BadRequestException('El término de búsqueda debe tener al menos 2 caracteres');
    }

    return this.documentosRepository.search({
      query: params.query.trim(),
      skip: params.skip,
      take: params.take,
      catalogoId: params.catalogoId,
      ejercicioFiscal: params.ejercicioFiscal,
    });
  }

  async getStatsByCatalogo(catalogoId: number) {
    const catalogo = await this.catalogosRepository.findById(catalogoId);
    if (!catalogo) {
      throw new NotFoundException(`Catálogo con ID ${catalogoId} no encontrado`);
    }

    return this.documentosRepository.getStatsByCatalogo(catalogoId);
  }

  async getRecentDocuments(limit: number = 10) {
    return this.documentosRepository.getRecentDocuments(limit);
  }

  async count(where?: any) {
    return this.documentosRepository.count(where);
  }

  
}
