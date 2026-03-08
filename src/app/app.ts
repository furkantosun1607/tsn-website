import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <nav class="navbar-container">
      <div class="brand"><a routerLink="/">TSN Media</a></div>
      <div class="nav-links">
        <ng-container *ngIf="auth.currentUser$ | async as user; else loginLink">
            <span class="greeting">Hi, {{ user.first_name }} 👋</span>
            <a routerLink="/onboarding">Preferences</a>
            <button class="logout-btn" (click)="logout()">Logout</button>
        </ng-container>
        <ng-template #loginLink>
            <a routerLink="/login" class="auth-btn">Sign In</a>
        </ng-template>
      </div>
    </nav>
    <router-outlet></router-outlet>
  `,
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'frontend';
  auth = inject(AuthService);

  logout() {
    this.auth.logout();
  }
}

