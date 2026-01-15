import db from "@/models";
import { Request, Response } from "express";
import { Op } from "sequelize";

export async function getAll(req: Request, res: Response) {
  try {
    const { search } = req.query;

    let whereClause = {};

    // Si un terme de recherche est fourni, filtrer par titre
    // La validation est déjà faite par le middleware, mais on vérifie quand même
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const sanitizedSearch = search.trim().substring(0, 200); // Limite de sécurité supplémentaire
      whereClause = {
        titre: {
          [Op.iLike]: `%${sanitizedSearch}%`
        }
      };
    }

    const data = await db.pollutions.findAll({
      where: whereClause,
      limit: 1000, // Limite de sécurité pour éviter les requêtes trop volumineuses
    });

    res.json(data);
  } catch (err) {
    console.error("Erreur lors de la récupération des pollutions:", err);
    res.status(500).json({
      message: "Erreur lors de la récupération des pollutions",
      error: process.env.NODE_ENV === "production" ? undefined : err
    });
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // La validation est déjà faite par le middleware
    const pollutionId = parseInt(id, 10);

    if (isNaN(pollutionId) || pollutionId < 1) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const data = await db.pollutions.findByPk(pollutionId);

    if (!data) {
      return res.status(404).json({ message: "Pollution non trouvée" });
    }

    res.setHeader("Content-Type", "application/json");
    res.json(data);
  } catch (err) {
    console.error("Erreur lors de la récupération de la pollution:", err);
    res.status(500).json({
      message: "Erreur lors de la récupération de la pollution",
      error: process.env.NODE_ENV === "production" ? undefined : err
    });
  }
}

export async function create(req: Request, res: Response) {
  try {
    // Récupérer l'utilisateur authentifié depuis le middleware JWT
    const userId = req.user?.id;

    // Récupérer les informations de l'utilisateur pour le découvreur
    let decouvreurNom = req.body.decouvreur_nom;
    let decouvreurPrenom = req.body.decouvreur_prenom;

    // Si l'utilisateur est authentifié et qu'il n'y a pas de découvreur spécifié
    if (userId && (!decouvreurNom || !decouvreurPrenom)) {
      const user = await db.utilisateurs.findByPk(userId);
      if (user) {
        decouvreurNom = user.nom;
        decouvreurPrenom = user.prenom;
      }
    }

    // Créer la pollution avec les informations validées
    // Ne garder que les champs autorisés pour éviter l'injection de masse
    const pollutionData = {
      titre: req.body.titre,
      description: req.body.description,
      type_pollution: req.body.type_pollution,
      lieu: req.body.lieu,
      date_observation: req.body.date_observation,
      utilisateur_id: userId || null,
      decouvreur_nom: decouvreurNom || null,
      decouvreur_prenom: decouvreurPrenom || null,
      photo_url: null,
    };

    // photo_url est seulement ajouté s'il a été traité par le middleware d'upload
    // (c'est-à-dire si un fichier a été uploadé)
    if (req.body.photo_url && req.body.photo_url.startsWith('data:image/')) {
      pollutionData.photo_url = req.body.photo_url;
    }

    const data = await db.pollutions.create(pollutionData);
    res.status(201).json(data);
  } catch (err) {
    console.error("Erreur lors de la création de la pollution:", err);
    res.status(500).json({
      message: "Erreur lors de la création de la pollution",
      error: process.env.NODE_ENV === "production" ? undefined : err
    });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const pollutionId = parseInt(id, 10);

    if (isNaN(pollutionId) || pollutionId < 1) {
      return res.status(400).json({ message: "ID invalide" });
    }

    // Vérifier que la pollution existe
    const pollution = await db.pollutions.findByPk(pollutionId);
    if (!pollution) {
      return res.status(404).json({ message: "Pollution non trouvée" });
    }

    // Vérifier que l'utilisateur est le propriétaire ou un admin
    const pollutionData = pollution.get({ plain: true }) as any;
    if (pollutionData.utilisateur_id && pollutionData.utilisateur_id !== userId) {
      const user = await db.utilisateurs.findByPk(userId);
      if (!user) {
        return res.status(403).json({
          message: "Vous n'êtes pas autorisé à modifier cette pollution"
        });
      }
      const userData = user.get({ plain: true }) as any;
      if (userData.role !== "admin") {
        return res.status(403).json({
          message: "Vous n'êtes pas autorisé à modifier cette pollution"
        });
      }
    }

    // Ne mettre à jour que les champs autorisés pour éviter l'injection de masse
    const allowedUpdates: any = {};
    const allowedFields = [
      'titre',
      'description',
      'type_pollution',
      'lieu',
      'date_observation',
      'decouvreur_nom',
      'decouvreur_prenom'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        allowedUpdates[field] = req.body[field];
      }
    }

    // photo_url est seulement ajouté s'il a été traité par le middleware d'upload
    // (c'est-à-dire si un fichier a été uploadé)
    if (req.body.photo_url && req.body.photo_url.startsWith('data:image/')) {
      allowedUpdates.photo_url = req.body.photo_url;
    }

    await db.pollutions.update(allowedUpdates, {
      where: { id: pollutionId },
    });

    res.setHeader("Content-Type", "application/json");
    res.sendStatus(200);
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la pollution:", err);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la pollution",
      error: process.env.NODE_ENV === "production" ? undefined : err
    });
  }
}

export async function deleteOne(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const pollutionId = parseInt(id, 10);

    if (isNaN(pollutionId) || pollutionId < 1) {
      return res.status(400).json({ message: "ID invalide" });
    }

    // Vérifier que la pollution existe
    const pollution = await db.pollutions.findByPk(pollutionId);
    if (!pollution) {
      return res.status(404).json({ message: "Pollution non trouvée" });
    }

    // Vérifier que l'utilisateur est le propriétaire ou un admin
    const pollutionData = pollution.get({ plain: true }) as any;
    if (pollutionData.utilisateur_id && pollutionData.utilisateur_id !== userId) {
      const user = await db.utilisateurs.findByPk(userId);
      if (!user) {
        return res.status(403).json({
          message: "Vous n'êtes pas autorisé à supprimer cette pollution"
        });
      }
      const userData = user.get({ plain: true }) as any;
      if (userData.role !== "admin") {
        return res.status(403).json({
          message: "Vous n'êtes pas autorisé à supprimer cette pollution"
        });
      }
    }

    await db.pollutions.destroy({
      where: { id: pollutionId },
    });

    res.setHeader("Content-Type", "application/json");
    res.sendStatus(200);
  } catch (err) {
    console.error("Erreur lors de la suppression de la pollution:", err);
    res.status(500).json({
      message: "Erreur lors de la suppression de la pollution",
      error: process.env.NODE_ENV === "production" ? undefined : err
    });
  }
}
