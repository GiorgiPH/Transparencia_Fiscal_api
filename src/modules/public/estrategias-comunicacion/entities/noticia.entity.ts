export class Noticia {
  id: number;
  titulo: string;
  descripcion_corta: string;
  contenido: string;
  imagen_url?: string;
  fecha_publicacion: Date;
  activo: boolean;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}
