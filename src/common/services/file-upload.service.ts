import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { StorageConfig } from '../../config/storage.config';

export interface FileUploadOptions {
  /**
   * Archivo a subir
   */
  file: {
    originalname: string;
    buffer: Buffer;
    size: number;
    mimetype: string;
  };
  
  /**
   * Directorio de destino dentro del directorio de uploads
   */
  subdirectory?: string;
  
  /**
   * Nombre personalizado para el archivo (sin extensión)
   */
  customName?: string;
  
  /**
   * Extensiones permitidas (ej: ['.pdf', '.csv', '.xlsx'])
   */
  allowedExtensions?: string[];
  
  /**
   * Tamaño máximo en bytes
   */
  maxSize?: number;
}

export interface UploadedFileInfo {
  /**
   * Nombre original del archivo
   */
  originalName: string;
  
  /**
   * Nombre generado para el archivo guardado
   */
  generatedName: string;
  
  /**
   * Ruta relativa del archivo (desde el directorio de uploads)
   */
  relativePath: string;
  
  /**
   * Ruta absoluta del archivo
   */
  absolutePath: string;
  
  /**
   * Tamaño del archivo en bytes
   */
  size: number;
  
  /**
   * Extensión del archivo
   */
  extension: string;
  
  /**
   * Tipo MIME del archivo
   */
  mimeType: string;
}

@Injectable()
export class FileUploadService {
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    const storageConfig = this.configService.get<StorageConfig>('storage');
    this.uploadDir = storageConfig?.uploadDir || './uploads';
    
    // Asegurar que el directorio de uploads existe
    this.ensureUploadDirectory();
  }

  /**
   * Sube un archivo al servidor
   * @param options Opciones de subida
   * @returns Información del archivo subido
   */
  async uploadFile(options: FileUploadOptions): Promise<UploadedFileInfo> {
    const { file, subdirectory = '', customName, allowedExtensions, maxSize } = options;
    
    // Validar que el archivo existe
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Validar tamaño del archivo
    if (maxSize && file.size > maxSize) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo permitido de ${this.formatBytes(maxSize)}`
      );
    }

    // Validar extensión del archivo
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions && allowedExtensions.length > 0) {
      if (!allowedExtensions.includes(extension)) {
        throw new BadRequestException(
          `Extensión no permitida. Extensiones permitidas: ${allowedExtensions.join(', ')}`
        );
      }
    }

    // Generar nombre único para el archivo
    const fileName = this.generateFileName(file.originalname, customName);
    
    // Crear directorio de destino si no existe
    const destinationDir = path.join(this.uploadDir, subdirectory);
    this.ensureDirectoryExists(destinationDir);
    
    // Ruta completa del archivo
    const filePath = path.join(destinationDir, fileName);
    const relativePath = path.join(subdirectory, fileName).replace(/\\/g, '/');

    // Guardar el archivo
    try {
      await fs.promises.writeFile(filePath, file.buffer);
    } catch (error) {
      throw new InternalServerErrorException(`Error al guardar el archivo: ${error.message}`);
    }

    return {
      originalName: file.originalname,
      generatedName: fileName,
      relativePath,
      absolutePath: filePath,
      size: file.size,
      extension,
      mimeType: file.mimetype,
    };
  }

  /**
   * Elimina un archivo del servidor
   * @param filePath Ruta relativa o absoluta del archivo
   * @returns true si se eliminó correctamente
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const resolvedPath = this.resolveFilePath(filePath);
      
      if (!fs.existsSync(resolvedPath)) {
        return false;
      }

      await fs.promises.unlink(resolvedPath);
      return true;
    } catch (error) {
      throw new InternalServerErrorException(`Error al eliminar el archivo: ${error.message}`);
    }
  }

  /**
   * Verifica si un archivo existe
   * @param filePath Ruta relativa o absoluta del archivo
   * @returns true si el archivo existe
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
   * Obtiene información de un archivo
   * @param filePath Ruta relativa o absoluta del archivo
   * @returns Información del archivo o null si no existe
   */
  getFileInfo(filePath: string): UploadedFileInfo | null {
    try {
      const resolvedPath = this.resolveFilePath(filePath);
      
      if (!this.fileExists(filePath)) {
        return null;
      }
      
      const stats = fs.statSync(resolvedPath);
      const extension = path.extname(resolvedPath).toLowerCase();
      const fileName = path.basename(resolvedPath);
      const relativePath = path.relative(this.uploadDir, resolvedPath).replace(/\\/g, '/');

      return {
        originalName: fileName,
        generatedName: fileName,
        relativePath,
        absolutePath: resolvedPath,
        size: stats.size,
        extension,
        mimeType: this.getMimeType(resolvedPath),
      };
    } catch {
      return null;
    }
  }

  /**
   * Genera un nombre único para el archivo
   * @param originalName Nombre original del archivo
   * @param customName Nombre personalizado (opcional)
   * @returns Nombre generado para el archivo
   */
  private generateFileName(originalName: string, customName?: string): string {
    const extension = path.extname(originalName);
    const baseName = customName || path.basename(originalName, extension);
    
    // Generar nombre único con timestamp y UUID
    const timestamp = Date.now();
    const uniqueId = uuidv4().substring(0, 8);
    
    // Limpiar el nombre base (remover caracteres especiales)
    const cleanBaseName = baseName
      .replace(/[^\w\s-]/gi, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    
    return `${cleanBaseName}-${timestamp}-${uniqueId}${extension}`;
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
   * Asegura que el directorio de uploads existe
   */
  private ensureUploadDirectory(): void {
    this.ensureDirectoryExists(this.uploadDir);
  }

  /**
   * Asegura que un directorio existe
   * @param dirPath Ruta del directorio
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
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
   * Formatea bytes a una cadena legible
   * @param bytes Número de bytes
   * @returns Cadena formateada
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
