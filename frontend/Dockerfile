FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# Comando para dev
CMD ["npm", "run", "dev"]
