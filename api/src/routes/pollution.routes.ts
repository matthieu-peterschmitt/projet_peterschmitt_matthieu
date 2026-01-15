import { Express, NextFunction, Request, Response, Router } from "express";
import {
    create,
    deleteOne,
    getAll,
    getOne,
    update,
} from "../controllers/pollution.controllers";
import {
    validateCreate,
    validateDelete,
    validateGetById,
    validateSearch,
    validateUpdate,
} from "../validators/pollution.validators";
import { authenticateJWT } from "./jwtMiddleware";
import { processImageUpload, upload } from "./uploadMiddleware";

export function pollutions(app: Express) {
  const router = Router();

  // Public routes - anyone can view
  router.get("/", validateSearch, getAll);
  router.get("/:id", validateGetById, getOne);

  // Protected routes - require authentication
  router.post(
    "/",
    authenticateJWT,
    upload.single("photo"),
    (req: Request, res: Response, next: NextFunction) => {
      processImageUpload(req);
      next();
    },
    validateCreate,
    create,
  );
  router.put(
    "/:id",
    authenticateJWT,
    upload.single("photo"),
    (req: Request, res: Response, next: NextFunction) => {
      processImageUpload(req);
      next();
    },
    validateUpdate,
    update,
  );
  router.delete("/:id", authenticateJWT, validateDelete, deleteOne);

  app.use("/api/pollutions", router);
}
