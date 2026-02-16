FROM node:20

# pasta dentro do container
WORKDIR /app

# copiar package.json primeiro (melhor cache)
COPY package*.json ./

RUN npm install

# copiar o resto do código
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
