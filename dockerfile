# backend/Dockerfile
# ==================
# ETAPA 1: Dependencies

FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ETAPA 2: Builder
FROM node:18-alpine AS builder

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
COPY --chown=appuser:appgroup . .

# Variables de build
ENV NODE_ENV=production
USER appuser

# Build de Nest.js
RUN npm run build

# ETAPA 3: Runner
FROM node:18-alpine

# Argumentos de build para trazabilidad
ARG BUILD_DATE
ARG GIT_COMMIT
ARG VERSION="1.0.0"

# Health check con credenciales de base de datos
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', {timeout: 5000}, (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Instalar solo lo necesario para runtime
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/America/Santiago /etc/localtime && \
    echo "America/Santiago" > /etc/timezone && \
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

# Copiar script de entrypoint
#COPY --chown=appuser:appgroup docker-entrypoint.sh ./
#RUN chmod +x docker-entrypoint.sh

# Variables de entorno seguras (defaults)
ENV NODE_ENV=production \
    PORT=4000 \
    HOST=0.0.0.0 \
    LOG_LEVEL=info \
    UPLOAD_DIR=/app/uploads

# Puerto de la aplicación
EXPOSE 4000

# Volumen para documentos (DECLARATIVO - no crea)
VOLUME ["/app/uploads"]

# Usuario no-root
USER appuser

# Entrypoint para inicializaciones
ENTRYPOINT ["./docker-entrypoint.sh"]

# Comando principal
CMD ["node", "dist/main"]