import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Login } from '../../state/auth.actions';
import { AuthState } from '../../state/auth.state';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);

  loginForm = this.fb.nonNullable.group({
    login: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const credentials = this.loginForm.getRawValue();

    this.store.dispatch(new Login(credentials)).subscribe({
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
        this.error.set(err.error?.message || 'Login failed');
      },
    });
  }

  get loginControl() {
    return this.loginForm.controls.login;
  }

  get passwordControl() {
    return this.loginForm.controls.password;
  }
}
