import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  type OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { catchError, EMPTY } from 'rxjs';
import type { PollutionDeclaration } from '../../interfaces/pollution-declaration.interface';
import { PollutionService } from '../../services/pollution.service';
import { AddFavorite, RemoveFavorite } from '../../state/favorites.actions';
import { FavoritesState } from '../../state/favorites.state';

@Component({
  selector: 'app-pollution-detail',
  imports: [CommonModule],
  template: `
    <div class="pollution-detail-container">
      @if (isLoading()) {
        <div class="loading">Chargement des détails de la pollution...</div>
      }

      @if (errorMessage()) {
        <div class="error">{{ errorMessage() }}</div>
      }

      @if (pollution()) {
        <div class="pollution-detail">
          <header class="detail-header">
            <button type="button" class="back-btn" (click)="goBack()">← Retour à la liste</button>
            <div class="header-actions">
              @if (isFavorite()) {
                <button type="button" class="favorite-btn remove" (click)="removeFromFavorites()">
                  ⭐ Retirer des favoris
                </button>
              } @else {
                <button type="button" class="favorite-btn add" (click)="addToFavorites()">
                  ☆ Ajouter aux favoris
                </button>
              }
              <button type="button" class="edit-btn" (click)="editPollution()">Modifier</button>
              <button type="button" class="delete-btn" (click)="deletePollution()">
                Supprimer
              </button>
            </div>
          </header>

          <div class="detail-content">
            <div class="title-section">
              <h1>{{ pollution()!.titre }}</h1>
              <span class="pollution-type">{{ pollution()!.type_pollution }}</span>
            </div>

            <div class="info-grid">
              <div class="info-section">
                <h3>Description</h3>
                <p class="description">{{ pollution()!.description }}</p>
              </div>

              <div class="info-section">
                <h3>Localisation</h3>
                <p class="location">
                  <span class="icon">📍</span>
                  {{ pollution()!.lieu }}
                </p>
                <p class="coordinates">
                  <span class="icon">🗺️</span>
                  Latitude: {{ pollution()!.latitude }} | Longitude: {{ pollution()!.longitude }}
                </p>
              </div>

              <div class="info-section">
                <h3>Date d'observation</h3>
                <p class="date">
                  <span class="icon">📅</span>
                  {{ pollution()!.date_observation | date: 'EEEE dd MMMM yyyy' : 'fr' }}
                </p>
                <p class="time">
                  <span class="icon">🕒</span>
                  {{ pollution()!.date_observation | date: 'HH:mm' : 'fr' }}
                </p>
              </div>

              @if (pollution()!.photo_url) {
                <div class="info-section photo-section">
                  <h3>Photo</h3>
                  <div class="photo-container">
                    <img
                      [src]="pollution()!.photo_url"
                      [alt]="'Photo de ' + pollution()!.titre"
                      class="pollution-photo"
                    />
                  </div>
                </div>
              }
            </div>

            <div class="map-section">
              <h3>Localisation sur la carte</h3>
              <div class="map-placeholder">
                <p>Carte interactive à implémenter</p>
                <p>Coordonnées: {{ pollution()!.latitude }}, {{ pollution()!.longitude }}</p>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .pollution-detail-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }

      .loading,
      .error {
        text-align: center;
        padding: 2rem;
        font-size: 1.1rem;
      }

      .error {
        color: #dc3545;
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
      }

      .pollution-detail {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem 2rem;
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
      }

      .back-btn {
        background: #6c757d;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .back-btn:hover {
        background: #5a6268;
      }

      .header-actions {
        display: flex;
        gap: 0.5rem;
      }

      .edit-btn {
        background: #28a745;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
      }

      .edit-btn:hover {
        background: #1e7e34;
      }

      .delete-btn {
        background: #dc3545;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
      }

      .delete-btn:hover {
        background: #c82333;
      }

      .favorite-btn {
        font-weight: 600;
        font-size: 0.9rem;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
      }

      .favorite-btn.add {
        background: #ffc107;
        color: #333;
      }

      .favorite-btn.add:hover {
        background: #e0a800;
      }

      .favorite-btn.remove {
        background: #ff9800;
        color: white;
      }

      .favorite-btn.remove:hover {
        background: #e68900;
      }

      .detail-content {
        padding: 2rem;
      }

      .title-section {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e9ecef;
      }

      .title-section h1 {
        margin: 0;
        color: #2c5530;
        flex-grow: 1;
      }

      .pollution-type {
        background: #007bff;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
      }

      .info-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
      }

      .info-section {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
      }

      .info-section h3 {
        margin: 0 0 1rem 0;
        color: #2c5530;
        font-size: 1.1rem;
      }

      .info-section p {
        margin: 0.5rem 0;
        color: #495057;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .description {
        font-size: 1.1rem;
        line-height: 1.6;
        font-style: italic;
      }

      .icon {
        font-size: 1.2rem;
      }

      .coordinates {
        font-family: monospace;
        background: #e9ecef;
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.9rem;
      }

      .photo-section {
        grid-column: 1 / -1;
      }

      .photo-container {
        text-align: center;
      }

      .pollution-photo {
        max-width: 100%;
        max-height: 400px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .map-section {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        text-align: center;
      }

      .map-section h3 {
        margin: 0 0 1rem 0;
        color: #2c5530;
      }

      .map-placeholder {
        background: #e9ecef;
        padding: 2rem;
        border-radius: 8px;
        border: 2px dashed #6c757d;
      }

      .map-placeholder p {
        margin: 0.5rem 0;
        color: #6c757d;
      }

      @media (min-width: 768px) {
        .info-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .photo-section {
          grid-column: 1 / -1;
        }
      }

      @media (max-width: 768px) {
        .pollution-detail-container {
          padding: 1rem;
        }

        .detail-header {
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }

        .header-actions {
          justify-content: center;
        }

        .title-section {
          flex-direction: column;
          gap: 1rem;
          align-items: flex-start;
        }

        .detail-content {
          padding: 1rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pollutionService = inject(PollutionService);
  private readonly store = inject(Store);

  protected readonly pollution = signal<PollutionDeclaration | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly pollutionId = computed(() => {
    return Number(this.route.snapshot.paramMap.get('id'));
  });

  ngOnInit(): void {
    const id = this.pollutionId();
    if (id) {
      this.loadPollution(id);
    } else {
      this.errorMessage.set('ID de pollution invalide');
    }
  }

  private loadPollution(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.pollutionService
      .getPollutionById(id)
      .pipe(
        catchError((error) => {
          this.errorMessage.set('Erreur lors du chargement des détails: ' + error.message);
          this.isLoading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((pollution) => {
        this.pollution.set(pollution);
        this.isLoading.set(false);
      });
  }

  protected goBack(): void {
    this.router.navigate(['/pollutions']);
  }

  protected editPollution(): void {
    const id = this.pollutionId();
    if (id) {
      this.router.navigate(['/pollution', id, 'edit']);
    }
  }

  protected deletePollution(): void {
    const pollution = this.pollution();
    if (!pollution?.id) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer la pollution "${pollution.titre}" ?`)) {
      this.isLoading.set(true);

      this.pollutionService
        .deletePollution(pollution.id)
        .pipe(
          catchError((error) => {
            this.errorMessage.set('Erreur lors de la suppression: ' + error.message);
            this.isLoading.set(false);
            return EMPTY;
          }),
        )
        .subscribe(() => {
          // Rediriger vers la liste après suppression
          this.router.navigate(['/pollutions']);
        });
    }
  }

  protected isFavorite(): boolean {
    const id = this.pollutionId();
    return this.store.selectSnapshot(FavoritesState.isFavorite)(id);
  }

  protected addToFavorites(): void {
    const id = this.pollutionId();
    if (id) {
      this.store.dispatch(new AddFavorite(id));
    }
  }

  protected removeFromFavorites(): void {
    const id = this.pollutionId();
    if (id) {
      this.store.dispatch(new RemoveFavorite(id));
    }
  }
}
