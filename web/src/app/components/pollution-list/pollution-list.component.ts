import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    type OnInit,
    signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, Subject, switchMap } from 'rxjs';
import {
    type PollutionDeclaration
} from '../../interfaces/pollution-declaration.interface';
import { PollutionService } from '../../services/pollution.service';
import { AddFavorite, RemoveFavorite } from '../../state/favorites.actions';
import { FavoritesState } from '../../state/favorites.state';

@Component({
  selector: 'app-pollution-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './pollution-list.component.html',
  styleUrls: ['./pollution-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionListComponent implements OnInit {
  private readonly pollutionService = inject(PollutionService);
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  // Données
  protected readonly pollutions = signal<PollutionDeclaration[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Filtre de recherche sur le titre
  protected readonly searchQuery = signal<string>('');
  private readonly searchSubject = new Subject<string>();
  private lastSearchQuery = '';

  // Statistiques calculées
  protected readonly totalPollutions = computed(() => this.pollutions().length);
  protected readonly hasActiveSearch = computed(() => !!this.searchQuery());

  ngOnInit(): void {
    this.loadPollutions();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300), // Attendre 300ms après que l'utilisateur arrête de taper
        distinctUntilChanged(), // Ne pas envoyer si la valeur n'a pas changé
        switchMap((query) => {
          const trimmedQuery = query.trim();

          // Ne pas envoyer si c'est la même recherche que la dernière
          if (trimmedQuery === this.lastSearchQuery) {
            return EMPTY;
          }

          this.lastSearchQuery = trimmedQuery;
          this.isLoading.set(true);
          this.errorMessage.set(null);

          // Si la recherche est vide, charger toutes les pollutions
          if (!trimmedQuery) {
            return this.pollutionService.getAllPollutions();
          }

          // Sinon, effectuer la recherche côté serveur
          return this.pollutionService.searchPollutions(trimmedQuery);
        }),
        catchError((error) => {
          this.errorMessage.set('Erreur lors de la recherche: ' + error.message);
          this.isLoading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((pollutions) => {
        this.pollutions.set(pollutions);
        this.isLoading.set(false);
      });
  }

  private loadPollutions(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.pollutionService
      .getAllPollutions()
      .pipe(
        catchError((error) => {
          this.errorMessage.set('Erreur lors du chargement des pollutions: ' + error.message);
          this.isLoading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((pollutions) => {
        this.pollutions.set(pollutions);
        this.isLoading.set(false);
      });
  }

  // Méthode de mise à jour de la recherche
  protected onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
    this.searchSubject.next('');
  }

  protected viewDetail(id: number): void {
    this.router.navigate(['/pollution', id]);
  }

  protected editPollution(id: number): void {
    this.router.navigate(['/pollution', id, 'edit']);
  }

  protected deletePollution(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette déclaration de pollution ?')) {
      this.isLoading.set(true);

      this.pollutionService
        .deletePollution(id)
        .pipe(
          catchError((error) => {
            this.errorMessage.set('Erreur lors de la suppression: ' + error.message);
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
