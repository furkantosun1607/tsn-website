import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="login-container">
      <h2>Welcome to News Aggregator</h2>
      <p>Please sign in to view your personalized feed.</p>
      <div id="google-btn"></div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      text-align: center;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin: 2rem auto;
      max-width: 500px;
      padding: 2rem;
    }
    h2 { margin-bottom: 1rem; color: #333; }
    p { margin-bottom: 2rem; color: #666; }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  private scriptLoadInterval: any;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated) {
      this.redirectHome();
      return;
    }

    this.initializeGoogleSignIn();
  }

  ngOnDestroy(): void {
    if (this.scriptLoadInterval) {
      clearInterval(this.scriptLoadInterval);
    }
  }

  /**
   * Waits for the Google GSI script to load and then renders the button.
   */
  private initializeGoogleSignIn(): void {
    if (this.isGoogleLoaded()) {
      this.renderGoogleButton();
    } else {
      // Re-check periodically if the async script hasn't downloaded yet.
      this.scriptLoadInterval = setInterval(() => {
        if (this.isGoogleLoaded()) {
          clearInterval(this.scriptLoadInterval);
          this.renderGoogleButton();
        }
      }, 100);
    }
  }

  private isGoogleLoaded(): boolean {
    return typeof google !== 'undefined' && google.accounts && google.accounts.id;
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
      { theme: 'outline', size: 'large' }
    );
  }

  private handleCredentialResponse(response: any): void {
    this.ngZone.run(() => {
      this.executeLogin(response.credential);
    });
  }

  private executeLogin(token: string): void {
    this.authService.loginWithGoogle(token).subscribe({
      next: () => this.redirectHome(),
      error: (err) => this.handleLoginError(err)
    });
  }

  private redirectHome(): void {
    this.router.navigate(['/']);
  }

  private handleLoginError(err: any): void {
    console.error('Google login failed:', err);
    alert('Login failed. Please verify your Google credentials and try again.');
  }
}
