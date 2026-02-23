import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageConfig } from '../../config/storage.config';

@Injectable()
export class UrlUtilsService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Obtiene la URL base de la API
   * @returns URL base de la API (ej: http://localhost:3001)
   */
  getApiBaseUrl(): string {
    const storage = this.configService.get<StorageConfig>('storage');
    return storage?.apiBaseUrl || `http://localhost:${this.configService.get('PORT') || '3001'}`;
  }

  /**
   * Construye una URL completa para un archivo subido
   * @param relativePath Ruta relativa del archivo (ej: 'noticias/imagen.jpg')
   * @returns URL completa del archivo o undefined si la ruta es inválida
   */
  getFileUrl(relativePath: string | null | undefined): string | undefined {
    if (!relativePath || relativePath.trim() === '') return undefined;
    
    // Si ya es una URL completa, retornarla directamente
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }

    const baseUrl = this.getApiBaseUrl().replace(/\/$/, '');
    const path = relativePath.replace(/^\//, '');
    return `${baseUrl}/uploads/${path}`;
  }

  /**
   * Construye una URL completa para una imagen
   * @param imagePath Ruta relativa de la imagen (ej: 'noticias/imagen.jpg')
   * @returns URL completa de la imagen o undefined si la ruta es inválida
   */
  getImageUrl(imagePath: string | null | undefined): string | undefined {
    return this.getFileUrl(imagePath);
  }

  /**
   * Construye una URL completa para un documento
   * @param documentPath Ruta relativa del documento (ej: 'documentos/archivo.pdf')
   * @returns URL completa del documento o undefined si la ruta es inválida
   */
  getDocumentUrl(documentPath: string | null | undefined): string | undefined {
    return this.getFileUrl(documentPath);
  }

  /**
   * Extrae la ruta relativa de una URL completa
   * @param url URL completa del archivo
   * @returns Ruta relativa o la misma URL si no es una URL de uploads
   */
  extractRelativePath(url: string): string {
    if (!url) return url;
    
    const baseUrl = this.getApiBaseUrl();
    const uploadsPrefix = `${baseUrl}/uploads/`;
    
    if (url.startsWith(uploadsPrefix)) {
      return url.substring(uploadsPrefix.length);
    }
    
    return url;
  }

  /**
   * Verifica si una URL es una URL de uploads local
   * @param url URL a verificar
   * @returns true si es una URL de uploads local
   */
  isLocalUploadUrl(url: string): boolean {
    if (!url) return false;
    
    const baseUrl = this.getApiBaseUrl();
    return url.startsWith(`${baseUrl}/uploads/`);
  }
}