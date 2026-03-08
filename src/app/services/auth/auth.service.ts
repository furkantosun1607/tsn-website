import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth?: string;
  categories?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'access_token';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  loginWithGoogle(credential: string): Observable<any> {
    return this.http.post<{access_token: string}>(`${this.apiUrl}/auth/google`, { token: credential }).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.access_token);
        this.loadUser(); // Fetch profile after login
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  loadUser(): void {
    if (this.isAuthenticated) {
      this.http.get<User>(`${this.apiUrl}/user/me`).subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.logout() // Invalid token
      });
    }
  }

  updateOnboarding(data: { date_of_birth: string, category_ids: number[] }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/user/onboarding`, data).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }
}
