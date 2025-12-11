import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment?.apiUrl || 'http://localhost:3000/api';

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data);
  }

  logout(refreshToken: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/logout`, {
      refreshToken,
    });
  }

  refreshToken(refreshToken: string): Observable<{
    accessToken: string;
    refreshToken: string;
  }> {
    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${this.apiUrl}/auth/refresh`,
      { refreshToken },
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`);
  }
}
