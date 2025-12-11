import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../interfaces/user.interface';
import { AuthService } from '../services/auth.service';
import { LoadCurrentUser, Login, Logout, RefreshToken, Register, SetTokens } from './auth.actions';

export interface AuthStateModel {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
})
@Injectable()
export class AuthState {
  private authService = inject(AuthService);

  @Selector()
  static user(state: AuthStateModel): User | null {
    return state.user;
  }

  @Selector()
  static accessToken(state: AuthStateModel): string | null {
    return state.accessToken;
  }

  @Selector()
  static refreshToken(state: AuthStateModel): string | null {
    return state.refreshToken;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  @Selector()
  static loading(state: AuthStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: AuthStateModel): string | null {
    return state.error;
  }

  @Selector()
  static userRole(state: AuthStateModel): string | undefined {
    return state.user?.role;
  }

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login) {
    ctx.patchState({ loading: true, error: null });

    return this.authService.login(action.credentials).pipe(
      tap((response) => {
        ctx.patchState({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.error?.message || 'Login failed',
        });
        return of(null);
      }),
    );
  }

  @Action(Register)
  register(ctx: StateContext<AuthStateModel>, action: Register) {
    ctx.patchState({ loading: true, error: null });

    return this.authService.register(action.data).pipe(
      tap((response) => {
        ctx.patchState({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.error?.message || 'Registration failed',
        });
        return of(null);
      }),
    );
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    const state = ctx.getState();
    const refreshToken = state.refreshToken;

    if (refreshToken) {
      this.authService.logout(refreshToken).subscribe();
    }

    ctx.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  }

  @Action(RefreshToken)
  refreshToken(ctx: StateContext<AuthStateModel>, action: RefreshToken) {
    return this.authService.refreshToken(action.refreshToken).pipe(
      tap((response) => {
        ctx.patchState({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      }),
      catchError((_error) => {
        // If refresh fails, logout the user
        ctx.dispatch(new Logout());
        return of(null);
      }),
    );
  }

  @Action(SetTokens)
  setTokens(ctx: StateContext<AuthStateModel>, action: SetTokens) {
    ctx.patchState({
      accessToken: action.accessToken,
      refreshToken: action.refreshToken,
      isAuthenticated: true,
    });
  }

  @Action(LoadCurrentUser)
  loadCurrentUser(ctx: StateContext<AuthStateModel>) {
    return this.authService.getCurrentUser().pipe(
      tap((user) => {
        ctx.patchState({
          user,
          isAuthenticated: true,
        });
      }),
      catchError((_error) => {
        // If loading user fails, logout
        ctx.dispatch(new Logout());
        return of(null);
      }),
    );
  }
}
