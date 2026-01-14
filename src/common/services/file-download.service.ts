import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { StorageConfig } from '../../config/storage.config';

export interface FileDownloadOptions {
  /**
   * Ruta del archivo (puede ser absoluta o relativa al directorio de uploads)
   */
  filePath: string;
  
  /**
   * Nombre del archivo para la descarga (opcional)
   * Si no se proporciona, se usará el nombre del archivo de la ruta
   */
  downloadName?: string;
  
  /**
   * Tipo MIME del archivo (opcional)
   * Si no se proporciona, se intentará inferir de la extensión
   */
  mimeType?: string;
  
  /**
   * Si es true, el archivo se enviará como adjunto (download)
   * Si es false, el archivo se mostrará en el navegador (inline)
   */
  asAttachment?: boolean;
}

@Injectable()
export class FileDownloadService {
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    const storageConfig = this.configService.get<StorageConfig>('storage');
    this.uploadDir = storageConfig?.uploadDir || './uploads';
  }

  /**
   * Descarga un archivo del sistema de archivos
   * @param res Objeto Response de Express
   * @param options Opciones de descarga
   * @throws NotFoundException si el archivo no existe
   * @throws InternalServerErrorException si hay un error al leer el archivo
   */
  async downloadFile(res: Response, options: FileDownloadOptions): Promise<void> {
    const { filePath, downloadName, mimeType, asAttachment = true } = options;
    
    // Resolver la ruta del archivo (absoluta o relativa al directorio de uploads)
    const resolvedPath = this.resolveFilePath(filePath);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(resolvedPath)) {
      throw new NotFoundException(`Archivo no encontrado: ${filePath}`);
    }

    // Obtener estadísticas del archivo
    const stats = fs.statSync(resolvedPath);
    
    // Determinar el nombre del archivo para la descarga
    const fileName = downloadName || path.basename(resolvedPath);
    
    // Determinar el tipo MIME
    const contentType = mimeType || this.getMimeType(resolvedPath);
    
    // Configurar headers de la respuesta
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size.toString());
    
    if (asAttachment) {
      res.setHeader('Content-Disposition', `attachment; filename="${this.sanitizeFileName(fileName)}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${this.sanitizeFileName(fileName)}"`);
    }
    
    // Configurar headers de caché (opcional)
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.setHeader('Last-Modified', stats.mtime.toUTCString());
    
    // Crear stream de lectura y enviar el archivo
    try {
      const fileStream = fs.createReadStream(resolvedPath);
      fileStream.pipe(res);
      
      // Manejar errores del stream
      fileStream.on('error', (error) => {
        throw new InternalServerErrorException(`Error al leer el archivo: ${error.message}`);
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error al procesar la descarga: ${error.message}`);
    }
  }

  /**
   * Resuelve una ruta de archivo (absoluta o relativa)
   * @param filePath Ruta del archivo (absoluta o relativa)
   * @returns Ruta absoluta del archivo
   */
  private resolveFilePath(filePath: string): string {
    // Si es ruta absoluta, usarla directamente
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    
    // Si empieza con ./ o ../, resolver desde el directorio de uploads
    if (filePath.startsWith('./') || filePath.startsWith('../')) {
      return path.resolve(this.uploadDir, filePath);
    }
    
    // Si es solo un nombre de archivo, asumir que está en el directorio de uploads
    return path.join(this.uploadDir, filePath);
  }

  /**
   * Verifica si un archivo existe y es accesible
   * @param filePath Ruta del archivo (absoluta o relativa)
   * @returns true si el archivo existe y es legible
   */
  fileExists(filePath: string): boolean {
    try {
      const resolvedPath = this.resolveFilePath(filePath);
      return fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile();
    } catch {
      return false;
    }
  }

  /**
   * Obtiene información básica de un archivo
   * @param filePath Ruta del archivo (absoluta o relativa)
   * @returns Información del archivo o null si no existe
   */
  getFileInfo(filePath: string): { size: number; mtime: Date; extension: string } | null {
    try {
      const resolvedPath = this.resolveFilePath(filePath);
      
      if (!this.fileExists(filePath)) {
        return null;
      }
      
      const stats = fs.statSync(resolvedPath);
      const extension = path.extname(resolvedPath).toLowerCase();
      
      return {
        size: stats.size,
        mtime: stats.mtime,
        extension,
      };
    } catch {
      return null;
    }
  }

  /**
   * Obtiene el tipo MIME basado en la extensión del archivo
   * @param filePath Ruta del archivo
   * @returns Tipo MIME
   */
  private getMimeType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.html': 'text/html',
      '.htm': 'text/html',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.7z': 'application/x-7z-compressed',
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

  /**
   * Sanitiza el nombre del archivo para headers HTTP
   * @param fileName Nombre del archivo
   * @returns Nombre sanitizado
   */
  private sanitizeFileName(fileName: string): string {
    // Reemplazar caracteres problemáticos
    return fileName.replace(/[^\w\s.-]/gi, '_');
  }
}
