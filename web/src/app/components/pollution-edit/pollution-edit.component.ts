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
import { catchError, EMPTY } from 'rxjs';
import type { PollutionDeclaration } from '../../interfaces/pollution-declaration.interface';
import { PollutionService } from '../../services/pollution.service';
import { PollutionFormComponent } from '../pollution-form/pollution-form.component';

@Component({
  selector: 'app-pollution-edit',
  imports: [CommonModule, PollutionFormComponent],
  template: `
    <div class="pollution-edit-container">
      @if (isLoading()) {
        <div class="loading">Chargement de la pollution...</div>
      }

      @if (errorMessage()) {
        <div class="error">
          {{ errorMessage() }}
          <button type="button" class="retry-btn" (click)="loadPollution()">Réessayer</button>
        </div>
      }

      @if (pollution()) {
        <div class="edit-header">
          <button type="button" class="back-btn" (click)="goBack()">← Retour aux détails</button>
        </div>

        <app-pollution-form
          [pollution]="pollution()"
          (declarationSubmitted)="onPollutionUpdated($event)"
        >
        </app-pollution-form>
      }
    </div>
  `,
  styles: [
    `
      .pollution-edit-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem;
      }

      .loading,
      .error {
        text-align: center;
        padding: 3rem 2rem;
        font-size: 1.2rem;
      }

      .error {
        color: #dc3545;
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 8px;
        margin-bottom: 2rem;
      }

      .retry-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 1rem;
        font-size: 0.9rem;
      }

      .retry-btn:hover {
        background: #0056b3;
      }

      .edit-header {
        margin-bottom: 2rem;
      }

      .back-btn {
        background: #6c757d;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: background-color 0.3s ease;
      }

      .back-btn:hover {
        background: #5a6268;
      }

      @media (max-width: 768px) {
        .pollution-edit-container {
          padding: 1rem;
        }

        .loading,
        .error {
          padding: 2rem 1rem;
          font-size: 1rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pollutionService = inject(PollutionService);

  protected readonly pollution = signal<PollutionDeclaration | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly pollutionId = computed(() => {
    return Number(this.route.snapshot.paramMap.get('id'));
  });

  ngOnInit(): void {
    const id = this.pollutionId();
    if (id) {
      this.loadPollution();
    } else {
      this.errorMessage.set('ID de pollution invalide');
    }
  }

  protected loadPollution(): void {
    const id = this.pollutionId();
    if (!id) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.pollutionService
      .getPollutionById(id)
      .pipe(
        catchError((error) => {
          this.errorMessage.set('Erreur lors du chargement de la pollution: ' + error.message);
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
    const id = this.pollutionId();
    if (id) {
      this.router.navigate(['/pollution', id]);
    } else {
      this.router.navigate(['/pollutions']);
    }
  }

  protected onPollutionUpdated(updatedPollution: PollutionDeclaration): void {
    // Le formulaire gère déjà la redirection
    // Cette méthode peut être utilisée pour des actions supplémentaires si nécessaire
    console.log('Pollution mise à jour:', updatedPollution);
  }
}
