import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="onboarding-container">
      <h2>Personalize Your Feed</h2>
      <form (submit)="savePreferences()">
        <div class="form-group">
          <label for="dob">Date of Birth</label>
          <input type="date" id="dob" [(ngModel)]="dateOfBirth" name="dob" required>
        </div>

        <div class="categories-section">
          <h3>Select Categories You Follow</h3>
          <div *ngIf="categories.length === 0" class="loading">Loading categories...</div>
          <div class="categories-grid">
            <div *ngFor="let cat of categories" class="category-item">
              <label>
                <input type="checkbox" 
                       [checked]="selectedCategories.has(cat.id)"
                       (change)="toggleCategory(cat.id)">
                <span>{{ cat.name }}</span>
              </label>
            </div>
          </div>
        </div>

        <button type="submit" class="submit-btn" [disabled]="submitting">
          {{ submitting ? 'Saving...' : 'Save Preferences' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .onboarding-container {
      background: white;
      padding: 3rem;
      border-radius: var(--border-radius, 16px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      max-width: 650px;
      margin: 3rem auto;
      border: 1px solid rgba(0,0,0,0.05);
    }
    h2 { color: var(--text-primary, #111827); margin-bottom: 2rem; text-align: center; font-weight: 800; font-size: 2rem; }
    h3 { color: var(--text-secondary, #4b5563); margin: 2rem 0 1.5rem; font-size: 1.2rem; font-weight: 600; }
    
    .form-group { margin-bottom: 2rem; }
    .form-group label { display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-secondary, #4b5563); }
    .form-group input { width: 100%; padding: 0.85rem 1rem; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; outline: none; }
    .form-group input:focus { border-color: var(--primary-color, #3b82f6); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1rem;
      margin-bottom: 2.5rem;
    }
    .category-item label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.85rem;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.2s ease;
      font-weight: 500;
      color: var(--text-secondary, #4b5563);
      user-select: none;
    }
    .category-item label:hover { 
      background-color: #f9fafb; 
      border-color: #d1d5db;
    }
    
    /* Styling checkbox visually */
    .category-item input[type="checkbox"] {
      width: 1.1rem;
      height: 1.1rem;
      accent-color: var(--primary-color, #3b82f6);
      cursor: pointer;
    }

    /* Selected state */
    .category-item label:has(input:checked) {
      background-color: rgba(59, 130, 246, 0.05);
      border-color: var(--primary-color, #3b82f6);
      color: var(--primary-color, #3b82f6);
    }
    
    .submit-btn {
      width: 100%;
      padding: 1.1rem;
      background-color: var(--primary-color, #3b82f6);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1.15rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
    }
    .submit-btn:hover:not(:disabled) { 
      background-color: var(--primary-hover, #2563eb); 
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }
    .submit-btn:disabled { background-color: #93c5fd; cursor: not-allowed; box-shadow: none; transform: none; }
    
    .loading { text-align: center; padding: 2rem; color: #6b7280; font-style: italic; }
  `]
})
export class OnboardingComponent implements OnInit {
  categories: any[] = [];
  selectedCategories = new Set<number>();
  dateOfBirth: string = '';
  submitting = false;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchCategories();
    this.auth.currentUser$.subscribe(user => {
      if (user) {
        if (user.date_of_birth) this.dateOfBirth = user.date_of_birth;
        if (user.categories) {
          user.categories.forEach(c => this.selectedCategories.add(c.id));
        }
      }
    });
  }

  fetchCategories() {
    this.http.get<any[]>(`${environment.apiUrl}/categories`).subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Failed to fetch categories:', err)
    });
  }

  toggleCategory(id: number) {
    if (this.selectedCategories.has(id)) {
      this.selectedCategories.delete(id);
    } else {
      this.selectedCategories.add(id);
    }
  }

  savePreferences() {
    if (!this.dateOfBirth) return;
    this.submitting = true;
    
    const payload = {
      date_of_birth: this.dateOfBirth,
      category_ids: Array.from(this.selectedCategories)
    };

    this.auth.updateOnboarding(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/']); // Go to personalized feed
      },
      error: (err) => {
        console.error('Failed to save preferences', err);
        this.submitting = false;
        alert('Failed to save preferences');
      }
    });
  }
}
