FROM node:18-alpine 

WORKDIR /usr/src/app

# Installation de nodemon globalement pour le hot-reload
RUN npm install -g nodemon ts-node

COPY package*.json ./

RUN npm install

COPY . .

# On expose le port 3000 (standard pour Node)
EXPOSE 3000

# En développement, on utilise nodemon pour le hot-reload
CMD [ "nodemon", "server.js" ]