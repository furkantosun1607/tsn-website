import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { SocialAuthService, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="logo-area">
          <div class="logo-icon">📰</div>
          <h1>TSN Media</h1>
          <p>Kişiselleştirilmiş haber deneyiminize hoş geldiniz</p>
        </div>

        <div class="signin-area">
          <p class="signin-label">Devam etmek için Google hesabınızla giriş yapın</p>
          <button class="google-btn" (click)="signInWithGoogle()" [disabled]="loading">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="24" height="24">
            {{ loading ? 'Giriş yapılıyor...' : 'Google ile Giriş Yap' }}
          </button>
          <p *ngIf="error" class="error-msg">{{ error }}</p>
        </div>

        <p class="privacy-note">Giriş yaparak kişisel verilerinizin yerel olarak saklanacağını kabul etmiş olursunuz.</p>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loading = false;
  error = '';
  private sub?: Subscription;

  constructor(
    private socialAuth: SocialAuthService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/']);
    }
  }

  signInWithGoogle(): void {
    this.loading = true;
    this.error = '';
    this.socialAuth.signIn(GoogleLoginProvider.PROVIDER_ID).then(socialUser => {
      this.authService.loginWithGoogle(socialUser);
      const user = this.authService.currentUser;
      if (user?.onboardingComplete) {
        this.router.navigate(['/']);
      } else {
        this.router.navigate(['/onboarding']);
      }
    }).catch(err => {
      this.error = 'Giriş yapılamadı. Lütfen tekrar deneyin.';
      console.error(err);
    }).finally(() => {
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
