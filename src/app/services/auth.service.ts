import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {environment} from './../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  mobileNumber: string;
  city: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessTokenExpiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
  user: AuthUser;
}
// Test
export interface RegisterResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl =  `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<AuthResponse | null>(null);

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      credentials,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.storeUser(response.user);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register`,
      userData,
      { withCredentials: true }
    );
  }

  refreshAccessToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/refresh-token`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.storeUser(response.user);
        this.currentUserSubject.next(response.user);
      }),
      catchError(error => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearSession();

    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      error: (error) => console.log('Logout error:', error)
    });
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  handleTokenRefresh(): Observable<AuthResponse> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.refreshAccessToken().pipe(
        tap((response) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.clearSession();
          return throwError(() => err);
        })
      );
    }

    return new Observable(observer => {
      const subscription = this.refreshTokenSubject.subscribe((response) => {
        if (response) {
          observer.next(response);
          observer.complete();
          subscription.unsubscribe();
        }
      });
    });
  }

  private clearSession(): void {
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
  }

  private storeUser(user: AuthUser): void {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  private getUserFromStorage(): AuthUser | null {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) as AuthUser : null;
  }

  private loadUserFromStorage(): void {
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }
}
