import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import * as bcrypt from 'bcrypt';

// Parse SQL Server connection string format: sqlserver://server:port;database=db;user=user;password=pass;encrypt=false
const parseSqlServerUrl = (urlString: string) => {
  // Remove protocol
  const withoutProtocol = urlString.replace(/^sqlserver:\/\//, '');
  
  // Split by semicolon to get parts
  const parts = withoutProtocol.split(';');
  
  // First part contains server:port
  const serverPart = parts[0];
  const [server, portStr] = serverPart.includes(':') 
    ? serverPart.split(':') 
    : [serverPart, '1433'];
  
  // Parse parameters from remaining parts
  const params: Record<string, string> = {};
  for (let i = 1; i < parts.length; i++) {
    const [key, value] = parts[i].split('=');
    if (key && value) {
      params[key.toLowerCase()] = value;
    }
  }
  
  return {
    server,
    port: parseInt(portStr, 10) || 1433,
    database: params.database || '',
    user: params.user || undefined,
    password: params.password || undefined,
    encrypt: params.encrypt !== 'false',
    trustServerCertificate: params.trustservercertificate === 'true',
  };
};

const databaseUrl = process.env.DATABASE_URL!;
const config = parseSqlServerUrl(databaseUrl);

const adapter = new PrismaMssql({
  server: config.server,
  port: config.port,
  database: config.database,
  user: config.user,
  password: config.password,
  options: {
    encrypt: config.encrypt,
    trustServerCertificate: config.trustServerCertificate,
  },
});

const prisma = new PrismaClient({
  adapter,
});

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Función para crear catálogos del sistema

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. Crear permisos del sistema
  console.log('📋 Creando permisos del sistema...');
  
  const permisos = [
    { codigo: 'USUARIO_REGISTRAR', descripcion: 'Crear nuevos usuarios en el sistema' },
    { codigo: 'USUARIO_CAMBIAR_PASSWORD', descripcion: 'Resetear contraseñas de otros usuarios' },
    { codigo: 'USUARIO_DESACTIVAR', descripcion: 'Suspender o desactivar cuentas de usuario' },
    { codigo: 'DOCUMENTO_CARGAR', descripcion: 'Subir nuevos documentos al sistema' },
    { codigo: 'DOCUMENTO_EDITAR', descripcion: 'Modificar documentos ya cargados' },
    { codigo: 'DOCUMENTO_ELIMINAR', descripcion: 'Borrar documentos del sistema' },
    { codigo: 'REPORTE_VER', descripcion: 'Acceder a reportes y estadísticas' },
    { codigo: 'ROL_GESTIONAR', descripcion: 'Asignar y modificar roles de usuarios' },
  ];

  for (const permisoData of permisos) {
    await prisma.permiso.upsert({
      where: { codigo: permisoData.codigo },
      update: permisoData,
      create: permisoData,
    });
  }

  console.log('✅ Permisos creados');

  // 2. Crear roles del sistema
  console.log('👥 Creando roles del sistema...');

  // Rol ADMIN - Todos los permisos
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'ADMIN' },
    update: { descripcion: 'Administrador del sistema - Control total' },
    create: {
      nombre: 'ADMIN',
      descripcion: 'Administrador del sistema - Control total',
    },
  });

  // Asignar todos los permisos al rol ADMIN
  for (const permiso of permisos) {
    const permisoRecord = await prisma.permiso.findUnique({ where: { codigo: permiso.codigo } });
    if (permisoRecord) {
      // Verificar si ya existe la relación
      const existeRelacion = await prisma.rolPermiso.findFirst({
        where: {
          rol_id: rolAdmin.id,
          permiso_id: permisoRecord.id,
        },
      });
      
      if (!existeRelacion) {
        await prisma.rolPermiso.create({
          data: {
            rol_id: rolAdmin.id,
            permiso_id: permisoRecord.id,
          },
        });
      }
    }
  }

  // Rol CARGA - Solo DOCUMENTO_CARGAR y REPORTE_VER
  const rolCarga = await prisma.rol.upsert({
    where: { nombre: 'CARGA' },
    update: { descripcion: 'Usuario de carga - Solo puede cargar documentos' },
    create: {
      nombre: 'CARGA',
      descripcion: 'Usuario de carga - Solo puede cargar documentos',
    },
  });

  const permisosCarga = ['DOCUMENTO_CARGAR', 'REPORTE_VER'];
  for (const codigoPermiso of permisosCarga) {
    const permisoRecord = await prisma.permiso.findUnique({ where: { codigo: codigoPermiso } });
    if (permisoRecord) {
      // Verificar si ya existe la relación
      const existeRelacion = await prisma.rolPermiso.findFirst({
        where: {
          rol_id: rolCarga.id,
          permiso_id: permisoRecord.id,
        },
      });
      
      if (!existeRelacion) {
        await prisma.rolPermiso.create({
          data: {
            rol_id: rolCarga.id,
            permiso_id: permisoRecord.id,
          },
        });
      }
    }
  }

  // Rol EDICION - DOCUMENTO_CARGAR, DOCUMENTO_EDITAR, REPORTE_VER
  const rolEdicion = await prisma.rol.upsert({
    where: { nombre: 'EDICION' },
    update: { descripcion: 'Usuario de edición - Puede cargar y editar documentos' },
    create: {
      nombre: 'EDICION',
      descripcion: 'Usuario de edición - Puede cargar y editar documentos',
    },
  });

  const permisosEdicion = ['DOCUMENTO_CARGAR', 'DOCUMENTO_EDITAR', 'REPORTE_VER'];
  for (const codigoPermiso of permisosEdicion) {
    const permisoRecord = await prisma.permiso.findUnique({ where: { codigo: codigoPermiso } });
    if (permisoRecord) {
      // Verificar si ya existe la relación
      const existeRelacion = await prisma.rolPermiso.findFirst({
        where: {
          rol_id: rolEdicion.id,
          permiso_id: permisoRecord.id,
        },
      });
      
      if (!existeRelacion) {
        await prisma.rolPermiso.create({
          data: {
            rol_id: rolEdicion.id,
            permiso_id: permisoRecord.id,
          },
        });
      }
    }
  }

  console.log('✅ Roles creados');

  // 3. Crear usuario administrador por defecto
  console.log('👤 Creando usuario administrador...');

  const adminPassword = await hashPassword('Admin123');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@morelos.gob.mx' },
    update: {
      name: 'Administrador del Sistema',
      password: adminPassword,
      activo: true,
    },
    create: {
      email: 'admin@morelos.gob.mx',
      name: 'Administrador del Sistema',
      password: adminPassword,
      activo: true,
      //usuario_creacion_id: 'system',
    },
  });

  // Asignar rol ADMIN al usuario administrador
  // Verificar si ya existe la relación
  const existeUsuarioRol = await prisma.usuarioRol.findFirst({
    where: {
      usuario_id: adminUser.id,
      rol_id: rolAdmin.id,
    },
  });
  
  if (!existeUsuarioRol) {
    await prisma.usuarioRol.create({
      data: {
        usuario_id: adminUser.id,
        rol_id: rolAdmin.id,
      },
    });
  }

  console.log('✅ Usuario administrador creado');
  console.log('📧 Email: admin@morelos.gob.mx');
  console.log('🔑 Contraseña: Admin123');
  console.log('👥 Rol: ADMIN');

  // 4. Crear tipos de documento
  console.log('📄 Creando tipos de documento...');

  const tiposDocumento = [
    {
      nombre: 'CSV',
      descripcion: 'Archivo de valores separados por comas',
      extensiones: 'csv',
    },
    {
      nombre: 'JSON',
      descripcion: 'Archivo de notación de objetos JavaScript',
      extensiones: 'json',
    },
    {
      nombre: 'XML',
      descripcion: 'Archivo de lenguaje de marcado extensible',
      extensiones: 'xml',
    },
    {
      nombre: 'Excel',
      descripcion: 'Archivo de hoja de cálculo Excel',
      extensiones: 'xlsx,xls',
    },
  ];

  for (const tipoData of tiposDocumento) {
    await prisma.tipoDocumento.upsert({
      where: { nombre: tipoData.nombre },
      update: tipoData,
      create: {
        ...tipoData,
        usuario_creacion_id: adminUser.id,
      },
    });
  }

  console.log('✅ Tipos de documento creados');

  // 5. Crear catálogos del sistema
 // await createCatalogos(adminUser.id);

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
