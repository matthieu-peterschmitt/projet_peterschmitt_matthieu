import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
  protected readonly favoritesCount = toSignal(
    this.store.select(FavoritesState.getFavoritesCount),
    { initialValue: 0 }
  );
  protected readonly isAuthenticated = toSignal(
    this.store.select(AuthState.isAuthenticated),
    { initialValue: false }
  );
  protected readonly currentUser = toSignal(
    this.store.select(AuthState.user),
    { initialValue: null }
  );

  logout(): void {
    this.store.dispatch(new Logout()).subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
