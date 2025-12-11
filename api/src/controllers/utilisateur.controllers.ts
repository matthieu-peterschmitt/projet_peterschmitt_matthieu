import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { v7 } from "uuid";
import db from "../models";

const Utilisateurs = db.utilisateurs;

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await Utilisateurs.findAll({
      attributes: { exclude: ["pass", "refreshToken"] },
    });
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      message: "Error retrieving users",
    });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const { login, password, nom, prenom, role } = req.body;

    // Validation
    if (!login || !password || !nom || !prenom) {
      const missingFields = [];
      if (!login) missingFields.push("login");
      if (!password) missingFields.push("password");
      if (!nom) missingFields.push("nom");
      if (!prenom) missingFields.push("prenom");

      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check if user already exists
    const existingUser = await Utilisateurs.findOne({ where: { login } });
    if (existingUser) {
      return res.status(409).json({
        message: "User with this login already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const id = v7();
    const user = await Utilisateurs.create({
      id,
      login,
      pass: hashedPassword,
      nom,
      prenom,
      role: role || "user",
    });

    // Return user without password
    const userResponse = {
      id: user.id,
      login: user.login,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      message: "Error creating user",
    });
  }
}
