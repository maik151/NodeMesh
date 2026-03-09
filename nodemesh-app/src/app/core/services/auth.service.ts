import { Injectable } from '@angular/core';

import { UserProfile } from '../../data/models/interfaces/user-profile.interface';
import { DatabaseService } from './database.service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private readonly dbService: DatabaseService) { }

    /**
     * Generates a unique secure database ID based on the user's UID using SHA-256.
     * This ensures user data isolation (Local-First) without exposing the real UID.
     *
     * @param uid The user's unique identifier (e.g., from Google OAuth)
     * @returns A promise that resolves to the derived storage key for the user's vault
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
     * Decodes the payload section of a JWT without verifying the signature.
     * Used to extract user info from the Google ID token (credential).
     * NOTE: Full verification must be done server-side in production.
     *
     * @param token The raw JWT string returned by Google Identity Services
     * @returns The decoded payload object
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
     * Authenticates the user via Google Identity Services (One Tap / GIS).
     * On success:
     *   1. Decodes the Google JWT to extract `sub` (uid), email, and name.
     *   2. Derives a secure vault key from the uid using SHA-256.
     *   3. Initializes the user's private IndexedDB vault via DatabaseService.
     *
     * @returns A promise that resolves to the authenticated UserProfile
     */
    async loginWithGoogle(): Promise<UserProfile> {
        return new Promise((resolve, reject) => {
            // Safety check: GIS SDK must be loaded
            if (!window.google?.accounts?.id) {
                reject(new Error('[AuthService] Google Identity Services SDK no está disponible. Verifica que el script de GIS esté cargado en index.html.'));
                return;
            }

            // Initialize GIS with our Client ID from the environment
            window.google.accounts.id.initialize({
                client_id: environment.googleClientId,
                callback: async (response: google.accounts.id.CredentialResponse) => {
                    try {
                        // Decode the JWT to get user info
                        const payload = this.decodeJwtPayload(response.credential);

                        const user: UserProfile = {
                            uid: payload.sub,
                            email: payload.email,
                            displayName: payload.name,
                        };

                        // Derive vault key + initialize IndexedDB vault
                        const vaultKey = await this.deriveStorageKey(user.uid);
                        this.dbService.initializeVault(vaultKey);

                        resolve(user);
                    } catch (err) {
                        reject(err);
                    }
                },
                error_callback: (error: google.accounts.id.NotificationReason | undefined) => {
                    reject(new Error(`[AuthService] Google Sign-In falló: ${error ?? 'unknown'}`));
                }
            });

            // Trigger the One Tap popup
            window.google.accounts.id.prompt();
        });
    }
}
