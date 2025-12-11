import { Express, Router } from "express";
import {
  getCurrentUser,
  login,
  logout,
  refresh,
  register,
} from "../controllers/auth.controllers";
import { authenticateJWT } from "./jwtMiddleware";

export function authRoutes(app: Express) {
  const router = Router();

  // Public routes
  router.post("/register", register);
  router.post("/login", login);
  router.post("/refresh", refresh);
  router.post("/logout", logout);

  // Protected routes
  router.get("/me", authenticateJWT, getCurrentUser);

  app.use("/api/auth", router);
}
