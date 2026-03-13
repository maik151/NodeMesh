import { Injectable } from '@angular/core';

import { UserProfile } from '../../../data/models/interfaces/user-profile.interface';
import { DatabaseService } from '../storage/database.service';
import { environment } from '../../../../environments/environment';

// ---------------------------------------------------------------------------
// Local GIS type declarations for OAuth2 Implicit Flow
// ---------------------------------------------------------------------------
interface GisTokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    error?: string;
}

interface GisTokenClient {
    requestAccessToken(overrideConfig?: any): void;
}

interface GisOAuth2 {
    initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: (response: GisTokenResponse) => void;
        error_callback?: (err: any) => void;
    }): GisTokenClient;
}

interface GisWindow {
    google?: {
        accounts?: {
            oauth2?: GisOAuth2;
        };
    };
}

@Injectable({ providedIn: 'root' })
export class AuthService {

    private tokenClient: GisTokenClient | null = null;
    private gisReady = false;
    private pendingResolve: ((user: UserProfile) => void) | null = null;
    private pendingReject: ((err: Error) => void) | null = null;

    constructor(private readonly dbService: DatabaseService) { }

    /**
     * Initializes the Google Identity Services OAuth2 Token Client.
     * Uses the Token Flow (popup) which bypasses One Tap's strict iframe/FedCM CORS issues.
     */
    initializeGis(): void {
        console.group('[AuthService] initializeGis() - Token Flow');
        console.log('Client ID en uso:', environment.googleClientId);

        if (this.gisReady) {
            console.warn('GIS ya estaba inicializado.');
            console.groupEnd();
            return;
        }

        const oauth2 = (globalThis as unknown as GisWindow).google?.accounts?.oauth2;
        if (!oauth2) {
            console.error('window.google.accounts.oauth2 NO disponible. Revisa index.html.');
            console.groupEnd();
            return;
        }

        console.log('Inicializando Token Client (Implicit Flow)...');
        this.tokenClient = oauth2.initTokenClient({
            client_id: environment.googleClientId,
            scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
            callback: (response: GisTokenResponse) => {
                if (response.error) {
                    console.error('[AuthService] Error en callback OAuth:', response.error);
                    this.pendingReject?.(new Error(`Error OAuth: ${response.error}`));
                    this.resetPending();
                    return;
                }

                console.log('[AuthService] Access Token recibido:', response.access_token.slice(0, 15) + '...');
                this.fetchGoogleUserProfile(response.access_token);
            },
            error_callback: (err: any) => {
                console.error('[AuthService] Error al abrir popup:', err);
                this.pendingReject?.(new Error('No se pudo abrir la ventana de Google SignIn.'));
                this.resetPending();
            }
        });

        this.gisReady = true;
        console.log('GIS Token Client listo. gisReady = true');
        console.groupEnd();
    }

    /**
     * Triggers the OAuth2 popup flow.
     */
    async loginWithGoogle(): Promise<UserProfile> {
        console.group('[AuthService] loginWithGoogle()');

        if (!this.gisReady || !this.tokenClient) {
            console.warn('Intentando lazy init de OAuth2 Client...');
            this.initializeGis();
        }

        if (!this.tokenClient) {
            console.groupEnd();
            throw new Error('[AuthService] No se pudo inicializar el cliente GIS. Verifica index.html.');
        }

        console.log('Abriendo popup de Google Authentication...');
        console.groupEnd();

        return new Promise<UserProfile>((resolve, reject) => {
            this.pendingResolve = resolve;
            this.pendingReject = reject;
            this.tokenClient!.requestAccessToken();
        });
    }

    /**
     * Usa el Access Token para obtener el perfil real desde la API de Google
     */
    private async fetchGoogleUserProfile(accessToken: string): Promise<void> {
        try {
            console.log('Solicitando info de usuario a la API de Google...');
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!res.ok) {
                throw new Error(`Google API respondió con status ${res.status}`);
            }

            const data = await res.json();
            console.log('Perfil recibido:', data.email);

            const user: UserProfile = {
                uid: data.sub,
                email: data.email,
                displayName: data.name,
                photoURL: data.picture
            };

            const vaultKey = await this.deriveStorageKey(user.uid);
            await this.dbService.initializeVault(vaultKey);

            sessionStorage.setItem('nodemesh_session', JSON.stringify({
                user,
                token: accessToken,
                expiresAt: Date.now() + 3600 * 1000 // 1 hour approx validity
            }));

            this.pendingResolve?.(user);

        } catch (error) {
            console.error('[AuthService] Falla al obtener perfil:', error);

            if (environment.production) {
                this.pendingReject?.(error as Error);
            } else {
                console.warn('[DEV MODE] Usando perfil MOCK de emergencia');
                const mockUser: UserProfile = { uid: 'mock_123', email: 'dev@local', displayName: 'Dev User' };
                const vKey = await this.deriveStorageKey(mockUser.uid);
                await this.dbService.initializeVault(vKey);
                this.pendingResolve?.(mockUser);
            }
        } finally {
            this.resetPending();
        }
    }

    async deriveStorageKey(uid: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(uid);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return `nodemesh_vault_${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}`;
    }

    /**
     * Checks if a valid session exists in sessionStorage.
     * This fulfills RNF-SEG-01's client-side validation requirement.
     */
    isAuthenticated(): boolean {
        const sessionStr = sessionStorage.getItem('nodemesh_session');
        if (!sessionStr) return false;

        try {
            const session = JSON.parse(sessionStr);
            // Verify if token is theoretically expired (1 hr validity max)
            if (Date.now() > session.expiresAt) {
                this.logout();
                return false;
            }
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Returns the currently logged in UserProfile if available.
     */
    getCurrentUser(): UserProfile | null {
        if (!this.isAuthenticated()) return null;
        try {
            const session = JSON.parse(sessionStorage.getItem('nodemesh_session')!);
            return session.user as UserProfile;
        } catch {
            return null;
        }
    }

    /**
     * Clears the current session and vault connection.
     */
    logout(): void {
        sessionStorage.removeItem('nodemesh_session');
        this.dbService.db?.close();
    }

    private resetPending(): void {
        this.pendingResolve = null;
        this.pendingReject = null;
    }
}
