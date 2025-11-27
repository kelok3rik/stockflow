FROM node:20

# Crear carpeta de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias de producción y dev
RUN npm install

# Instalar nodemon globalmente
RUN npm install -g nodemon

# Copiar el resto de la app
COPY . .

# Comando por defecto
CMD ["npm", "run", "dev"]
