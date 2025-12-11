import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, type OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import type { User } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule],
  template: `
    <div class="user-list-container">
      <h2>Liste des Utilisateurs</h2>

      <!-- État de chargement -->
      @if (isLoading()) {
        <div class="loading">Chargement des utilisateurs...</div>
      }

      <!-- Message d'erreur -->
      @if (errorMessage()) {
        <div class="error">{{ errorMessage() }}</div>
      }

      <!-- Liste des utilisateurs -->
      @if (users().length === 0 && !isLoading() && !errorMessage()) {
        <div class="no-users">Aucun utilisateur trouvé.</div>
      } @else if (!isLoading()) {
        <div class="users-table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user.id) {
                <tr>
                  <td>{{ user.id }}</td>
                  <td>{{ user.nom }}</td>
                  <td>{{ user.prenom || 'N/A' }}</td>
                  <td>{{ user.login }}</td>
                  <td class="actions">
                    <button
                      type="button"
                      class="delete-btn"
                      (click)="deleteUser(user.id!)"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .user-list-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      h2 {
        color: #2c5530;
        margin-bottom: 2rem;
        text-align: center;
      }

      .loading,
      .error,
      .no-users {
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

      .users-table-container {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow-x: auto;
      }

      .users-table {
        width: 100%;
        border-collapse: collapse;
      }

      .users-table thead {
        background: #2c5530;
        color: white;
      }

      .users-table th {
        padding: 1rem;
        text-align: left;
        font-weight: 600;
      }

      .users-table td {
        padding: 1rem;
        border-bottom: 1px solid #e9ecef;
      }

      .users-table tbody tr:hover {
        background: #f8f9fa;
      }

      .actions {
        text-align: center;
      }

      .delete-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0.25rem 0.5rem;
        transition: transform 0.2s ease;
      }

      .delete-btn:hover {
        transform: scale(1.2);
      }

      @media (max-width: 768px) {
        .user-list-container {
          padding: 1rem;
        }

        .users-table {
          font-size: 0.9rem;
        }

        .users-table th,
        .users-table td {
          padding: 0.5rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  protected readonly users = signal<User[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService
      .getAllUsers()
      .pipe(
        catchError((error) => {
          this.errorMessage.set('Erreur lors du chargement des utilisateurs: ' + error.message);
          this.isLoading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((users) => {
        this.users.set(users);
        this.isLoading.set(false);
      });
  }

  protected deleteUser(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.isLoading.set(true);

      this.userService
        .deleteUser(id)
        .pipe(
          catchError((error) => {
            this.errorMessage.set('Erreur lors de la suppression: ' + error.message);
            this.isLoading.set(false);
            return EMPTY;
          }),
        )
        .subscribe(() => {
          // Recharger la liste après suppression
          this.loadUsers();
        });
    }
  }
}
