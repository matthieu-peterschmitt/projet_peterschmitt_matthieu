import { Express } from "express";
import { authRoutes } from "./auth.routes";
import { catalogues } from "./catalogue.routes";
import { pollutions } from "./pollution.routes";
import { utilisateurs } from "./utilisateur.routes";

export default function routes(app: Express) {
  authRoutes(app);
  catalogues(app);
  utilisateurs(app);
  pollutions(app);
}
