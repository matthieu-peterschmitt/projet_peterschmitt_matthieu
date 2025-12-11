import { Express, Router } from "express";
import { createUser, getUsers } from "../controllers/utilisateur.controllers";
import { authenticateJWT, authorizeRoles } from "./jwtMiddleware";

export function utilisateurs(app: Express) {
  const router = Router();

  // Protected routes - require authentication
  router.get("/", authenticateJWT, getUsers);

  // Admin only - create user
  router.post("/", authenticateJWT, authorizeRoles("admin"), createUser);

  app.use("/api/users", router);
}
