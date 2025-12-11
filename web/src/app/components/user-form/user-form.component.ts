import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import type { User } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="user-form-container">
      <h2>Créer un Utilisateur</h2>

      @if (isFormSubmitted()) {
        <div class="success-message">
          <h3>✅ Utilisateur créé avec succès !</h3>
          <p>L'utilisateur a été ajouté au système.</p>
        </div>
      } @else {
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="user-form">
          <!-- Message d'erreur -->
          @if (errorMessage()) {
            <div class="error-message">{{ errorMessage() }}</div>
          }

          <!-- ID -->
          <div class="form-group">
            <label for="id">Identifiant <span class="required">*</span></label>
            <input
              id="id"
              type="text"
              formControlName="id"
              placeholder="Ex: user001"
              [class.invalid]="isFieldInvalid('id')"
            />
            @if (getFieldError('id')) {
              <span class="error-text">{{ getFieldError('id') }}</span>
            }
          </div>

          <!-- Nom -->
          <div class="form-group">
            <label for="nom">Nom <span class="required">*</span></label>
            <input
              id="nom"
              type="text"
              formControlName="nom"
              placeholder="Ex: Dupont"
              [class.invalid]="isFieldInvalid('nom')"
            />
            @if (getFieldError('nom')) {
              <span class="error-text">{{ getFieldError('nom') }}</span>
            }
          </div>

          <!-- Prénom -->
          <div class="form-group">
            <label for="prenom">Prénom</label>
            <input
              id="prenom"
              type="text"
              formControlName="prenom"
              placeholder="Ex: Jean"
              [class.invalid]="isFieldInvalid('prenom')"
            />
            @if (getFieldError('prenom')) {
              <span class="error-text">{{ getFieldError('prenom') }}</span>
            }
          </div>

          <!-- Login -->
          <div class="form-group">
            <label for="login">Login <span class="required">*</span></label>
            <input
              id="login"
              type="text"
              formControlName="login"
              placeholder="Ex: jdupont"
              [class.invalid]="isFieldInvalid('login')"
            />
            @if (getFieldError('login')) {
              <span class="error-text">{{ getFieldError('login') }}</span>
            }
          </div>

          <!-- Mot de passe -->
          <div class="form-group">
            <label for="pass">Mot de passe</label>
            <input
              id="pass"
              type="password"
              formControlName="pass"
              placeholder="Mot de passe"
              [class.invalid]="isFieldInvalid('pass')"
            />
            @if (getFieldError('pass')) {
              <span class="error-text">{{ getFieldError('pass') }}</span>
            }
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="submit" class="submit-btn" [disabled]="isLoading()">
              @if (isLoading()) {
                ⏳ Création en cours...
              } @else {
                ➕ Créer l'utilisateur
              }
            </button>
            <button type="button" class="reset-btn" (click)="resetForm()" [disabled]="isLoading()">
              🔄 Réinitialiser
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [
    `
      .user-form-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 2rem;
      }

      h2 {
        color: #2c5530;
        margin-bottom: 2rem;
        text-align: center;
      }

      .success-message {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
        padding: 1.5rem;
        border-radius: 8px;
        text-align: center;
      }

      .success-message h3 {
        margin: 0 0 0.5rem 0;
      }

      .success-message p {
        margin: 0;
      }

      .error-message {
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1.5rem;
      }

      .user-form {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #2c5530;
      }

      .required {
        color: #dc3545;
      }

      .form-group input,
      .form-group select,
      .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
      }

      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: #2c5530;
      }

      .form-group input.invalid,
      .form-group select.invalid,
      .form-group textarea.invalid {
        border-color: #dc3545;
      }

      .error-text {
        display: block;
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
      }

      .form-actions button {
        flex: 1;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .submit-btn {
        background: #28a745;
        color: white;
      }

      .submit-btn:hover:not(:disabled) {
        background: #218838;
      }

      .submit-btn:disabled {
        background: #6c757d;
        cursor: not-allowed;
      }

      .reset-btn {
        background: #6c757d;
        color: white;
      }

      .reset-btn:hover:not(:disabled) {
        background: #5a6268;
      }

      .reset-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      @media (max-width: 768px) {
        .user-form-container {
          padding: 1rem;
        }

        .user-form {
          padding: 1rem;
        }

        .form-actions {
          flex-direction: column;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  userForm: FormGroup;
  protected readonly isFormSubmitted = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.userForm = this.formBuilder.group({
      id: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
      nom: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
      prenom: ['', [Validators.maxLength(255)]],
      login: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      pass: ['', [Validators.minLength(6), Validators.maxLength(255)]],
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      const user: Omit<User, 'id'> & { id: string } = {
        id: formValue.id.trim(),
        nom: formValue.nom.trim(),
        prenom: formValue.prenom ? formValue.prenom.trim() : undefined,
        login: formValue.login.trim(),
        pass: formValue.pass ? formValue.pass : undefined,
      };

      this.createUser(user);
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private createUser(user: Omit<User, 'id'> & { id: string }): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService
      .createUser(user)
      .pipe(
        catchError((error) => {
          this.errorMessage.set('Erreur lors de la création: ' + error.message);
          this.isLoading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((_createdUser) => {
        this.isFormSubmitted.set(true);
        this.isLoading.set(false);

        // Rediriger vers la liste des utilisateurs après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/users']);
        }, 2000);
      });
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.userForm.controls).forEach((key) => {
      this.userForm.get(key)?.markAsTouched();
    });
  }

  resetForm(): void {
    this.isFormSubmitted.set(false);
    this.errorMessage.set(null);
    this.userForm.reset();
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return this.getRequiredErrorMessage(fieldName);
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} doit contenir au moins ${requiredLength} caractères.`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} ne peut pas dépasser ${maxLength} caractères.`;
      }
    }

    return '';
  }

  private getRequiredErrorMessage(fieldName: string): string {
    const messages: { [key: string]: string } = {
      id: "L'identifiant est requis.",
      nom: 'Le nom est requis.',
      login: 'Le login est requis.',
    };
    return messages[fieldName] || `Le champ ${fieldName} est requis.`;
  }

  private getFieldDisplayName(fieldName: string): string {
    const names: { [key: string]: string } = {
      id: "L'identifiant",
      nom: 'Le nom',
      prenom: 'Le prénom',
      login: 'Le login',
      pass: 'Le mot de passe',
    };
    return names[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
