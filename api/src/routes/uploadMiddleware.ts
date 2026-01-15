import { Request } from "express";
import multer from "multer";

// Configuration de multer pour stocker les fichiers en mémoire
const storage = multer.memoryStorage();

// Filtre pour accepter uniquement les images
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Types MIME acceptés
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Format de fichier non supporté. Formats acceptés : JPEG, PNG, GIF, WEBP, BMP",
      ),
    );
  }
};

// Configuration multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite à 5MB
  },
});

// Fonction utilitaire pour convertir le buffer en base64
export function convertImageToBase64(file: Express.Multer.File): string {
  if (!file || !file.buffer) {
    throw new Error("Aucun fichier fourni");
  }

  // Convertir le buffer en base64
  const base64Image = file.buffer.toString("base64");

  // Retourner avec le préfixe data:image
  return `data:${file.mimetype};base64,${base64Image}`;
}

// Middleware pour traiter l'upload et convertir en base64
export function processImageUpload(
  req: Request & { file?: Express.Multer.File },
) {
  if (req.file) {
    try {
      // Convertir l'image en base64
      const base64Image = convertImageToBase64(req.file);

      // Ajouter au body pour que le contrôleur puisse l'utiliser
      req.body.photo_url = base64Image;

      // Ajouter des métadonnées
      req.body.photo_size = req.file.size;
      req.body.photo_mimetype = req.file.mimetype;
    } catch (error) {
      console.error("Erreur lors de la conversion de l'image:", error);
      throw error;
    }
  }
}
