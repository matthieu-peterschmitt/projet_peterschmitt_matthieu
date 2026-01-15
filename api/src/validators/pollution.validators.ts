import { NextFunction, Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";

/**
 * Middleware pour gérer les erreurs de validation
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
      message: "Erreur de validation des données",
    });
  }
  next();
};

/**
 * Validation pour la recherche de pollutions
 */
export const validateSearch = [
  query("search")
    .optional()
    .trim()
    .isLength({ min: 0, max: 200 })
    .withMessage("Le terme de recherche ne peut pas dépasser 200 caractères")
    .matches(/^[a-zA-Z0-9\s\-àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ',.!?]*$/)
    .withMessage(
      "Le terme de recherche contient des caractères non autorisés",
    )
    .escape(), // Échappe les caractères HTML pour éviter les injections XSS
  handleValidationErrors,
];

/**
 * Validation pour récupérer une pollution par ID
 */
export const validateGetById = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("L'ID est requis")
    .isInt({ min: 1 })
    .withMessage("L'ID doit être un nombre entier positif")
    .toInt(),
  handleValidationErrors,
];

/**
 * Validation pour la création d'une pollution
 */
export const validateCreate = [
  body("titre")
    .trim()
    .notEmpty()
    .withMessage("Le titre est requis")
    .isLength({ min: 3, max: 200 })
    .withMessage("Le titre doit contenir entre 3 et 200 caractères")
    .escape(),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("La description est requise")
    .isLength({ min: 10, max: 2000 })
    .withMessage("La description doit contenir entre 10 et 2000 caractères")
    .escape(),

  body("type_pollution")
    .trim()
    .notEmpty()
    .withMessage("Le type de pollution est requis")
    .isIn([
      "Déchets",
      "Pollution de l'eau",
      "Pollution de l'air",
      "Nuisance sonore",
      "Autre",
    ])
    .withMessage("Type de pollution invalide"),

  body("lieu")
    .trim()
    .notEmpty()
    .withMessage("Le lieu est requis")
    .isLength({ min: 3, max: 300 })
    .withMessage("Le lieu doit contenir entre 3 et 300 caractères")
    .escape(),

  body("date_observation")
    .trim()
    .notEmpty()
    .withMessage("La date d'observation est requise")
    .isISO8601()
    .withMessage("Format de date invalide (utilisez ISO 8601)")
    .toDate()
    .custom((value) => {
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1); // Maximum 1 an dans le futur
      const minDate = new Date("1900-01-01");

      if (value > maxDate) {
        throw new Error(
          "La date d'observation ne peut pas être trop éloignée dans le futur",
        );
      }
      if (value < minDate) {
        throw new Error("La date d'observation est invalide");
      }
      return true;
    }),

  body("decouvreur_nom")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Le nom du découvreur ne peut pas dépasser 100 caractères")
    .matches(/^[a-zA-Z\s\-àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ']*$/)
    .withMessage("Le nom du découvreur contient des caractères non autorisés")
    .escape(),

  body("decouvreur_prenom")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Le prénom du découvreur ne peut pas dépasser 100 caractères")
    .matches(/^[a-zA-Z\s\-àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ']*$/)
    .withMessage(
      "Le prénom du découvreur contient des caractères non autorisés",
    )
    .escape(),

  // Sécurité: photo_url ne doit pas être envoyé dans le body
  // Il est géré automatiquement par le middleware d'upload
  body("photo_url")
    .not()
    .exists()
    .withMessage("Le champ photo_url ne doit pas être envoyé. Utilisez le champ 'photo' pour l'upload."),

  body("utilisateur_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("L'ID utilisateur doit être un nombre entier positif")
    .toInt(),

  handleValidationErrors,
];

/**
 * Validation pour la mise à jour d'une pollution
 */
export const validateUpdate = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("L'ID est requis")
    .isInt({ min: 1 })
    .withMessage("L'ID doit être un nombre entier positif")
    .toInt(),

  body("titre")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Le titre doit contenir entre 3 et 200 caractères")
    .escape(),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("La description doit contenir entre 10 et 2000 caractères")
    .escape(),

  body("type_pollution")
    .optional()
    .trim()
    .isIn([
      "Plastique",
      "Chimique",
      "Dépôt sauvage",
      "Eau",
      "Air",
      "Autre",
    ])
    .withMessage("Type de pollution invalide"),

  body("lieu")
    .optional()
    .trim()
    .isLength({ min: 3, max: 300 })
    .withMessage("Le lieu doit contenir entre 3 et 300 caractères")
    .escape(),

  body("date_observation")
    .optional()
    .trim()
    .isISO8601()
    .withMessage("Format de date invalide (utilisez ISO 8601)")
    .toDate()
    .custom((value) => {
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      const minDate = new Date("1900-01-01");

      if (value > maxDate) {
        throw new Error(
          "La date d'observation ne peut pas être trop éloignée dans le futur",
        );
      }
      if (value < minDate) {
        throw new Error("La date d'observation est invalide");
      }
      return true;
    }),

  body("decouvreur_nom")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Le nom du découvreur ne peut pas dépasser 100 caractères")
    .matches(/^[a-zA-Z\s\-àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ']*$/)
    .withMessage("Le nom du découvreur contient des caractères non autorisés")
    .escape(),

  body("decouvreur_prenom")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Le prénom du découvreur ne peut pas dépasser 100 caractères")
    .matches(/^[a-zA-Z\s\-àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ']*$/)
    .withMessage(
      "Le prénom du découvreur contient des caractères non autorisés",
    )
    .escape(),

  body("utilisateur_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("L'ID utilisateur doit être un nombre entier positif")
    .toInt(),

  handleValidationErrors,
];

/**
 * Validation pour la suppression d'une pollution
 */
export const validateDelete = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("L'ID est requis")
    .isInt({ min: 1 })
    .withMessage("L'ID doit être un nombre entier positif")
    .toInt(),
  handleValidationErrors,
];
