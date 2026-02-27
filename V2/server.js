// installons ensuite exprees pour faciliter la création de notre serveur web. 
// Nous pouvons le faire en utilisant la commande "npm install express".
// Rdv dans le fichier app.js pour la partie Express.

const http = require('http');
const app = require('./app');

const server = http.createServer(app);

// Prevoyons une fonction pour normaliser le port en vue du deploiement.

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT ||'3000');

// Prevoyons une fonction pour gérer les erreurs de serveur.

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});


app.set('port', port);
server.listen(port);