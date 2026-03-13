import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
// byokGuard removed as it was unused

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
        path: 'center',
        canActivate: [authGuard],
        loadComponent: () => import('./features/command-center/pages/command-center/command-center.component').then(m => m.CommandCenterComponent)
    },
    {
        path: 'vault',
        canActivate: [authGuard],
        loadComponent: () => import('./features/vault/pages/vault/vault.component').then(m => m.VaultComponent)
    },
    {
        path: 'stats',
        canActivate: [authGuard],
        loadComponent: () => import('./features/stats/pages/stats/stats.component').then(m => m.StatsComponent)
    },
    {
        path: 'docs',
        canActivate: [authGuard],
        loadComponent: () => import('./features/docs/pages/docs/docs.component').then(m => m.DocsComponent)
    },
    {
        path: 'settings',
        canActivate: [authGuard],
        loadComponent: () => import('./features/settings/pages/settings/settings.component').then(m => m.SettingsComponent)
    },
    {
        path: 'simulador',
        canActivate: [authGuard],
        loadComponent: () => import('./features/pipeline/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'center' }
];
