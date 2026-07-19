# Dockerfile para Produção
# Baseado em Node.js LTS Slim para máxima eficiência de tamanho e performance

FROM node:20-slim AS builder

WORKDIR /app

# Instala dependências principais
COPY package*.json ./
RUN npm install --production

# Copia código fonte
COPY . .

# Compila o Frontend (Vite) e Backend (esbuild) em dist/
RUN npm run build

# --- Estágio Final Runner ---
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm install --production

# Copia arquivos compilados do builder
COPY --from=builder /app/dist ./dist

# Expõe a porta 3000 exigida pela infraestrutura de contêineres
EXPOSE 8080

# Comando de inicialização nativo da esteira
CMD ["node", "dist/server.cjs"]
