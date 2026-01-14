import { registerAs } from '@nestjs/config';

export interface StorageConfig {
  /**
   * Directorio base para almacenar archivos subidos
   * En desarrollo: ruta local
   * En producción: podría ser una ruta en un contenedor o sistema de archivos compartido
   */
  uploadDir: string;

  /**
   * Tamaño máximo de archivo en bytes
   * Default: 50MB
   */
  maxFileSize: number;

  /**
   * Extensiones permitidas para documentos
   */
  allowedExtensions: string[];

  /**
   * Si es true, se creará la estructura de directorios automáticamente
   */
  autoCreateDirectories: boolean;
}

export default registerAs('storage', (): StorageConfig => ({
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB default
  allowedExtensions: (process.env.ALLOWED_EXTENSIONS || 'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,json,xml,zip,rar,7z')
    .split(',')
    .map(ext => ext.trim().toLowerCase()),
  autoCreateDirectories: process.env.AUTO_CREATE_DIRECTORIES !== 'false',
}));
