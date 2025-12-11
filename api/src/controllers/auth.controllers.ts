import config from "@/config";
import { type UtilisateursAttributes } from "@/models/utilisateurs.model";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v7 } from "uuid";
import db from "../models";

const Utilisateurs = db.utilisateurs;

function generateAccessToken(user: Partial<UtilisateursAttributes>) {
  if (!config.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not set");
  }

  return jwt.sign(
    {
      id: user.id,
      login: user.login,
      role: user.role,
    },
    config.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }, // 15 minutes
  );
}

function generateRefreshToken(user: Partial<UtilisateursAttributes>) {
  if (!config.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not set");
  }

  return jwt.sign(
    {
      id: user.id,
      login: user.login,
    },
    config.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }, // 7 days
  );
}

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { login, password, nom, prenom, role } = req.body;

    // Validation
    if (!login || !password || !nom || !prenom) {
      return res.status(400).json({
        message: "Missing required fields: login, password, nom, prenom",
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

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to database
    await user.update({ refreshToken });

    // Return user without password
    const userResponse = {
      id: user.id,
      login: user.login,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
    };

    res.status(201).json({
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Error during registration",
    });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;

    // Validation
    if (!login || !password) {
      return res.status(400).json({
        message: "Login and password are required",
      });
    }

    // Find user
    const user = await Utilisateurs.findOne({ where: { login } });

    if (!user || !user.pass) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.pass);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to database
    await user.update({ refreshToken });

    // Return user without password
    const userResponse = {
      id: user.id,
      login: user.login,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
    };

    res.json({
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Error during login",
    });
  }
};

// Refresh token
export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token is required",
      });
    }

    if (!config.REFRESH_TOKEN_SECRET) {
      throw new Error("REFRESH_TOKEN_SECRET is not set");
    }

    // Verify refresh token
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);
    } catch (_error) {
      return res.status(403).json({
        message: "Invalid or expired refresh token",
      });
    }

    // Find user and verify refresh token matches
    const user = await Utilisateurs.findOne({
      where: {
        id: decoded.id,
        refreshToken: refreshToken,
      },
    });

    if (!user) {
      return res.status(403).json({
        message: "Invalid refresh token",
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token in database
    await user.update({ refreshToken: newRefreshToken });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      message: "Error refreshing token",
    });
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required",
      });
    }

    // Find user and clear refresh token
    const user = await Utilisateurs.findOne({
      where: { refreshToken },
    });

    if (user) {
      await user.update({ refreshToken: undefined });
    }

    res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      message: "Error during logout",
    });
  }
};

// Get current user (requires authentication)
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.token?.payload?.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await Utilisateurs.findByPk(req.token.payload.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Return user without password and refresh token
    const userResponse = {
      id: user.id,
      login: user.login,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
    };

    res.json(userResponse);
  } catch (_error) {
    console.error("Get current user error:", _error);
    res.status(500).json({
      message: "Error fetching user",
    });
  }
};
