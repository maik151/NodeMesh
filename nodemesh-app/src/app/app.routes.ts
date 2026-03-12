import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { byokGuard } from './core/guards/byok.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'setup',
        canActivate: [authGuard],
        loadComponent: () => import('./features/onboarding/pages/byok-setup/byok-setup.component').then(m => m.ByokSetupComponent)
    },
    {
        path: 'simulador',
        canActivate: [authGuard],
        loadComponent: () => import('./features/pipeline/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
