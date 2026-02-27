const express = require('express');
const app = express();

// creons un premier middleware pour afficher un message en console à chaque fois qu'une requete est reçue par notre serveur.

app.use((req, res, next) => {
  console.log('Requête reçue !');
  next();
});

// ce second middleware va nous permettre de renseigner le status code de notre reponse.

app.use((req, res, next) => {
  res.status(200);
  next();
});

// ci-dessous, nous allons envoyer une reponse au format JSON.

app.use( (req, res, next) => {
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
  res.json(recettes);
  next();
});

// finalement nous  afficherons dans la console un message pour indiquer que la reponse a été envoyée avec succès.

app.use((req, res, next) => {
  console.log('Réponse envoyée avec succès !');
});

module.exports = app;
