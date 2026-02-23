import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EstrategiasComunicacionRepository } from './estrategias-comunicacion.repository';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';
import { CreateRedSocialDto } from './dto/create-red-social.dto';
import { UpdateRedSocialDto } from './dto/update-red-social.dto';
import { Noticia } from './entities/noticia.entity';
import { RedSocial } from './entities/red-social.entity';
import { NoticiaCarouselDto } from './dto/noticia-carousel.dto';
import { FileUploadService } from '../../../common/services/file-upload.service';
import { UrlUtilsService } from '../../../common/services/url-utils.service';
import { User } from '../../admin/users/entities/user.entity';
import { StorageConfig } from '../../../config/storage.config';
import { link } from 'fs';

@Injectable()
export class EstrategiasComunicacionService {
  constructor(
    private readonly estrategiasComunicacionRepository: EstrategiasComunicacionRepository,
    private readonly fileUploadService: FileUploadService,
    private readonly urlUtilsService: UrlUtilsService,
    private readonly configService: ConfigService,
  ) {}

  // Métodos para Noticias

  async createNoticia(createNoticiaDto: CreateNoticiaDto): Promise<Noticia> {
    const noticia = await this.estrategiasComunicacionRepository.createNoticia(createNoticiaDto);
    return this.mapToNoticiaEntity(noticia);
  }

  async createNoticiaWithImage(
    createNoticiaDto: CreateNoticiaDto,
    imagen: any | undefined,
    _user: User,
  ): Promise<Noticia> {
    let imagenUrl = createNoticiaDto.imagen_url;

    if (imagen) {
      const uploadedFile = await this.fileUploadService.uploadFile({
        file: imagen,
        subdirectory: 'noticias',
        customName: createNoticiaDto.titulo,
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
      });
      imagenUrl = uploadedFile.relativePath;
    }

    const data: CreateNoticiaDto = {
      ...createNoticiaDto,
      imagen_url: imagenUrl,
      fecha_publicacion: new Date(createNoticiaDto.fecha_publicacion as string | Date),
    };

    const noticia = await this.estrategiasComunicacionRepository.createNoticia(data);
    return this.mapToNoticiaEntity(noticia);
  }

  async updateNoticiaWithImage(
    id: number,
    updateNoticiaDto: UpdateNoticiaDto,
    imagen: any | undefined,
    _user: User,
  ): Promise<Noticia> {
    const noticia = await this.estrategiasComunicacionRepository.findNoticiaById(id);
    if (!noticia) {
      throw new NotFoundException('Noticia no encontrada');
    }

    const data: UpdateNoticiaDto = { ...updateNoticiaDto };

    if (imagen) {
      if (noticia.imagen_url) {
        await this.fileUploadService.deleteFile(noticia.imagen_url);
      }

      const uploadedFile = await this.fileUploadService.uploadFile({
        file: imagen,
        subdirectory: 'noticias',
        customName: updateNoticiaDto.titulo || noticia.titulo,
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
      });
      data.imagen_url = uploadedFile.relativePath;
    }

    if (updateNoticiaDto.fecha_publicacion !== undefined) {
      data.fecha_publicacion = new Date(updateNoticiaDto.fecha_publicacion as string | Date);
    }

    const noticiaActualizada = await this.estrategiasComunicacionRepository.updateNoticia(id, data);
    return this.mapToNoticiaEntity(noticiaActualizada);
  }

  async findAllNoticias(params?: {
    skip?: number;
    take?: number;
    activo?: boolean;
    search?: string;
    orderBy?: 'fecha_publicacion' | 'fecha_creacion';
    order?: 'asc' | 'desc';
  }): Promise<Noticia[]> {
    const noticias = await this.estrategiasComunicacionRepository.findAllNoticias(params);
    return noticias.map(noticia => this.mapToNoticiaEntity(noticia));
  }

  async findNoticiaById(id: number): Promise<Noticia> {
    const noticia = await this.estrategiasComunicacionRepository.findNoticiaById(id);
    if (!noticia) {
      throw new NotFoundException('Noticia no encontrada');
    }
    return this.mapToNoticiaEntity(noticia);
  }

  async updateNoticia(id: number, updateNoticiaDto: UpdateNoticiaDto): Promise<Noticia> {
    const noticia = await this.estrategiasComunicacionRepository.findNoticiaById(id);
    if (!noticia) {
      throw new NotFoundException('Noticia no encontrada');
    }

    const noticiaActualizada = await this.estrategiasComunicacionRepository.updateNoticia(id, updateNoticiaDto);
    return this.mapToNoticiaEntity(noticiaActualizada);
  }

  async toggleNoticiaActivo(id: number, activo: boolean): Promise<Noticia> {
    const noticia = await this.estrategiasComunicacionRepository.findNoticiaById(id);
    if (!noticia) {
      throw new NotFoundException('Noticia no encontrada');
    }

    const noticiaActualizada = await this.estrategiasComunicacionRepository.toggleNoticiaActivo(id, activo);
    return this.mapToNoticiaEntity(noticiaActualizada);
  }

  async deleteNoticia(id: number): Promise<void> {
    const noticia = await this.estrategiasComunicacionRepository.findNoticiaById(id);
    if (!noticia) {
      throw new NotFoundException('Noticia no encontrada');
    }

    await this.estrategiasComunicacionRepository.deleteNoticia(id);
  }

