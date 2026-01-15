import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
    PollutionDeclaration,
    PollutionType,
} from '../interfaces/pollution-declaration.interface';
import { MockPollutionService } from './mock-pollution.service';

export interface PollutionFilters {
  type?: PollutionType;
  lieu?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class PollutionService {
  private readonly http = inject(HttpClient);
  private readonly mockService = inject(MockPollutionService);
  private readonly apiUrl = `${environment.apiUrl}/pollutions`;
  private readonly useMock = !environment.production;

  /**
   * Récupère toutes les déclarations de pollution
   */
  getAll(): Observable<PollutionDeclaration[]> {
    if (this.useMock) {
      return this.mockService.getAllPollutions();
    }
    return this.http.get<PollutionDeclaration[]>(this.apiUrl).pipe(
      map((pollutions) =>
        pollutions.map((pollution) => ({
          ...pollution,
          date_observation:
            typeof pollution.date_observation === 'string'
              ? new Date(pollution.date_observation)
              : pollution.date_observation,
        })),
      ),
    );
  }

  /**
   * Récupère toutes les déclarations de pollution
   */
  getAllPollutions(): Observable<PollutionDeclaration[]> {
    if (this.useMock) {
      return this.mockService.getAllPollutions();
    }
    return this.http.get<PollutionDeclaration[]>(this.apiUrl).pipe(
      map((pollutions) =>
        pollutions.map((pollution) => ({
          ...pollution,
          date_observation:
            typeof pollution.date_observation === 'string'
              ? new Date(pollution.date_observation)
              : pollution.date_observation,
        })),
      ),
    );
  }

  /**
   * Recherche des déclarations de pollution par titre
   */
  searchPollutions(query: string): Observable<PollutionDeclaration[]> {
    if (this.useMock) {
      return this.mockService.getAllPollutions().pipe(
        map((pollutions) =>
          pollutions.filter((p) => p.titre.toLowerCase().includes(query.toLowerCase()))
        )
      );
    }

    const params = new HttpParams().set('search', query);

    return this.http.get<PollutionDeclaration[]>(this.apiUrl, { params }).pipe(
      map((pollutions) =>
        pollutions.map((pollution) => ({
          ...pollution,
          date_observation:
            typeof pollution.date_observation === 'string'
              ? new Date(pollution.date_observation)
              : pollution.date_observation,
        })),
      ),
    );
  }

  /**
   * Récupère les pollutions avec filtres
   */
  getPollutionsWithFilters(filters: PollutionFilters): Observable<PollutionDeclaration[]> {
    if (this.useMock) {
      return this.mockService.getPollutionsWithFilters(filters);
    }

    let params = new HttpParams();

    if (filters.type) {
      params = params.set('type', filters.type);
    }
    if (filters.lieu) {
      params = params.set('lieu', filters.lieu);
    }
    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom.toISOString());
    }
    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo.toISOString());
    }

    return this.http.get<PollutionDeclaration[]>(this.apiUrl, { params });
  }

  /**
   * Récupère une déclaration de pollution par son ID
   */
  getPollutionById(id: number): Observable<PollutionDeclaration> {
    if (this.useMock) {
      return this.mockService.getPollutionById(id);
    }
    return this.http.get<PollutionDeclaration>(`${this.apiUrl}/${id}`).pipe(
      map((pollution) => ({
        ...pollution,
        date_observation:
          typeof pollution.date_observation === 'string'
            ? new Date(pollution.date_observation)
            : pollution.date_observation,
      })),
    );
  }

  /**
   * Crée une nouvelle déclaration de pollution
   */
  createPollution(pollution: Omit<PollutionDeclaration, 'id'>, file?: File): Observable<PollutionDeclaration> {
    if (this.useMock) {
      return this.mockService.createPollution(pollution);
    }

    // Utiliser FormData si un fichier est fourni
    if (file) {
      const formData = new FormData();
      formData.append('titre', pollution.titre);
      formData.append('description', pollution.description);
      formData.append('type_pollution', pollution.type_pollution);
      formData.append('lieu', pollution.lieu);
      formData.append('date_observation', pollution.date_observation.toISOString());

      if (pollution.latitude !== undefined) {
        formData.append('latitude', pollution.latitude.toString());
      }
      if (pollution.longitude !== undefined) {
        formData.append('longitude', pollution.longitude.toString());
      }
      if (pollution.decouvreur_nom) {
        formData.append('decouvreur_nom', pollution.decouvreur_nom);
      }
      if (pollution.decouvreur_prenom) {
        formData.append('decouvreur_prenom', pollution.decouvreur_prenom);
      }

      formData.append('photo', file);

      return this.http.post<PollutionDeclaration>(this.apiUrl, formData);
    }

    // Sinon, envoyer en JSON (sans photo_url)
    const pollutionData = { ...pollution } as any;
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete pollutionData.photo_url;
    return this.http.post<PollutionDeclaration>(this.apiUrl, pollutionData);
  }

  /**
   * Met à jour une déclaration de pollution existante
   */
  updatePollution(
    id: number,
    pollution: Partial<PollutionDeclaration>,
    file?: File,
  ): Observable<PollutionDeclaration> {
    if (this.useMock) {
      return this.mockService.updatePollution(id, pollution);
    }

    // Utiliser FormData si un fichier est fourni
    if (file) {
      const formData = new FormData();

      if (pollution.titre) formData.append('titre', pollution.titre);
      if (pollution.description) formData.append('description', pollution.description);
      if (pollution.type_pollution) formData.append('type_pollution', pollution.type_pollution);
      if (pollution.lieu) formData.append('lieu', pollution.lieu);
      if (pollution.date_observation) {
        const date = typeof pollution.date_observation === 'string'
          ? pollution.date_observation
          : pollution.date_observation.toISOString();
        formData.append('date_observation', date);
      }
      if (pollution.latitude !== undefined) {
        formData.append('latitude', pollution.latitude.toString());
      }
      if (pollution.longitude !== undefined) {
        formData.append('longitude', pollution.longitude.toString());
      }
      if (pollution.decouvreur_nom) {
        formData.append('decouvreur_nom', pollution.decouvreur_nom);
      }
      if (pollution.decouvreur_prenom) {
        formData.append('decouvreur_prenom', pollution.decouvreur_prenom);
      }

      formData.append('photo', file);

      return this.http.put<PollutionDeclaration>(`${this.apiUrl}/${id}`, formData, {
        responseType: 'text' as 'json',
      });
    }

    // Sinon, envoyer en JSON (sans photo_url)
    const pollutionData = { ...pollution } as any;
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete pollutionData.photo_url;
    return this.http.put<PollutionDeclaration>(`${this.apiUrl}/${id}`, pollutionData, {
      responseType: 'text' as 'json',
    });
  }

  /**
   * Supprime une déclaration de pollution
   */
  deletePollution(id: number): Observable<void> {
    if (this.useMock) {
      return this.mockService.deletePollution(id);
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
