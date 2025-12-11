export interface PollutionDeclaration {
  id?: number;
  titre: string;
  type_pollution: PollutionType;
  description: string;
  date_observation: Date;
  lieu: string;
  latitude: number;
  longitude: number;
  photo_url?: string;
}

export enum PollutionType {
  PLASTIQUE = 'Plastique',
  CHIMIQUE = 'Chimique',
  DEPOT_SAUVAGE = 'Dépôt sauvage',
  EAU = 'Eau',
  AIR = 'Air',
  AUTRE = 'Autre',
}
