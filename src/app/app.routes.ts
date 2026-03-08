import { Routes } from '@angular/router';
import { NewsFeed } from './news-feed/news-feed';
import { LoginComponent } from './login/login.component';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
    { path: '', component: NewsFeed },
    { path: 'login', component: LoginComponent },
    { path: 'onboarding', component: OnboardingComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
