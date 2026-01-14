# Guía de Migración - Base de Datos DB_Transparencia_Fiscal

Esta guía te ayudará a configurar y migrar la base de datos para el sistema de Transparencia Fiscal.

## 📋 Estado Actual

✅ **Esquema Prisma**: Completo y listo  
✅ **Archivo .env**: Configurado con `DB_Transparencia_Fiscal`  
✅ **Script seed**: Listo con datos iniciales  
✅ **Configuración**: Archivos de configuración creados  

## 🚀 Pasos para Ejecutar las Migraciones

### Paso 1: Verificar Conexión a SQL Server

1. **Asegúrate que SQL Server esté corriendo**
   - Verifica en Services (services.msc) que "SQL Server" esté en estado "Running"
   - O ejecuta: `sqlcmd -S localhost -U sa -P RCRsql2023 -Q "SELECT @@VERSION"`

2. **Crear la base de datos (si no existe)**
   ```sql
   -- Conéctate a SQL Server Management Studio o usa sqlcmd
   CREATE DATABASE DB_Transparencia_Fiscal;
   GO
   ```

### Paso 2: Ejecutar Comandos de Migración

**Desde la terminal, en el directorio `transparencia-fiscal-api`:**

#### Opción A: Usar el script interactivo
```bash
node migrate-db.js
```

#### Opción B: Ejecutar comandos manualmente

1. **Generar cliente Prisma:**
   ```bash
   npx prisma generate
   ```

2. **Crear migración inicial:**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Ejecutar seed (datos iniciales):**
   ```bash
   npx tsx prisma/seed.ts
   ```

#### Opción C: Todo en uno
```bash
npx prisma generate && npx prisma migrate dev --name init && npx tsx prisma/seed.ts
```

### Paso 3: Verificar la Migración

1. **Ver tablas creadas:**
   ```bash
   npx prisma studio
   ```
   Abre: http://localhost:5555

2. **Verificar estructura:**
   ```bash
   npx prisma db pull
   ```

## 🔍 Solución de Problemas Comunes

### Error 1: "Cannot connect to SQL Server"
```bash
# Probar conexión manualmente
sqlcmd -S localhost -U sa -P RCRsql2023 -Q "SELECT 1"
```

**Soluciones:**
1. Verifica que SQL Server esté corriendo
2. Comprueba usuario/contraseña en `.env`
3. Asegúrate que el puerto 1433 esté abierto
4. Habilita TCP/IP en SQL Server Configuration Manager

### Error 2: "Login failed for user 'sa'"
```sql
-- En SQL Server Management Studio
ALTER LOGIN sa WITH PASSWORD = 'RCRsql2023';
ALTER LOGIN sa ENABLE;
GO
```

### Error 3: Error de migración Prisma
```bash
# Resetear migraciones
npx prisma migrate reset --force

# Luego ejecutar de nuevo
npx prisma migrate dev --name init
```

### Error 4: "bcrypt" no encontrado
```bash
# Instalar dependencias faltantes
npm install bcrypt @types/bcrypt
```

## 📊 Tablas que se Crearán

Después de la migración exitosa, tendrás estas tablas:

1. **users** - Usuarios del sistema
2. **roles** - Roles (ADMIN, CARGA, EDICION)
3. **permisos** - Permisos del sistema
4. **usuario_roles** - Relación usuarios-roles
5. **rol_permisos** - Relación roles-permisos
6. **catalogos** - Catálogos jerárquicos MTTF
7. **documentos** - Documentos de transparencia
8. **refresh_tokens** - Tokens de refresco
9. **verification_codes** - Códigos de verificación
10. **mensajes_participacion_ciudadana** - Mensajes del portal
11. **noticias** - Noticias y comunicados
12. **redes_sociales** - Redes sociales oficiales

## 👥 Credenciales de Prueba

Después del seed, tendrás estos usuarios:

| Email | Contraseña | Rol | Descripción |
|-------|------------|-----|-------------|
| `admin@morelos.gob.mx` | `Admin123` | ADMIN | Administrador del sistema |
| *Otros usuarios se pueden crear desde la interfaz* | | | |

## 🚀 Iniciar la API

Una vez completada la migración:

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

**Accesos:**
- API: http://localhost:3001
- Swagger Docs: http://localhost:3001/api
- Prisma Studio: http://localhost:5555

## 📁 Archivos de Configuración Creados

1. **`.env`** - Variables de entorno (ya configurado)
2. **`prisma.config.ts`** - Configuración de Prisma
3. **`migrate-db.js`** - Script de migración interactivo
4. **`setup-db.ps1`** - Script Windows
5. **`setup-db.sh`** - Script Linux/Mac
6. **`SETUP_DATABASE.md`** - Guía completa
7. **`QUICK_SETUP.md`** - Configuración rápida
8. **`GUIA_MIGRACION.md`** - Esta guía

## ⚠️ Notas Importantes

1. **Seguridad:** Nunca commits el archivo `.env` a Git
2. **Producción:** Cambia las contraseñas y JWT_SECRET
3. **Backup:** Realiza backup antes de migraciones en producción
4. **Pruebas:** Verifica en entorno de desarrollo primero

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs de error
2. Verifica conexión a SQL Server
3. Ejecuta `npx prisma migrate reset --force` y reintenta
4. Consulta la documentación en `SETUP_DATABASE.md`

---

**✅ ¡Listo!** Tu base de datos `DB_Transparencia_Fiscal` está configurada y lista para usar con el sistema de Transparencia Fiscal.
