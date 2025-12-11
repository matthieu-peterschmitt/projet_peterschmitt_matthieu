import { Express, Router } from "express";
import {
  create,
  deleteOne,
  getAll,
  getOne,
  update,
} from "../controllers/pollution.controllers";
import { authenticateJWT } from "./jwtMiddleware";

export function pollutions(app: Express) {
  const router = Router();

  // Public routes - anyone can view
  router.get("/", getAll);
  router.get("/:id", getOne);

  // Protected routes - require authentication
  router.post("/", authenticateJWT, create);
  router.put("/:id", authenticateJWT, update);
  router.delete("/:id", authenticateJWT, deleteOne);

  app.use("/api/pollutions", router);
}
