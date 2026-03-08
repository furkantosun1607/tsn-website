import { Routes } from '@angular/router';
import { NewsFeed } from './news-feed/news-feed';
import { LoginComponent } from './login/login.component';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { Router } from '@angular/router';

// Simple guard
const authGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (!authService.isAuthenticated) {
        return router.parseUrl('/login');
    }
    return true;
};

export const routes: Routes = [
    { path: '', component: NewsFeed },
    { path: 'login', component: LoginComponent },
    { path: 'onboarding', component: OnboardingComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
