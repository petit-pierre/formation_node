// apres avoire instellé node.js, on peut créer un serveur web simple en utilisant le module http intégré de Node.js.
// initialisons un projet Node.js en utilisant "npm init", puis créons un fichier server.js.

const http = require('http');

const server = http.createServer((req, res) => {
    res.end('<html><body><h1>Hello World</h1></body></html>');
});

server.listen(process.env.PORT || 3000);