  async getNoticiasRecientes(limit: number = 5): Promise<Noticia[]> {
    const noticias = await this.estrategiasComunicacionRepository.getNoticiasRecientes(limit);
    return noticias.map(noticia => this.mapToNoticiaEntity(noticia));
  }

  async getNoticiasCarousel(limit: number = 5): Promise<NoticiaCarouselDto[]> {
    const noticias = await this.estrategiasComunicacionRepository.getNoticiasRecientes(limit);
    return noticias.map(noticia => this.mapToNoticiaCarouselDto(noticia));
  }

  async countNoticias(activo?: boolean): Promise<number> {
    const where = activo !== undefined ? { activo } : undefined;
    return this.estrategiasComunicacionRepository.countNoticias(where);
  }

  // Métodos para Redes Sociales

  async createRedSocial(createRedSocialDto: CreateRedSocialDto): Promise<RedSocial> {
    const redSocial = await this.estrategiasComunicacionRepository.createRedSocial(createRedSocialDto);
    return this.mapToRedSocialEntity(redSocial);
  }

  async findAllRedesSociales(params?: {
    activo?: boolean;
    orderBy?: 'orden' | 'nombre';
    order?: 'asc' | 'desc';
  }): Promise<RedSocial[]> {
    const redesSociales = await this.estrategiasComunicacionRepository.findAllRedesSociales(params);
    return redesSociales.map(redSocial => this.mapToRedSocialEntity(redSocial));
  }

  async findRedSocialById(id: number): Promise<RedSocial> {
    const redSocial = await this.estrategiasComunicacionRepository.findRedSocialById(id);
    if (!redSocial) {
      throw new NotFoundException('Red social no encontrada');
    }
    return this.mapToRedSocialEntity(redSocial);
  }

  async updateRedSocial(id: number, updateRedSocialDto: UpdateRedSocialDto): Promise<RedSocial> {
    const redSocial = await this.estrategiasComunicacionRepository.findRedSocialById(id);
    if (!redSocial) {
      throw new NotFoundException('Red social no encontrada');
    }

    const redSocialActualizada = await this.estrategiasComunicacionRepository.updateRedSocial(id, updateRedSocialDto);
    return this.mapToRedSocialEntity(redSocialActualizada);
  }

  async toggleRedSocialActivo(id: number, activo: boolean): Promise<RedSocial> {
    const redSocial = await this.estrategiasComunicacionRepository.findRedSocialById(id);
    if (!redSocial) {
      throw new NotFoundException('Red social no encontrada');
    }

    const redSocialActualizada = await this.estrategiasComunicacionRepository.toggleRedSocialActivo(id, activo);
    return this.mapToRedSocialEntity(redSocialActualizada);
  }

  async deleteRedSocial(id: number): Promise<void> {
    const redSocial = await this.estrategiasComunicacionRepository.findRedSocialById(id);
    if (!redSocial) {
      throw new NotFoundException('Red social no encontrada');
    }

    await this.estrategiasComunicacionRepository.deleteRedSocial(id);
  }

  async countRedesSociales(activo?: boolean): Promise<number> {
    const where = activo !== undefined ? { activo } : undefined;
    return this.estrategiasComunicacionRepository.countRedesSociales(where);
  }

  // Métodos para estadísticas

  async getEstadisticas() {
    return this.estrategiasComunicacionRepository.getEstadisticas();
  }

  // Métodos de mapeo

  private mapToNoticiaEntity(noticia: any): Noticia {
    return {
      id: noticia.id,
      titulo: noticia.titulo,
      descripcion_corta: noticia.descripcion_corta,
      contenido: noticia.contenido,
      imagen_url: noticia.imagen_url,
      link: noticia.link,
      fecha_publicacion: noticia.fecha_publicacion,
      activo: noticia.activo,
      fecha_creacion: noticia.fecha_creacion,
      fecha_actualizacion: noticia.fecha_actualizacion,
    };
  }

  private mapToNoticiaCarouselDto(noticia: any): NoticiaCarouselDto {
    // Formatear la fecha para mostrar en el carrusel
    const fechaPublicacion = new Date(noticia.fecha_publicacion);
    const fechaFormateada = this.formatDateForCarousel(fechaPublicacion);
    
    // Crear URL para ver más detalles
    const url = `/estrategias-comunicacion/noticias/${noticia.id}`;
    
    // Usar el título como texto alternativo para la imagen si no hay uno específico
    const imagenAlt = noticia.titulo;

    // imagen_url completa para servir desde /uploads (ej: http://localhost:3001/uploads/noticias/xxx.jpg)
    const imagenUrlCompleta = this.urlUtilsService.getImageUrl(noticia.imagen_url);

    return {
      id: noticia.id,
      titulo: noticia.titulo,
      fecha_formateada: fechaFormateada,
      descripcion_corta: noticia.descripcion_corta,
      imagen_url: imagenUrlCompleta,
      link: noticia.link,
      imagen_alt: imagenAlt,
      url: noticia.link,
      fecha_publicacion: noticia.fecha_publicacion,
    };
  }

  private mapToRedSocialEntity(redSocial: any): RedSocial {
    return {
      id: redSocial.id,
      nombre: redSocial.nombre,
      descripcion: redSocial.descripcion,
      url: redSocial.url,
      icono: redSocial.icono,
      activo: redSocial.activo,
      orden: redSocial.orden,
      fecha_creacion: redSocial.fecha_creacion,
      fecha_actualizacion: redSocial.fecha_actualizacion,
    };
  }

  private formatDateForCarousel(date: Date): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${month} ${year}`;
  }
}