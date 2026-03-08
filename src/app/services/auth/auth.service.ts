import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SocialUser } from '@abacritt/angularx-social-login';

export interface AppUser {
  email: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  idToken: string;
  // filled in after onboarding
  surname?: string;
  dateOfBirth?: string;
  categories?: number[];
  onboardingComplete?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_KEY = 'tsn_user';

  private currentUserSubject = new BehaviorSubject<AppUser | null>(this.loadFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  get currentUser(): AppUser | null {
    return this.currentUserSubject.value;
  }

  loginWithGoogle(socialUser: SocialUser): void {
    const user: AppUser = {
      email: socialUser.email ?? '',
      firstName: socialUser.firstName ?? '',
      lastName: socialUser.lastName ?? '',
      photoUrl: socialUser.photoUrl ?? '',
      idToken: socialUser.idToken ?? '',
      onboardingComplete: false
    };
    this.saveToStorage(user);
    this.currentUserSubject.next(user);
  }

  completeOnboarding(data: { surname: string; dateOfBirth: string; categories: number[] }): void {
    const user = this.currentUserSubject.value;
    if (!user) return;
    const updated: AppUser = {
      ...user,
      surname: data.surname,
      dateOfBirth: data.dateOfBirth,
      categories: data.categories,
      onboardingComplete: true
    };
    this.saveToStorage(updated);
    this.currentUserSubject.next(updated);
  }

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  private loadFromStorage(): AppUser | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(user: AppUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}
