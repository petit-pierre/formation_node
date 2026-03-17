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
});

module.exports = { userSchema };
