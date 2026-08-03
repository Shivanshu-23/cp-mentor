import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  email: string;
  role: string;
}

// localStorage doesn't exist on the server — every access below is guarded by
// isBrowser so this service (injected eagerly in AppComponent, i.e. on every
// route) doesn't throw during SSR/prerendering.
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'cp_mentor_token';
  private readonly USER_KEY = 'cp_mentor_user';
  private readonly API = '/api/v1/auth';
  private readonly isBrowser: boolean;

  private loggedIn$: BehaviorSubject<boolean>;

  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loggedIn$ = new BehaviorSubject<boolean>(this.isLoggedIn());
  }

  login(email: string, password: string, rememberMe = false): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, { email, password, rememberMe }).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, { username, email, password }).pipe(
      tap(res => this.saveSession(res))
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.loggedIn$.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.TOKEN_KEY) : null;
  }

  getUser(): AuthResponse | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isLoggedIn$() {
    return this.loggedIn$.asObservable();
  }

  private saveSession(res: AuthResponse): void {
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, res.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(res));
    }
    this.loggedIn$.next(true);
  }
}
