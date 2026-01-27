# backend/Dockerfile
# ==================
# ETAPA 1: Dependencies

FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ETAPA 2: Builder
FROM node:20-alpine AS builder

# Labels gobierno
LABEL org.government.app="backend-transparencia-fiscal" \
      org.government.department="DGSAC" \
      org.government.data-classification="sensible" 

# Crear usuario y directorio para documentos
RUN addgroup -g 1002 -S appgroup && \
    adduser -u 1002 -S appuser -G appgroup && \
    mkdir -p /app/uploads && \
    chown -R appuser:appgroup /app

WORKDIR /app

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de build
ENV NODE_ENV=production

# Generar cliente de Prisma
RUN npx prisma generate

# Build de Nest.js
RUN npm run build

# Cambiar permisos para el usuario no-root
RUN chown -R appuser:appgroup /app
USER appuser

# ETAPA 3: Runner
FROM node:20-alpine

# Argumentos de build para trazabilidad
ARG BUILD_DATE
ARG GIT_COMMIT
ARG VERSION="1.0.0"

# Health check con credenciales de base de datos
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', {timeout: 5000}, (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Instalar solo lo necesario para runtime
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/America/Mexico_City /etc/localtime && \
    echo "America/Mexico_City" > /etc/timezone && \
    apk del tzdata

# Crear usuario no-root (mismo UID que builder)
RUN addgroup -g 1002 -S appgroup && \
    adduser -u 1002 -S appuser -G appgroup && \
    mkdir -p /app/uploads && \
    chown -R appuser:appgroup /app

WORKDIR /app

# Copiar desde builder
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma

# Variables de entorno seguras (defaults)
ENV NODE_ENV=production \
    PORT=3001 \
    HOST=0.0.0.0 \
    LOG_LEVEL=info \
    UPLOAD_DIR=/app/uploads \
    # Variables de base de datos por defecto (para desarrollo local)
    DB_HOST=localhost \
    DB_PORT=1433 \
    DB_NAME=DB_Transparencia_Fiscal \
    DB_USER=sa \
    DB_ENCRYPT=false \
    DB_TRUST_SERVER_CERTIFICATE=true

# Puerto de la aplicación
EXPOSE 3001

# Volumen para documentos (DECLARATIVO - no crea)
VOLUME ["/app/uploads"]

# Usuario no-root
USER appuser

# Entrypoint para inicializaciones
#ENTRYPOINT ["./docker-entrypoint.sh"]

# Comando principal con migraciones de Prisma
#CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
CMD ["node", "dist/src/main"]

