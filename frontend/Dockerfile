# Estágio de Build
FROM node:20-alpine AS build

# Aceita o argumento do Docker Compose
ARG VITE_API_URL
# Define como variável de ambiente para o Vite
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio de Produção
FROM nginx:stable-alpine
# Copia o build do Vite para o diretório do Nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]