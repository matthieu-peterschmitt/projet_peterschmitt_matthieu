import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { RefreshToken } from '../state/auth.actions';
import { AuthState } from '../state/auth.state';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const store = inject(Store);

  // Skip token injection for auth endpoints
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh');

  if (isAuthEndpoint) {
    return next(req);
  }

  // Get access token from store
  const accessToken = store.selectSnapshot(AuthState.accessToken);

  // Clone request and add Authorization header if token exists
  let clonedReq = req;
  if (accessToken) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  // Handle the request
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 Unauthorized and we have a refresh token, try to refresh
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        const refreshToken = store.selectSnapshot(AuthState.refreshToken);

        if (refreshToken) {
          // Attempt to refresh the token
          return store.dispatch(new RefreshToken(refreshToken)).pipe(
            take(1),
            switchMap(() => {
              // Get the new access token
              const newAccessToken = store.selectSnapshot(AuthState.accessToken);

              if (newAccessToken) {
                // Retry the original request with the new token
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newAccessToken}`,
                  },
                });
                return next(retryReq);
              }

              return throwError(() => error);
            }),
            catchError((_refreshError) => {
              // If refresh fails, propagate the original error
              return throwError(() => error);
            }),
          );
        }
      }

      return throwError(() => error);
    }),
  );
};
