import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const isRestored = await authService.restoreSession();
    if (isRestored) {
        return true;
    }

    return router.parseUrl('/login');
};
