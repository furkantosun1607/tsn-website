import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [AuthService],
  template: `
    <div class="onboarding-wrapper">
      <div class="onboarding-card">
        <div class="header">
          <div class="avatar" *ngIf="photoUrl">
            <img [src]="photoUrl" alt="Profil fotoğrafı">
          </div>
          <h2>Merhaba, {{ firstName }}! 👋</h2>
          <p>Sizi daha iyi tanımak için birkaç bilgiye ihtiyacımız var.</p>
        </div>

        <form (submit)="savePreferences($event)">
          <div class="form-group">
            <label for="surname">Soyad</label>
            <input
              type="text"
              id="surname"
              [(ngModel)]="surname"
              name="surname"
              placeholder="Soyadınızı girin"
              required>
          </div>

          <div class="form-group">
            <label for="dob">Doğum Tarihi</label>
            <input
              type="date"
              id="dob"
              [(ngModel)]="dateOfBirth"
              name="dob"
              required>
          </div>

          <button
            type="submit"
            class="submit-btn"
            [disabled]="!surname || !dateOfBirth || submitting">
            {{ submitting ? 'Kaydediliyor...' : 'Devam Et →' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .onboarding-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }
    .onboarding-card {
      background: white;
      border-radius: 24px;
      padding: 3rem 2.5rem;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.25);
    }
    .header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .avatar img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 1rem;
      border: 3px solid #667eea;
    }
    h2 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #1a1a2e;
      margin: 0 0 0.5rem;
    }
    .header p {
      color: #6b7280;
      font-size: 0.95rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #374151;
      font-size: 0.9rem;
    }
    .form-group input {
      width: 100%;
      padding: 0.85rem 1rem;
      border: 1.5px solid #e5e7eb;
      border-radius: 12px;
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
      box-sizing: border-box;
    }
    .form-group input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
    }
    .submit-btn {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.05rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 0.5rem;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `]
})
export class OnboardingComponent implements OnInit {
  firstName = '';
  photoUrl = '';
  surname = '';
  dateOfBirth = '';
  submitting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.firstName = user.firstName;
    this.photoUrl = user.photoUrl;
    if (user.surname) this.surname = user.surname;
    if (user.dateOfBirth) this.dateOfBirth = user.dateOfBirth;
  }

  savePreferences(event: Event): void {
    event.preventDefault();
    if (!this.surname || !this.dateOfBirth) return;

    this.submitting = true;
    this.authService.completeOnboarding({
      surname: this.surname,
      dateOfBirth: this.dateOfBirth,
      categories: []
    });
    this.router.navigate(['/']);
  }
}
