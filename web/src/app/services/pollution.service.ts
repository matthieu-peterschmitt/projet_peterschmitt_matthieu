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
  createPollution(pollution: Omit<PollutionDeclaration, 'id'>): Observable<PollutionDeclaration> {
    if (this.useMock) {
      return this.mockService.createPollution(pollution);
    }
    return this.http.post<PollutionDeclaration>(this.apiUrl, pollution);
  }

  /**
   * Met à jour une déclaration de pollution existante
   */
  updatePollution(
    id: number,
    pollution: Partial<PollutionDeclaration>,
  ): Observable<PollutionDeclaration> {
    if (this.useMock) {
      return this.mockService.updatePollution(id, pollution);
    }
    return this.http.put<PollutionDeclaration>(`${this.apiUrl}/${id}`, pollution, {
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
