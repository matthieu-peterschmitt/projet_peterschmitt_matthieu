import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Store } from '@ngxs/store';
import { Logout } from './state/auth.actions';
import { AuthState } from './state/auth.state';
import { FavoritesState } from './state/favorites.state';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  protected readonly title = 'TP4 - Gestion des Pollutions';
  protected readonly favoritesCount = computed(() =>
    this.store.selectSnapshot(FavoritesState.getFavoritesCount),
  );
  protected readonly isAuthenticated = computed(() =>
    this.store.selectSnapshot(AuthState.isAuthenticated),
  );
  protected readonly currentUser = computed(() => this.store.selectSnapshot(AuthState.user));

  logout(): void {
    this.store.dispatch(new Logout()).subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
