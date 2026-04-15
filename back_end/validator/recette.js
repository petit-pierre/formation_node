const { z } = require("zod");

const recetteSchema = z.object({
  title: z
    .string({
      required_error: "Le titre est obligatoire",
      invalid_type_error: "Le titre doit être une chaîne de caractères",
    })
    .max(100, "Le titre est trop long")
    .trim()
    .toLowerCase(),
  description: z
    .string({
      required_error: "La description est obligatoire",
      invalid_type_error: "La description doit être une chaîne de caractères",
    })
    .trim()
    .toLowerCase()
    .min(20, "La description doit contenir au moins 20 caractères")
    .max(500, "La description est trop longue"),
  etapes: z
    .array(
      z
        .string({
          required_error: "Chaque étape doit être une chaîne de caractères",
          invalid_type_error: "Chaque étape doit être une chaîne de caractères",
        })
        .min(10, "Chaque étape doit contenir au moins 10 caractères")
        .trim(),
    )
    .min(1, "Il doit y avoir au moins une étape"),
  imageName: z
    .string({
      invalid_type_error:
        "Le nom de l'image doit être une chaîne de caractères",
    })
    .optional(),
  youtube: z
    .string({
      invalid_type_error: "L'ID YouTube doit être une chaîne de caractères",
    })
    .optional(),
});

module.exports = { recetteSchema };
