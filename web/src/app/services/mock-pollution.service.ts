import { Injectable, signal } from '@angular/core';
import { delay, type Observable, of, throwError } from 'rxjs';
import {
  type PollutionDeclaration,
  PollutionType,
} from '../interfaces/pollution-declaration.interface';
import type { PollutionFilters } from './pollution.service';

@Injectable({
  providedIn: 'root',
})
export class MockPollutionService {
  private pollutions = signal<PollutionDeclaration[]>([
    {
      id: 1,
      titre: "Déversement d'huile dans la Seine",
      type_pollution: PollutionType.EAU,
      description:
        "Important déversement d'huile moteur observé près du pont Neuf. La pollution s'étend sur environ 100 mètres et affecte la faune aquatique locale.",
      date_observation: new Date('2024-01-15T14:30:00'),
      lieu: 'Seine, Pont Neuf, Paris 1er',
      latitude: 48.8566,
      longitude: 2.3422,
      photo_url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400',
    },
    {
      id: 2,
      titre: 'Dépôt sauvage de déchets industriels',
      type_pollution: PollutionType.DEPOT_SAUVAGE,
      description:
        "Découverte d'un dépôt clandestin de barils contenant des substances chimiques non identifiées dans une zone boisée.",
      date_observation: new Date('2024-01-20T09:15:00'),
      lieu: 'Forêt de Vincennes, Bois de Vincennes',
      latitude: 48.8278,
      longitude: 2.4394,
      photo_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400',
    },
    {
      id: 3,
      titre: 'Pollution plastique sur la plage',
      type_pollution: PollutionType.PLASTIQUE,
      description:
        'Accumulation massive de déchets plastiques sur le rivage après une tempête. Principalement des bouteilles, sacs et emballages alimentaires.',
      date_observation: new Date('2024-01-25T16:45:00'),
      lieu: 'Plage de Deauville, Calvados',
      latitude: 49.3598,
      longitude: 0.0748,
      photo_url: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400',
    },
    {
      id: 4,
      titre: "Fumées toxiques d'une usine",
      type_pollution: PollutionType.AIR,
      description:
        "Émissions anormales de fumées noires et odorantes provenant d'une installation industrielle, causant des irritations respiratoires aux riverains.",
      date_observation: new Date('2024-02-01T07:20:00'),
      lieu: 'Zone industrielle de Roubaix, Nord',
      latitude: 50.6942,
      longitude: 3.1746,
    },
    {
      id: 5,
      titre: 'Déversement de produits chimiques',
      type_pollution: PollutionType.CHIMIQUE,
      description:
        'Accident lors du transport de substances chimiques ayant entraîné un déversement sur la chaussée et dans les égouts.',
      date_observation: new Date('2024-02-05T11:30:00'),
      lieu: 'Autoroute A1, sortie Lille-Sud',
      latitude: 50.5736,
      longitude: 3.0635,
      photo_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    },
    {
      id: 6,
      titre: 'Pollution sonore chantier de nuit',
      type_pollution: PollutionType.AUTRE,
      description:
        'Travaux de construction effectués en violation des horaires autorisés, causant des nuisances sonores importantes pour le voisinage.',
      date_observation: new Date('2024-02-10T23:15:00'),
      lieu: 'Quartier de la Défense, Puteaux',
      latitude: 48.8918,
      longitude: 2.2364,
    },
  ]);

  private nextId = 7;

  /**
   * Simule la récupération de toutes les pollutions
   */
  getAllPollutions(): Observable<PollutionDeclaration[]> {
    return of([...this.pollutions()]).pipe(delay(500));
  }

  /**
   * Simule la récupération des pollutions avec filtres
   */
  getPollutionsWithFilters(filters: PollutionFilters): Observable<PollutionDeclaration[]> {
    const filteredPollutions = this.pollutions().filter((pollution) => {
      // Filtre par type
      if (filters.type && pollution.type_pollution !== filters.type) {
        return false;
      }

      // Filtre par lieu
      if (filters.lieu && !pollution.lieu.toLowerCase().includes(filters.lieu.toLowerCase())) {
        return false;
      }

      // Filtre par date début
      if (filters.dateFrom && new Date(pollution.date_observation) < filters.dateFrom) {
        return false;
      }

      // Filtre par date fin
      if (filters.dateTo && new Date(pollution.date_observation) > filters.dateTo) {
        return false;
      }

      return true;
    });

    return of([...filteredPollutions]).pipe(delay(300));
  }

  /**
   * Simule la récupération d'une pollution par ID
   */
  getPollutionById(id: number): Observable<PollutionDeclaration> {
    const pollution = this.pollutions().find((p) => p.id === id);

    if (pollution) {
      return of({ ...pollution }).pipe(delay(300));
    } else {
      return throwError(() => new Error(`Pollution avec l'ID ${id} introuvable`)).pipe(delay(300));
    }
  }

