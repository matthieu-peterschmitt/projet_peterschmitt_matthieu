import { Sequelize } from "sequelize";
import { config } from "../config.js";
import { pollutionModelFactory } from "./pollution.model";
import { Utilisateurs, utilisateursModelFactory } from "./utilisateurs.model";

const { BDD } = config;
const sequelize = new Sequelize(
  `postgres://${BDD.user}:${BDD.password}@${BDD.host}:${BDD.port}/${BDD.bdname}`,
  {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      native: true,
    },
    define: {
      timestamps: false,
    },
  },
);

sequelize
  .sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

const UtilisateursModel = utilisateursModelFactory(sequelize);

const db = {
  sequelize: sequelize,
  utilisateurs: UtilisateursModel,
  pollutions: pollutionModelFactory(sequelize),
};

export default db;
export type { Utilisateurs };
