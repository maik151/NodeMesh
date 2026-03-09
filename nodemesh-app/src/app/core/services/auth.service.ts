import { Injectable } from '@angular/core';

import { UserProfile } from '../../data/models/interfaces/user-profile.interface';
import { DatabaseService } from './database.service';
import { environment } from '../../../environments/environment';

// ---------------------------------------------------------------------------
// Local GIS type declarations (avoids dependency on @types/google.accounts
// being properly resolved by the TS compiler).
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

    /** Resolved once the GIS SDK is ready and initialized */
    private gisReady = false;

    /** Pending resolve/reject from an in-flight loginWithGoogle() call */
    private pendingResolve: ((user: UserProfile) => void) | null = null;
    private pendingReject: ((err: Error) => void) | null = null;

    constructor(private readonly dbService: DatabaseService) { }

    /**
     * Initializes the Google Identity Services SDK.
     * Must be called ONCE after the GIS script has loaded (e.g. from ngOnInit).
     * Calling it multiple times is a no-op if already initialized.
     */
    initializeGis(): void {
        if (this.gisReady) return;

        const gisId = (window as unknown as GisWindow).google?.accounts?.id;
        if (!gisId) {
            // Script not yet loaded — will initialize on first prompt attempt
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

                    this.pendingResolve?.(user);
                } catch (err) {
                    this.pendingReject?.(err as Error);
                } finally {
                    this.pendingResolve = null;
                    this.pendingReject = null;
                }
            },
            error_callback: (reason: GisNotificationReason) => {
                this.pendingReject?.(
                    new Error(`[AuthService] Google Sign-In falló: ${reason?.getMomentType?.() ?? 'unknown'}`)
                );
                this.pendingResolve = null;
                this.pendingReject = null;
            }
        });

        this.gisReady = true;
    }

    /**
     * Triggers the Google One Tap popup. Requires initializeGis() to have
     * been called first (or will attempt lazy init).
     */
    async loginWithGoogle(): Promise<UserProfile> {
        // Lazy init in case initializeGis() wasn't called yet
        if (!this.gisReady) {
            this.initializeGis();
        }

        const gisId = (window as unknown as GisWindow).google?.accounts?.id;
        if (!gisId) {
            throw new Error(
                '[AuthService] Google Identity Services SDK no disponible. ' +
                'Verifica el script en index.html y que el SDK esté cargado.'
            );
        }

        return new Promise<UserProfile>((resolve, reject) => {
            this.pendingResolve = resolve;
            this.pendingReject = reject;
            gisId.prompt();
        });
    }

    /**
     * Derives a secure vault key from a UID using SHA-256.
     */
    async deriveStorageKey(uid: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(uid);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return `nodemesh_vault_${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}`;
    }

    /**
     * Decodes the payload of a Google JWT (client-side only, no signature verification).
     */
    private decodeJwtPayload(token: string): { sub: string; email: string; name: string } {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(
            decodeURIComponent(
                atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
            )
        );
    }
}
