import { DataTypes, Model, Optional, Sequelize } from "sequelize";

// Define the attributes interface
interface UtilisateursAttributes {
  id: string;
  nom: string;
  prenom?: string;
  login: string;
  pass?: string;
  role?: string;
  refreshToken?: string;
}

// Define creation attributes (fields that are optional during creation)
interface UtilisateursCreationAttributes
  extends Optional<
    UtilisateursAttributes,
    "id" | "prenom" | "pass" | "role" | "refreshToken"
  > {}

// Define the model class
class Utilisateurs
  extends Model<UtilisateursAttributes, UtilisateursCreationAttributes>
  implements UtilisateursAttributes
{
  declare id: string;
  declare nom: string;
  declare prenom?: string;
  declare login: string;
  declare pass?: string;
  declare role?: string;
  declare refreshToken?: string;
}

export const utilisateursModelFactory = (sequelize: Sequelize) => {
  Utilisateurs.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      prenom: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      login: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pass: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "user",
      },
      refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "utilisateurs",
      tableName: "utilisateurs",
    },
  );

  return Utilisateurs;
};

export { Utilisateurs };
export type { UtilisateursAttributes, UtilisateursCreationAttributes };

