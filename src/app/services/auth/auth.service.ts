import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface AppUser {
  email: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  surname?: string;
  dateOfBirth?: string;
  onboardingComplete?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_KEY = 'tsn_user';
  private isBrowser: boolean;

  private currentUserSubject: BehaviorSubject<AppUser | null>;
  public currentUser$;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.currentUserSubject = new BehaviorSubject<AppUser | null>(this.loadFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  get currentUser(): AppUser | null {
    return this.currentUserSubject.value;
  }

  loginWithGoogleCredential(credential: string): void {
    // Decode the JWT payload (base64) to get user info
    const payload = JSON.parse(atob(credential.split('.')[1]));
    const user: AppUser = {
      email: payload.email || '',
      firstName: payload.given_name || '',
      lastName: payload.family_name || '',
      photoUrl: payload.picture || '',
      onboardingComplete: false
    };
    this.saveToStorage(user);
    this.currentUserSubject.next(user);
  }

  completeOnboarding(data: { surname: string; dateOfBirth: string }): void {
    const user = this.currentUserSubject.value;
    if (!user) return;
    const updated: AppUser = {
      ...user,
      surname: data.surname,
      dateOfBirth: data.dateOfBirth,
      onboardingComplete: true
    };
    this.saveToStorage(updated);
    this.currentUserSubject.next(updated);
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
  }

  private loadFromStorage(): AppUser | null {
    if (!this.isBrowser) return null;
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(user: AppUser): void {
    if (this.isBrowser) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }
}
