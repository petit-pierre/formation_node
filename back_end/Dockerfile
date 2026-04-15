FROM node:20-alpine 

WORKDIR /usr/src/app

# cette ligne est inutile en production
RUN npm install -g nodemon ts-node

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "nodemon", "server.js" ]
# en production, tu pourrais remplacer cette ligne par la commande directe pour exécuter le serveur sans nodemon, par exemple :
# CMD [ "node", "server.js" ]