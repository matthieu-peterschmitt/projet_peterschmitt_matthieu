import { CommonModule } from "@angular/common";
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    type OnInit,
    signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { catchError, EMPTY } from "rxjs";
import {
    type PollutionDeclaration,
    PollutionType,
} from "../../interfaces/pollution-declaration.interface";
import {
    type PollutionFilters,
    PollutionService,
} from "../../services/pollution.service";
import { AddFavorite, RemoveFavorite } from "../../state/favorites.actions";
import { FavoritesState } from "../../state/favorites.state";

@Component({
	selector: "app-pollution-list",
	imports: [CommonModule, FormsModule],
	template: `
    <div class="pollution-list-container">
      <h2>Liste des Pollutions</h2>

      <!-- Filtres -->
      <div class="filters-section">
        <h3>Filtres</h3>
        <div class="filters-grid">
          <div class="filter-group">
            <label for="type-filter">Type de pollution :</label>
            <select
              id="type-filter"
              [(ngModel)]="filters().type"
              (ngModelChange)="onFilterChange()">
              <option value="">Tous les types</option>
              @for (type of pollutionTypes; track type) {
                <option [value]="type">{{ type }}</option>
              }
            </select>
          </div>

          <div class="filter-group">
            <label for="lieu-filter">Lieu :</label>
            <input
              id="lieu-filter"
              type="text"
              [(ngModel)]="filters().lieu"
              (ngModelChange)="onFilterChange()"
              placeholder="Filtrer par lieu">
          </div>

          <div class="filter-group">
            <label for="date-from">Date début :</label>
            <input
              id="date-from"
              type="date"
              [ngModel]="filters().dateFrom | date:'yyyy-MM-dd'"
              (ngModelChange)="onDateFromChange($event)">
          </div>

          <div class="filter-group">
            <label for="date-to">Date fin :</label>
            <input
              id="date-to"
              type="date"
              [ngModel]="filters().dateTo | date:'yyyy-MM-dd'"
              (ngModelChange)="onDateToChange($event)">
          </div>
        </div>

        <button type="button" class="reset-btn" (click)="resetFilters()">
          Réinitialiser les filtres
        </button>
      </div>

      <!-- État de chargement -->
      @if (isLoading()) {
        <div class="loading">Chargement des pollutions...</div>
      }

      <!-- Message d'erreur -->
      @if (errorMessage()) {
        <div class="error">{{ errorMessage() }}</div>
      }

      <!-- Liste des pollutions -->
      @if (filteredPollutions().length === 0 && !isLoading()) {
        <div class="no-pollutions">Aucune pollution trouvée.</div>
      } @else {
        <div class="pollutions-grid">
          @for (pollution of filteredPollutions(); track pollution.id) {
            <div class="pollution-card">
              <div class="pollution-header">
                <h4>{{ pollution.titre }}</h4>
                <span class="pollution-type">{{ pollution.type_pollution }}</span>
              </div>

              <div class="pollution-content">
                <p class="description">{{ pollution.description }}</p>
                <p class="location">📍 {{ pollution.lieu }}</p>
                <p class="date">📅 {{ pollution.date_observation | date:'dd/MM/yyyy' }}</p>

                @if (pollution.photo_url) {
                  <img
                    [src]="pollution.photo_url"
                    [alt]="'Photo de ' + pollution.titre"
                    class="pollution-image">
                }
              </div>

              <div class="pollution-actions">
                <button
                  type="button"
                  class="detail-btn"
                  (click)="viewDetail(pollution.id!)">
                  Voir détails
                </button>
                <button
                  type="button"
                  class="edit-btn"
                  (click)="editPollution(pollution.id!)">
                  Modifier
                </button>
                @if (isFavorite(pollution.id!)) {
                  <button
                    type="button"
                    class="favorite-btn remove"
                    (click)="removeFromFavorites(pollution.id!)">
                    ⭐ Retirer
                  </button>
                } @else {
                  <button
                    type="button"
                    class="favorite-btn add"
                    (click)="addToFavorites(pollution.id!)">
                    ☆ Ajouter
                  </button>
                }
                <button
                  type="button"
                  class="delete-btn"
                  (click)="deletePollution(pollution.id!)">
                  Supprimer
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
	styles: [
		`
    .pollution-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    h2 {
      color: #2c5530;
      margin-bottom: 2rem;
      text-align: center;
    }

    .filters-section {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .filters-section h3 {
      margin-top: 0;
      color: #2c5530;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 600;
      color: #2c5530;
    }

    .filter-group input,
    .filter-group select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .reset-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .reset-btn:hover {
      background: #5a6268;
    }

    .loading, .error, .no-pollutions {
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

    .pollutions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .pollution-card {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: box-shadow 0.3s ease;
    }

    .pollution-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .pollution-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .pollution-header h4 {
      margin: 0;
      color: #2c5530;
      flex-grow: 1;
    }

    .pollution-type {
      background: #e9ecef;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #495057;
    }

    .pollution-content p {
      margin: 0.5rem 0;
      color: #666;
    }

    .description {
      font-style: italic;
    }

    .pollution-image {
      max-width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 4px;
      margin-top: 1rem;
    }

    .pollution-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1.5rem;
      flex-wrap: wrap;
    }

    .pollution-actions button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      flex: 1;
      min-width: 80px;
    }

    .detail-btn {
      background: #007bff;
      color: white;
    }

    .detail-btn:hover {
      background: #0056b3;
    }

    .edit-btn {
      background: #28a745;
      color: white;
    }

    .edit-btn:hover {
      background: #1e7e34;
    }

    .delete-btn {
      background: #dc3545;
      color: white;
    }

    .delete-btn:hover {
      background: #c82333;
    }

    .favorite-btn {
      font-weight: 600;
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

    @media (max-width: 768px) {
      .pollution-list-container {
        padding: 1rem;
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .pollutions-grid {
        grid-template-columns: 1fr;
      }

      .pollution-actions {
        flex-direction: column;
      }

      .pollution-actions button {
        flex: none;
      }
    }
  `,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionListComponent implements OnInit {
	private readonly pollutionService = inject(PollutionService);
	private readonly router = inject(Router);
	private readonly store = inject(Store);

	protected readonly pollutions = signal<PollutionDeclaration[]>([]);
	protected readonly filters = signal<PollutionFilters>({});
	protected readonly isLoading = signal(false);
	protected readonly errorMessage = signal<string | null>(null);

	protected readonly pollutionTypes = Object.values(PollutionType);

	protected readonly filteredPollutions = computed(() => {
		const pollutions = this.pollutions();
		const currentFilters = this.filters();

		return pollutions.filter((pollution) => {
			// Filtre par type
			if (currentFilters.type && pollution.type_pollution !== currentFilters.type) {
				return false;
			}

			// Filtre par lieu
			if (
				currentFilters.lieu &&
				!pollution.lieu
					.toLowerCase()
					.includes(currentFilters.lieu.toLowerCase())
			) {
				return false;
			}

			// Filtre par date début
			if (
				currentFilters.dateFrom &&
				new Date(pollution.date_observation) < currentFilters.dateFrom
			) {
				return false;
			}

			// Filtre par date fin
			if (
				currentFilters.dateTo &&
				new Date(pollution.date_observation) > currentFilters.dateTo
			) {
				return false;
			}

			return true;
		});
	});

	ngOnInit(): void {
		this.loadPollutions();
	}

	private loadPollutions(): void {
		this.isLoading.set(true);
		this.errorMessage.set(null);

		this.pollutionService
			.getAllPollutions()
			.pipe(
				catchError((error) => {
					this.errorMessage.set(
						"Erreur lors du chargement des pollutions: " + error.message,
					);
					this.isLoading.set(false);
					return EMPTY;
				}),
			)
			.subscribe((pollutions) => {
				this.pollutions.set(pollutions);
				this.isLoading.set(false);
			});
	}

	protected onFilterChange(): void {
		// Les filtres sont déjà mis à jour via ngModel
		// Cette méthode peut être utilisée pour des actions supplémentaires
	}

	protected onDateFromChange(dateString: string): void {
		const currentFilters = this.filters();
		this.filters.set({
			...currentFilters,
			dateFrom: dateString ? new Date(dateString) : undefined,
		});
	}

	protected onDateToChange(dateString: string): void {
		const currentFilters = this.filters();
		this.filters.set({
			...currentFilters,
			dateTo: dateString ? new Date(dateString) : undefined,
		});
	}

	protected resetFilters(): void {
		this.filters.set({});
	}

	protected viewDetail(id: number): void {
		this.router.navigate(["/pollution", id]);
	}

	protected editPollution(id: number): void {
		this.router.navigate(["/pollution", id, "edit"]);
	}

	protected deletePollution(id: number): void {
		if (
			confirm(
				"Êtes-vous sûr de vouloir supprimer cette déclaration de pollution ?",
			)
		) {
			this.isLoading.set(true);

			this.pollutionService
				.deletePollution(id)
				.pipe(
					catchError((error) => {
						this.errorMessage.set(
							"Erreur lors de la suppression: " + error.message,
						);
						this.isLoading.set(false);
						return EMPTY;
					}),
				)
				.subscribe(() => {
					// Recharger la liste après suppression
					this.loadPollutions();
				});
		}
	}

	protected isFavorite(pollutionId: number): boolean {
		return this.store.selectSnapshot(FavoritesState.isFavorite)(pollutionId);
	}

	protected addToFavorites(pollutionId: number): void {
		this.store.dispatch(new AddFavorite(pollutionId));
	}

	protected removeFromFavorites(pollutionId: number): void {
		this.store.dispatch(new RemoveFavorite(pollutionId));
	}
}
