// npm install zod
const { z } = require("zod");

const userSchema = z.object({
  username: z
    .string({
      required_error: "Le nom d'utilisateur est obligatoire",
      invalid_type_error:
        "Le nom d'utilisateur doit être une chaîne de caractères",
    })
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(100, "Le mot de passe est trop long"),
  // Optionnel : ajouter une regex pour la complexité (Majuscule, chiffre, etc.)
  // .regex(/[A-Z]/, "Il faut au moins une majuscule")
});

module.exports = { userSchema };
