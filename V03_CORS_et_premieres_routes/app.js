const express = require('express');
const app = express();

// Definissons un middleware pour gérer les CORS (Cross-Origin Resource Sharing) afin de permettre à notre API d'être accessible depuis n'importe quelle origine.
// Nous utilisons ici app.use() pour définir un middleware qui sera exécuté pour toutes les requêtes commençant par "/recettes".

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Ci-dessous, nous utilisons express.json() et express.text() pour permettre à notre application de traiter les données JSON et les données textuelles envoyées dans le corps des requêtes HTTP. 
// Cela est particulièrement utile pour les requêtes POST, PUT ou PATCH où les clients envoient des données au serveur.

app.use(express.json());
app.use(express.text());

// Nous allons ensuite définir une route GET pour la racine de notre API qui renverra un message de bienvenue.
// Le console.log(req.query.recette) nous permettra de voir dans la console les paramètres de requête envoyés à cette route, ce qui peut être utile pour le développement et le débogage.

app.get('/', (req, res, next) => {
  console.log(req.query.recette? `Recette demandée : ${req.query.recette}` : 'Aucune recette demandée');
  res.status(200).end('<html><body><h1>Hello World</h1></body></html>');
});

// Nous allons ensuite définir une route GET pour "/recettes" qui renverra une liste de recettes au format JSON.

app.get('/recettes', (req, res, next) => {
  const recettes = [
    {
      _id: 'oeihfzeoi',
      title: 'Tarte au café',
      description: 'une délicieuse tarte au café pour les amateurs de caféine',
      imageUrl: 'https://turbigo-gourmandises.fr/wp-content/uploads/2015/12/tarte-cafe-eric-kayser.jpg',
      etapes: [
        'Préparer la pâte sablée en mélangeant la farine, le sucre glace, le beurre et l\'oeuf. Laisser reposer au frais pendant 30 minutes.',
        'Étaler la pâte dans un moule à tarte et la faire cuire à blanc pendant 15 minutes à 180°C.',],
      userId: 'qsomihvqios',
    },
    {
      _id: 'tralala02',
      title: 'Tartine au kiwi',
      description: 'une délicieuse tartine au kiwi pour les amateurs de fruits',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbQ3T6WVIVCqAAX0854m9774PmJ2OCwzG7pA&s',
      etapes: [
        'Prendre une tranche de pain complet et la faire griller légèrement.',
        'Étaler du fromage frais sur la tranche de pain grillé.',
        'Couper un kiwi en fines tranches et les disposer sur le fromage frais.',
        'Ajouter un filet de miel pour une touche sucrée, puis déguster !',],
      userId: 'qsomihvqios',
    },
  ];
  res.status(200).json(recettes);
});

// Enfin, nous allons définir une route POST pour "/recettes" qui permettra d'ajouter une nouvelle recette à notre liste de recettes.
// Nous utiliserons req.body pour accéder aux données envoyées dans le corps de la requête, ce qui est utile pour les requêtes POST.

app.post('/recettes', (req, res, next) => {
  console.log(req.body);
  res.status(201).json({ message: 'Recette ajoutée avec succès !' });
});

module.exports = app;
