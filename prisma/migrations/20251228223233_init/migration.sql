BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] INT NOT NULL IDENTITY(1,1),
    [login] NVARCHAR(1000) NOT NULL,
    [password_hash] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [foto_perfil] NVARCHAR(1000),
    [area_departamento] NVARCHAR(1000),
    [telefono] NVARCHAR(1000),
    [requiere_2fa] BIT NOT NULL CONSTRAINT [users_requiere_2fa_df] DEFAULT 0,
    [activo] BIT NOT NULL CONSTRAINT [users_activo_df] DEFAULT 1,
    [ultimo_acceso] DATETIME2,
    [fecha_creacion] DATETIME2 NOT NULL CONSTRAINT [users_fecha_creacion_df] DEFAULT CURRENT_TIMESTAMP,
    [fecha_modificacion] DATETIME2 NOT NULL,
    [fecha_ultimo_cambio_pass] DATETIME2,
    [usuario_creacion_id] INT,
    [usuario_modif_id] INT,
    [institucion_id] NVARCHAR(1000),
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_login_key] UNIQUE NONCLUSTERED ([login])
);

-- CreateTable
CREATE TABLE [dbo].[roles] (
    [rol_id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [descripcion] NVARCHAR(1000),
    [activo] BIT NOT NULL CONSTRAINT [roles_activo_df] DEFAULT 1,
    [fecha_creacion] DATETIME2 NOT NULL CONSTRAINT [roles_fecha_creacion_df] DEFAULT CURRENT_TIMESTAMP,
    [fecha_modificacion] DATETIME2 NOT NULL,
    CONSTRAINT [roles_pkey] PRIMARY KEY CLUSTERED ([rol_id]),
    CONSTRAINT [roles_nombre_key] UNIQUE NONCLUSTERED ([nombre])
);

-- CreateTable
CREATE TABLE [dbo].[permisos] (
    [permiso_id] INT NOT NULL IDENTITY(1,1),
    [codigo] NVARCHAR(1000) NOT NULL,
    [descripcion] NVARCHAR(1000) NOT NULL,
    [fecha_creacion] DATETIME2 NOT NULL CONSTRAINT [permisos_fecha_creacion_df] DEFAULT CURRENT_TIMESTAMP,
    [fecha_modificacion] DATETIME2 NOT NULL,
    CONSTRAINT [permisos_pkey] PRIMARY KEY CLUSTERED ([permiso_id]),
    CONSTRAINT [permisos_codigo_key] UNIQUE NONCLUSTERED ([codigo])
);

-- CreateTable
CREATE TABLE [dbo].[usuario_roles] (
    [id] INT NOT NULL IDENTITY(1,1),
    [usuario_id] INT NOT NULL,
    [rol_id] INT NOT NULL,
    [fecha_asignacion] DATETIME2 NOT NULL CONSTRAINT [usuario_roles_fecha_asignacion_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [usuario_roles_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [usuario_roles_usuario_id_rol_id_key] UNIQUE NONCLUSTERED ([usuario_id],[rol_id])
);

-- CreateTable
CREATE TABLE [dbo].[rol_permisos] (
    [id] INT NOT NULL IDENTITY(1,1),
    [rol_id] INT NOT NULL,
    [permiso_id] INT NOT NULL,
    [fecha_asignacion] DATETIME2 NOT NULL CONSTRAINT [rol_permisos_fecha_asignacion_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [rol_permisos_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [rol_permisos_rol_id_permiso_id_key] UNIQUE NONCLUSTERED ([rol_id],[permiso_id])
);

-- CreateTable
CREATE TABLE [dbo].[refresh_tokens] (
    [refresh_token_id] NVARCHAR(1000) NOT NULL,
    [usuario_id] INT NOT NULL,
    [token_hash] NVARCHAR(1000) NOT NULL,
    [ip_origen] NVARCHAR(1000),
    [user_agent] NVARCHAR(1000),
    [fecha_expiracion] DATETIME2 NOT NULL,
    [activo] BIT NOT NULL CONSTRAINT [refresh_tokens_activo_df] DEFAULT 1,
    [fecha_creacion] DATETIME2 NOT NULL CONSTRAINT [refresh_tokens_fecha_creacion_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [refresh_tokens_pkey] PRIMARY KEY CLUSTERED ([refresh_token_id])
);

-- CreateTable
CREATE TABLE [dbo].[catalogos] (
    [catalogo_id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [descripcion] NVARCHAR(1000),
    [parent_id] INT,
    [nivel] INT NOT NULL CONSTRAINT [catalogos_nivel_df] DEFAULT 0,
    [orden] INT NOT NULL CONSTRAINT [catalogos_orden_df] DEFAULT 0,
    [activo] BIT NOT NULL CONSTRAINT [catalogos_activo_df] DEFAULT 1,
    [permite_documentos] BIT NOT NULL CONSTRAINT [catalogos_permite_documentos_df] DEFAULT 1,
    [fecha_creacion] DATETIME2 NOT NULL CONSTRAINT [catalogos_fecha_creacion_df] DEFAULT CURRENT_TIMESTAMP,
    [fecha_modificacion] DATETIME2 NOT NULL,
    [usuario_creacion_id] INT NOT NULL,
    [usuario_modif_id] INT,
    CONSTRAINT [catalogos_pkey] PRIMARY KEY CLUSTERED ([catalogo_id])
);

-- CreateTable
CREATE TABLE [dbo].[tipos_documento] (
    [tipo_documento_id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [descripcion] NVARCHAR(1000),
    [extensiones] NVARCHAR(1000) NOT NULL,
    [activo] BIT NOT NULL CONSTRAINT [tipos_documento_activo_df] DEFAULT 1,
    [fecha_creacion] DATETIME2 NOT NULL CONSTRAINT [tipos_documento_fecha_creacion_df] DEFAULT CURRENT_TIMESTAMP,
    [fecha_modificacion] DATETIME2 NOT NULL,
    [usuario_creacion_id] INT NOT NULL,
    [usuario_modif_id] INT,
    CONSTRAINT [tipos_documento_pkey] PRIMARY KEY CLUSTERED ([tipo_documento_id]),
    CONSTRAINT [tipos_documento_nombre_key] UNIQUE NONCLUSTERED ([nombre])
);

-- CreateTable
CREATE TABLE [dbo].[documentos] (
    [documento_id] INT NOT NULL IDENTITY(1,1),
    [catalogo_id] INT NOT NULL,
    [tipo_documento_id] INT NOT NULL,
    [nombre] NVARCHAR(1000) NOT NULL,
    [descripcion] NVARCHAR(1000),
    [ejercicio_fiscal] INT NOT NULL,
    [ruta_archivo] NVARCHAR(1000) NOT NULL,
    [extension] NVARCHAR(1000) NOT NULL,
    [peso_archivo] DECIMAL(32,16),
    [version] INT NOT NULL CONSTRAINT [documentos_version_df] DEFAULT 1,
    [estatus] NVARCHAR(1000) NOT NULL CONSTRAINT [documentos_estatus_df] DEFAULT 'borrador',
    [fecha_publicacion] DATETIME2,
    [activo] BIT NOT NULL CONSTRAINT [documentos_activo_df] DEFAULT 1,
    [institucion_emisora] NVARCHAR(1000),
    [fecha_creacion] DATETIME2 NOT NULL CONSTRAINT [documentos_fecha_creacion_df] DEFAULT CURRENT_TIMESTAMP,
    [fecha_modificacion] DATETIME2 NOT NULL,
    [usuario_creacion_id] INT NOT NULL,
    [usuario_modif_id] INT,
    CONSTRAINT [documentos_pkey] PRIMARY KEY CLUSTERED ([documento_id]),
    CONSTRAINT [documentos_catalogo_id_tipo_documento_id_key] UNIQUE NONCLUSTERED ([catalogo_id],[tipo_documento_id])
);

-- CreateTable
CREATE TABLE [dbo].[verification_codes] (
    [verification_code_id] NVARCHAR(1000) NOT NULL,
    [usuario_id] INT NOT NULL,
    [codigo] NVARCHAR(1000) NOT NULL,
    [tipo] NVARCHAR(1000) NOT NULL,
    [usado] BIT NOT NULL CONSTRAINT [verification_codes_usado_df] DEFAULT 0,
    [fecha_expiracion] DATETIME2 NOT NULL,
    [fecha_creacion] DATETIME2 NOT NULL CONSTRAINT [verification_codes_fecha_creacion_df] DEFAULT CURRENT_TIMESTAMP,
    [fecha_uso] DATETIME2,
    CONSTRAINT [verification_codes_pkey] PRIMARY KEY CLUSTERED ([verification_code_id])
);

-- CreateTable
CREATE TABLE [dbo].[mensajes_participacion_ciudadana] (
    [id_mensaje] NVARCHAR(1000) NOT NULL,
    [folio] NVARCHAR(1000) NOT NULL,
    [nombre_completo] NVARCHAR(1000) NOT NULL,
    [correo_electronico] NVARCHAR(1000) NOT NULL,
    [asunto] NVARCHAR(1000) NOT NULL,
    [mensaje] NVARCHAR(1000) NOT NULL,
    [estatus] NVARCHAR(1000) NOT NULL CONSTRAINT [mensajes_participacion_ciudadana_estatus_df] DEFAULT 'pendiente',
    [canal] NVARCHAR(1000) NOT NULL CONSTRAINT [mensajes_participacion_ciudadana_canal_df] DEFAULT 'web',
    [area_destino] NVARCHAR(1000),
    [respuesta] NVARCHAR(1000),
    [fecha_respuesta] DATETIME2,
    [fecha_creacion] DATETIME2 NOT NULL CONSTRAINT [mensajes_participacion_ciudadana_fecha_creacion_df] DEFAULT CURRENT_TIMESTAMP,
    [fecha_actualizacion] DATETIME2 NOT NULL,
    [direccion_ip] NVARCHAR(1000),
    [agente_usuario] NVARCHAR(1000),
    CONSTRAINT [mensajes_participacion_ciudadana_pkey] PRIMARY KEY CLUSTERED ([id_mensaje]),
    CONSTRAINT [mensajes_participacion_ciudadana_folio_key] UNIQUE NONCLUSTERED ([folio])
);

-- CreateTable
CREATE TABLE [dbo].[noticias] (
    [id] INT NOT NULL IDENTITY(1,1),
    [titulo] NVARCHAR(1000) NOT NULL,
    [descripcion_corta] NVARCHAR(1000) NOT NULL,
    [contenido] NVARCHAR(1000) NOT NULL,
    [imagen_url] NVARCHAR(1000),
    [fecha_publicacion] DATETIME2 NOT NULL,
    [activo] BIT NOT NULL CONSTRAINT [noticias_activo_df] DEFAULT 1,
    [fecha_creacion] DATETIME2 NOT NULL CONSTRAINT [noticias_fecha_creacion_df] DEFAULT CURRENT_TIMESTAMP,
    [fecha_actualizacion] DATETIME2 NOT NULL,
    CONSTRAINT [noticias_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[redes_sociales] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [url] NVARCHAR(1000) NOT NULL,
    [icono] NVARCHAR(1000) NOT NULL,
    [activo] BIT NOT NULL CONSTRAINT [redes_sociales_activo_df] DEFAULT 1,
    [orden] INT NOT NULL CONSTRAINT [redes_sociales_orden_df] DEFAULT 0,
    [fecha_creacion] DATETIME2 NOT NULL CONSTRAINT [redes_sociales_fecha_creacion_df] DEFAULT CURRENT_TIMESTAMP,
    [fecha_actualizacion] DATETIME2 NOT NULL,
    CONSTRAINT [redes_sociales_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[usuario_roles] ADD CONSTRAINT [usuario_roles_usuario_id_fkey] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[usuario_roles] ADD CONSTRAINT [usuario_roles_rol_id_fkey] FOREIGN KEY ([rol_id]) REFERENCES [dbo].[roles]([rol_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[rol_permisos] ADD CONSTRAINT [rol_permisos_rol_id_fkey] FOREIGN KEY ([rol_id]) REFERENCES [dbo].[roles]([rol_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[rol_permisos] ADD CONSTRAINT [rol_permisos_permiso_id_fkey] FOREIGN KEY ([permiso_id]) REFERENCES [dbo].[permisos]([permiso_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[refresh_tokens] ADD CONSTRAINT [refresh_tokens_usuario_id_fkey] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[catalogos] ADD CONSTRAINT [catalogos_parent_id_fkey] FOREIGN KEY ([parent_id]) REFERENCES [dbo].[catalogos]([catalogo_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[documentos] ADD CONSTRAINT [documentos_catalogo_id_fkey] FOREIGN KEY ([catalogo_id]) REFERENCES [dbo].[catalogos]([catalogo_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[documentos] ADD CONSTRAINT [documentos_tipo_documento_id_fkey] FOREIGN KEY ([tipo_documento_id]) REFERENCES [dbo].[tipos_documento]([tipo_documento_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[verification_codes] ADD CONSTRAINT [verification_codes_usuario_id_fkey] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
