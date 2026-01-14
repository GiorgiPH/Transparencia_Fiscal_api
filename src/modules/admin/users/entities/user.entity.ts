export class User {
  id: number;
  email: string;
  password: string;
  name?: string | null;
  foto_perfil?: string | null;
  area_departamento?: string | null;
  telefono?: string | null;
  requiere_2fa: boolean;
  activo: boolean;
  ultimo_acceso?: Date | null;
  fecha_creacion: Date;
  fecha_modificacion: Date;
  fecha_ultimo_cambio_pass?: Date | null;
  usuario_creacion_id?: number | null;
  usuario_modif_id?: number | null;
  institucion_id?: string | null;
  
  // Relaciones
  roles?: any[];
  refreshTokens?: any[];
  verificationCodes?: any[];
}
