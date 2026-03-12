import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DatabaseService } from '../services/storage/database.service';

export const byokGuard: CanActivateFn = async (route, state) => {
    const dbService = inject(DatabaseService);
    const router = inject(Router);

    try {
        const key = await dbService.getApiKey('gemini');
        if (key) {
            return true;
        }
    } catch (error) {
        // Database isn't initialized, or other local error
        console.error('[ByokGuard] No se pudo leer la Bóveda.', error);
    }

    // Si no hay llave, forzar a configurar el BYOK
    return router.parseUrl('/setup');
};
