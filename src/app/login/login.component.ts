import { Component, OnInit, NgZone, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../environments/environment';

declare const google: any;

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
          <div id="google-btn"></div>
        </div>
        <p class="privacy-note">Giriş yaparak kişisel verilerinizin yerel olarak saklanacağını kabul etmiş olursunuz.</p>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    if (this.authService.isAuthenticated) {
      this.router.navigate(['/']);
      return;
    }

    // Wait for Google GIS script to load
    this.waitForGoogle().then(() => this.renderGoogleButton());
  }

  private waitForGoogle(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof google !== 'undefined' && google.accounts) {
        resolve();
        return;
      }
      const interval = setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  private renderGoogleButton(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: this.handleCredentialResponse.bind(this),
      ux_mode: 'popup',
      use_fedcm_for_prompt: false
    });

    google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      { theme: 'outline', size: 'large', text: 'signin_with', locale: 'tr' }
    );
  }

  private handleCredentialResponse(response: any): void {
    this.ngZone.run(() => {
      this.authService.loginWithGoogleCredential(response.credential);
      const user = this.authService.currentUser;
      if (user?.onboardingComplete) {
        this.router.navigate(['/']);
      } else {
        this.router.navigate(['/onboarding']);
      }
    });
  }
}
