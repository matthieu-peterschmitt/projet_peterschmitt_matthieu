import { CommonModule } from "@angular/common";
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    type OnInit,
    signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { catchError, EMPTY, forkJoin, of } from "rxjs";
import type { PollutionDeclaration } from "../../interfaces/pollution-declaration.interface";
import { PollutionService } from "../../services/pollution.service";
import { ClearFavorites, RemoveFavorite } from "../../state/favorites.actions";
import { FavoritesState } from "../../state/favorites.state";

@Component({
	selector: "app-favorites",
	imports: [CommonModule],
	template: `
		<div class="favorites-container">
			<div class="favorites-header">
				<h2>Mes Favoris</h2>
				@if (favoriteCount() > 0) {
					<button type="button" class="clear-btn" (click)="clearAllFavorites()">
						Tout supprimer
					</button>
				}
			</div>

			@if (isLoading()) {
				<div class="loading">Chargement des favoris...</div>
			}

			@if (errorMessage()) {
				<div class="error">{{ errorMessage() }}</div>
			}

			@if (favoritePollutions().length === 0 && !isLoading()) {
				<div class="no-favorites">
					<p>Vous n'avez pas encore de pollution en favoris.</p>
					<button type="button" class="browse-btn" (click)="browsePollutions()">
						Parcourir les pollutions
					</button>
				</div>
			} @else {
				<div class="favorites-grid">
					@for (pollution of favoritePollutions(); track pollution.id) {
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
									class="remove-btn"
									(click)="removeFavorite(pollution.id!)">
									Retirer des favoris
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
			.favorites-container {
				max-width: 1200px;
				margin: 0 auto;
				padding: 2rem;
			}

			.favorites-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 2rem;
			}

			.favorites-header h2 {
				color: #2c5530;
				margin: 0;
			}

			.clear-btn {
				background: #dc3545;
				color: white;
				border: none;
				padding: 0.75rem 1.5rem;
				border-radius: 4px;
				cursor: pointer;
				font-size: 0.9rem;
				font-weight: 600;
			}

			.clear-btn:hover {
				background: #c82333;
			}

			.loading, .error {
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

			.no-favorites {
				text-align: center;
				padding: 3rem 2rem;
				background: #f8f9fa;
				border-radius: 8px;
			}

			.no-favorites p {
				font-size: 1.1rem;
				color: #666;
				margin-bottom: 1.5rem;
			}

			.browse-btn {
				background: #007bff;
				color: white;
				border: none;
				padding: 0.75rem 1.5rem;
				border-radius: 4px;
				cursor: pointer;
				font-size: 1rem;
				font-weight: 600;
			}

			.browse-btn:hover {
				background: #0056b3;
			}

			.favorites-grid {
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
				min-width: 100px;
			}

			.detail-btn {
				background: #007bff;
				color: white;
			}

			.detail-btn:hover {
				background: #0056b3;
			}

			.remove-btn {
				background: #dc3545;
				color: white;
			}

			.remove-btn:hover {
				background: #c82333;
			}

			@media (max-width: 768px) {
				.favorites-container {
					padding: 1rem;
				}

				.favorites-header {
					flex-direction: column;
					gap: 1rem;
					align-items: stretch;
				}

				.favorites-grid {
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
export class FavoritesComponent implements OnInit {
	private readonly store = inject(Store);
	private readonly pollutionService = inject(PollutionService);
	private readonly router = inject(Router);

	protected readonly favoritePollutions = signal<PollutionDeclaration[]>([]);
	protected readonly isLoading = signal(false);
	protected readonly errorMessage = signal<string | null>(null);

	protected readonly favoriteCount = computed(() => this.favoritePollutions().length);

	ngOnInit(): void {
		this.loadFavorites();
	}

	private loadFavorites(): void {
		const favoriteIds = this.store.selectSnapshot(FavoritesState.getFavoriteIds);

		if (favoriteIds.length === 0) {
			this.favoritePollutions.set([]);
			return;
		}

		this.isLoading.set(true);
		this.errorMessage.set(null);

		// Charger toutes les pollutions favorites
		const pollutionObservables = favoriteIds.map((id) =>
			this.pollutionService.getPollutionById(id).pipe(
				catchError((error) => {
					console.error(`Erreur lors du chargement de la pollution ${id}:`, error);
					return of(null);
				})
			)
		);

		forkJoin(pollutionObservables)
			.pipe(
				catchError((error) => {
					this.errorMessage.set(
						"Erreur lors du chargement des favoris: " + error.message
					);
					this.isLoading.set(false);
					return EMPTY;
				})
			)
			.subscribe((pollutions) => {
				// Filtrer les valeurs nulles (erreurs)
				const validPollutions = pollutions.filter(
					(p): p is PollutionDeclaration => p !== null
				);
				this.favoritePollutions.set(validPollutions);
				this.isLoading.set(false);
			});
	}

	protected removeFavorite(pollutionId: number): void {
		this.store.dispatch(new RemoveFavorite(pollutionId));
		// Recharger la liste
		this.loadFavorites();
	}

	protected clearAllFavorites(): void {
		if (confirm("Êtes-vous sûr de vouloir supprimer tous vos favoris ?")) {
			this.store.dispatch(new ClearFavorites());
			this.favoritePollutions.set([]);
		}
	}

	protected viewDetail(id: number): void {
		this.router.navigate(["/pollution", id]);
	}

	protected browsePollutions(): void {
		this.router.navigate(["/pollutions"]);
	}
}