  /**
   * Simule la création d'une nouvelle pollution
   */
  createPollution(pollution: Omit<PollutionDeclaration, 'id'>): Observable<PollutionDeclaration> {
    const newPollution: PollutionDeclaration = {
      ...pollution,
      id: this.nextId++,
    };

    this.pollutions.update((current) => [...current, newPollution]);

    return of({ ...newPollution }).pipe(delay(800));
  }

  /**
   * Simule la mise à jour d'une pollution
   */
  updatePollution(
    id: number,
    updates: Partial<PollutionDeclaration>,
  ): Observable<PollutionDeclaration> {
    const pollutionIndex = this.pollutions().findIndex((p) => p.id === id);

    if (pollutionIndex === -1) {
      return throwError(() => new Error(`Pollution avec l'ID ${id} introuvable`)).pipe(delay(300));
    }

    const updatedPollution: PollutionDeclaration = {
      ...this.pollutions()[pollutionIndex],
      ...updates,
      id, // S'assurer que l'ID ne change pas
    };

    this.pollutions.update((current) => {
      const newPollutions = [...current];
      newPollutions[pollutionIndex] = updatedPollution;
      return newPollutions;
    });

    return of({ ...updatedPollution }).pipe(delay(600));
  }

  /**
   * Simule la suppression d'une pollution
   */
  deletePollution(id: number): Observable<void> {
    const pollutionIndex = this.pollutions().findIndex((p) => p.id === id);

    if (pollutionIndex === -1) {
      return throwError(() => new Error(`Pollution avec l'ID ${id} introuvable`)).pipe(delay(300));
    }

    this.pollutions.update((current) => current.filter((pollution) => pollution.id !== id));

    return of(undefined).pipe(delay(400));
  }

  /**
   * Simule une erreur réseau pour les tests
   */
  simulateNetworkError(): Observable<never> {
    return throwError(() => new Error('Erreur de réseau simulée')).pipe(delay(1000));
  }

  /**
   * Réinitialise les données aux valeurs par défaut
   */
  resetToDefaultData(): void {
    this.pollutions.set([
      {
        id: 1,
        titre: "Déversement d'huile dans la Seine",
        type_pollution: PollutionType.EAU,
        description:
          "Important déversement d'huile moteur observé près du pont Neuf. La pollution s'étend sur environ 100 mètres et affecte la faune aquatique locale.",
        date_observation: new Date('2024-01-15T14:30:00'),
        lieu: 'Seine, Pont Neuf, Paris 1er',
        latitude: 48.8566,
        longitude: 2.3422,
        photo_url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400',
      },
      {
        id: 2,
        titre: 'Dépôt sauvage de déchets industriels',
        type_pollution: PollutionType.DEPOT_SAUVAGE,
        description:
          "Découverte d'un dépôt clandestin de barils contenant des substances chimiques non identifiées dans une zone boisée.",
        date_observation: new Date('2024-01-20T09:15:00'),
        lieu: 'Forêt de Vincennes, Bois de Vincennes',
        latitude: 48.8278,
        longitude: 2.4394,
        photo_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400',
      },
      {
        id: 3,
        titre: 'Pollution plastique sur la plage',
        type_pollution: PollutionType.PLASTIQUE,
        description:
          'Accumulation massive de déchets plastiques sur le rivage après une tempête. Principalement des bouteilles, sacs et emballages alimentaires.',
        date_observation: new Date('2024-01-25T16:45:00'),
        lieu: 'Plage de Deauville, Calvados',
        latitude: 49.3598,
        longitude: 0.0748,
        photo_url: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400',
      },
      {
        id: 4,
        titre: "Fumées toxiques d'une usine",
        type_pollution: PollutionType.AIR,
        description:
          "Émissions anormales de fumées noires et odorantes provenant d'une installation industrielle, causant des irritations respiratoires aux riverains.",
        date_observation: new Date('2024-02-01T07:20:00'),
        lieu: 'Zone industrielle de Roubaix, Nord',
        latitude: 50.6942,
        longitude: 3.1746,
      },
      {
        id: 5,
        titre: 'Déversement de produits chimiques',
        type_pollution: PollutionType.CHIMIQUE,
        description:
          'Accident lors du transport de substances chimiques ayant entraîné un déversement sur la chaussée et dans les égouts.',
        date_observation: new Date('2024-02-05T11:30:00'),
        lieu: 'Autoroute A1, sortie Lille-Sud',
        latitude: 50.5736,
        longitude: 3.0635,
        photo_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      },
      {
        id: 6,
        titre: 'Pollution sonore chantier de nuit',
        type_pollution: PollutionType.AUTRE,
        description:
          'Travaux de construction effectués en violation des horaires autorisés, causant des nuisances sonores importantes pour le voisinage.',
        date_observation: new Date('2024-02-10T23:15:00'),
        lieu: 'Quartier de la Défense, Puteaux',
        latitude: 48.8918,
        longitude: 2.2364,
      },
    ]);
    this.nextId = 7;
  }
}
