import { Injectable } from '@angular/core';

import { UserProfile } from '../../data/models/interfaces/user-profile.interface';
import { DatabaseService } from './database.service';
import { environment } from '../../../environments/environment';

// ---------------------------------------------------------------------------
// Local type declarations for Google Identity Services SDK.
// These mirror @types/google.accounts so the build works even if the tsconfig
// `types` array changes. We keep them minimal and scoped to what we need.
// ---------------------------------------------------------------------------
interface GisCredentialResponse {
    credential: string;
}

interface GisNotificationReason {
    getMomentType(): string;
}

interface GisAccountsId {
    initialize(params: {
        client_id: string;
        callback: (response: GisCredentialResponse) => void;
        error_callback?: (reason: GisNotificationReason) => void;
    }): void;
    prompt(): void;
    cancel(): void;
}

interface GisWindow {
    google?: {
        accounts?: {
            id?: GisAccountsId;
        };
    };
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private readonly dbService: DatabaseService) { }

    /**
     * Generates a unique secure database ID based on the user's UID using SHA-256.
     * Guarantees Local-First data isolation without exposing the real UID.
     */
    async deriveStorageKey(uid: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(uid);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);

        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return `nodemesh_vault_${hashHex}`;
    }

    /**
     * Decodes the payload section of a Google JWT without verifying the signature.
     * Full server-side verification is required in production.
     */
    private decodeJwtPayload(token: string): { sub: string; email: string; name: string; picture?: string } {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    }

    /**
     * Authenticates the user via Google Identity Services (One Tap).
     * On success:
     *   1. Decodes the Google JWT to extract `sub` (uid), email and name.
     *   2. Derives a secure vault key from the uid using SHA-256.
     *   3. Initializes the user's private IndexedDB vault via DatabaseService.
     */
    async loginWithGoogle(): Promise<UserProfile> {
        return new Promise((resolve, reject) => {
            // Use our typed window interface to avoid TS2339 errors
            const gisWindow = window as unknown as GisWindow;
            const gisId = gisWindow.google?.accounts?.id;

            if (!gisId) {
                reject(new Error(
                    '[AuthService] Google Identity Services SDK no está disponible. ' +
                    'Verifica que el script de GIS esté cargado en index.html.'
                ));
                return;
            }

            gisId.initialize({
                client_id: environment.googleClientId,
                callback: async (response: GisCredentialResponse) => {
                    try {
                        const payload = this.decodeJwtPayload(response.credential);

                        const user: UserProfile = {
                            uid: payload.sub,
                            email: payload.email,
                            displayName: payload.name,
                        };

                        const vaultKey = await this.deriveStorageKey(user.uid);
                        this.dbService.initializeVault(vaultKey);

                        resolve(user);
                    } catch (err) {
                        reject(err);
                    }
                },
                error_callback: (reason: GisNotificationReason) => {
                    reject(new Error(`[AuthService] Google Sign-In falló: ${reason?.getMomentType() ?? 'unknown'}`));
                }
            });

            // Trigger Google One Tap popup
            gisId.prompt();
        });
    }
}
