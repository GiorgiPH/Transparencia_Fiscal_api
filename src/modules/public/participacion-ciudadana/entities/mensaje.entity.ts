export class Mensaje {
  id: string;
  folio: string;
  nombre_completo: string;
  correo_electronico: string;
  asunto: string;
  mensaje: string;
  estatus: string;
  canal: string;
  area_destino?: string;
  respuesta?: string;
  fecha_respuesta?: Date;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  direccion_ip?: string;
  agente_usuario?: string;
}
