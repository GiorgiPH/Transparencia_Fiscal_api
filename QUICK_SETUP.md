# Configuración Rápida - Transparencia Fiscal API

Esta guía te ayudará a configurar rápidamente el proyecto para desarrollo.

## 🚀 Configuración en 5 Minutos

### 1. Prerrequisitos
- Node.js 18+ y npm
- SQL Server 2019+ (local o Docker)
- Git

### 2. Clonar y Configurar

```bash
# Navegar al directorio del proyecto
cd transparencia-fiscal-api

# Instalar dependencias
npm install

# Configurar variables de entorno (Windows)
.\setup-db.ps1

# Configurar variables de entorno (Linux/Mac)
chmod +x setup-db.sh
./setup-db.sh
```

### 3. Configuración Manual (Alternativa)

#### 3.1. Crear archivo .env
```bash
cp .env.example .env
# Editar .env con tus credenciales de SQL Server
```

#### 3.2. Configurar SQL Server
```sql
-- Conéctate a SQL Server con SSMS o sqlcmd
CREATE DATABASE transparencia_fiscal_dev;
GO
```

#### 3.3. Ejecutar migraciones
```bash
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

### 4. Iniciar la API

```bash
# Modo desarrollo (con hot reload)
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

### 5. Verificar instalación

1. **API**: http://localhost:3001
2. **Documentación Swagger**: http://localhost:3001/api
3. **Prisma Studio**: http://localhost:5555
4. **Health Check**: http://localhost:3001/health

## 📁 Estructura del Proyecto

```
transparencia-fiscal-api/
├── prisma/           # Esquema de base de datos
├── src/              # Código fuente
├── .env              # Variables de entorno (crear)
├── .env.example      # Ejemplo de variables
├── setup-db.ps1      # Script Windows
├── setup-db.sh       # Script Linux/Mac
├── SETUP_DATABASE.md # Guía completa
└── QUICK_SETUP.md    # Esta guía
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno Mínimas
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="sqlserver://localhost:1433;database=transparencia_fiscal_dev;user=sa;password=tu_contraseña;trustServerCertificate=true"
JWT_SECRET=tu_secreto_jwt
CORS_ORIGIN=http://localhost:3000
```

### Comandos Útiles

```bash
# Desarrollo
npm run start:dev      # Inicia con hot reload
npm run test           # Ejecuta pruebas
npm run test:watch     # Pruebas con watch mode
npm run test:e2e       # Pruebas end-to-end

# Base de datos
npx prisma studio      # Interfaz web para BD
npx prisma db pull     # Sincroniza esquema
npx prisma migrate dev # Crea migración

# Build
npm run build          # Compila TypeScript
npm run start:prod     # Inicia producción
npm run lint           # Verifica código
```

## 🐳 Docker (Alternativa)

Si no tienes SQL Server instalado:

```bash
# Ejecutar SQL Server en Docker
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=TuPassword123!" \
  -p 1433:1433 --name sqlserver-transparencia \
  -d mcr.microsoft.com/mssql/server:2022-latest

# Configurar .env con:
# DATABASE_URL="sqlserver://localhost:1433;database=transparencia_fiscal_dev;user=sa;password=TuPassword123!;trustServerCertificate=true"
```

## 🔍 Solución de Problemas Comunes

### "Cannot connect to SQL Server"
1. Verifica que SQL Server esté corriendo
2. Comprueba el puerto 1433: `telnet localhost 1433`
3. Verifica credenciales en `.env`

### "Login failed for user"
1. Habilita autenticación de SQL Server
2. Verifica usuario/contraseña
3. Asegúrate que el usuario tenga acceso a la BD

### Error de migración Prisma
```bash
# Resetear migraciones
npx prisma migrate reset

# Forzar regeneración
npx prisma generate --force
```

## 📞 Soporte

### Documentación
- [Prisma con SQL Server](https://www.prisma.io/docs/orm/overview/databases/sql-server)
- [NestJS Documentation](https://docs.nestjs.com/)
- [SQL Server Docs](https://docs.microsoft.com/en-us/sql/sql-server/)

### Estructura de Base de Datos
La base de datos incluye:
- **Usuarios y roles** (sistema de autenticación)
- **Catálogos jerárquicos** (MTTF - Modelo Temático)
- **Documentos** (gestión documental)
- **Participación ciudadana** (mensajes del portal)
- **Noticias y redes sociales** (comunicación)

## 🚀 Próximos Pasos

1. **Configurar frontend**: `transparencia-fiscal-publico`
2. **Probar endpoints**: Usa Swagger en `http://localhost:3001/api`
3. **Crear usuarios**: Usa el seed o registra manualmente
4. **Cargar datos**: Usa los módulos de catálogos y documentos

## 📊 Credenciales de Prueba

Después de ejecutar `prisma/seed.ts`:

- **Admin**: `admin@morelos.gob.mx` / `Admin123!`
- **Usuario Carga**: `carga@morelos.gob.mx` / `Carga123!`
- **Usuario Edición**: `edicion@morelos.gob.mx` / `Edicion123!`

## ⚠️ Seguridad en Producción

**NUNCA uses estas configuraciones en producción:**
- Cambia todas las contraseñas
- Usa JWT_SECRET diferente
- Limita acceso por IP
- Habilita HTTPS
- Usa variables de entorno del sistema, no archivos .env

---

**¡Listo!** Tu API de Transparencia Fiscal está configurada. 🎉

Para más detalles, consulta `SETUP_DATABASE.md` o la documentación completa del proyecto.
