import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { Register } from '../../state/auth.actions';
import { AuthState } from '../../state/auth.state';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);

  registerForm = this.fb.nonNullable.group({
    login: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
  });

  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const data = this.registerForm.getRawValue();

    this.store.dispatch(new Register(data)).subscribe({
      next: () => {
        this.loading.set(false);
        const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
        const authError = this.store.selectSnapshot(AuthState.error);

        if (isAuthenticated) {
          this.router.navigate(['/pollutions']);
        } else if (authError) {
          this.error.set(authError);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Registration failed');
      },
    });
  }

  get loginControl() {
    return this.registerForm.controls.login;
  }

  get passwordControl() {
    return this.registerForm.controls.password;
  }

  get nomControl() {
    return this.registerForm.controls.nom;
  }

  get prenomControl() {
    return this.registerForm.controls.prenom;
  }
}
