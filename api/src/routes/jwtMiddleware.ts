import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

declare global {
  namespace Express {
    interface Request {
      token?: jwt.JwtPayload;
      user?: {
        id: string;
        login: string;
        role?: string;
      };
    }
  }
}

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  if (!config.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not set");
  }

  try {
    // Extract token from "Bearer <token>"
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res
        .status(401)
        .json({ message: "Invalid token format. Expected 'Bearer <token>'" });
    }

    const token = parts[1];

    // Verify token
    const jwtPayload = jwt.verify(token, config.ACCESS_TOKEN_SECRET, {
      complete: true,
      algorithms: ["HS256"],
      clockTolerance: 0,
      ignoreExpiration: false,
      ignoreNotBefore: false,
    });

    req.token = jwtPayload;

    // Extract user info from payload
    if (typeof jwtPayload.payload === "object" && jwtPayload.payload !== null) {
      req.user = {
        id: jwtPayload.payload.id,
        login: jwtPayload.payload.login,
        role: jwtPayload.payload.role,
      };
    }

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(401).json({ message: "Authentication failed" });
  }
}

// Middleware for role-based authorization
export function authorizeRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = req.user.role || "user";

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }

    next();
  };
}

// Legacy export for backward compatibility
export const checkJwt = authenticateJWT;
