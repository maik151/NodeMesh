import { Injectable } from '@angular/core';

import { UserProfile } from '../../data/models/interfaces/user-profile.interface';
import { DatabaseService } from './database.service';
import { environment } from '../../../environments/environment';

interface GisCredentialResponse { credential: string; }
interface GisNotificationReason { getMomentType(): string; }
interface GisAccountsId {
    initialize(params: {
        client_id: string;
        callback: (response: GisCredentialResponse) => void;
        error_callback?: (reason: GisNotificationReason) => void;
    }): void;
    prompt(momentListener?: (notification: any) => void): void;
    cancel(): void;
}
interface GisWindow { google?: { accounts?: { id?: GisAccountsId; }; }; }

@Injectable({ providedIn: 'root' })
export class AuthService {

    private gisReady = false;
    private pendingResolve: ((user: UserProfile) => void) | null = null;
    private pendingReject: ((err: Error) => void) | null = null;

    constructor(private readonly dbService: DatabaseService) { }

    initializeGis(): void {
        // --- DEBUG ---
        console.group('[AuthService] initializeGis()');
        console.log('🔑 Client ID en uso:', environment.googleClientId);
        console.log('🌐 Origen del navegador:', window.location.origin);
        console.log('📦 window.google disponible:', !!(window as unknown as GisWindow).google);
        console.log('🔄 gisReady ya era:', this.gisReady);

        if (this.gisReady) {
            console.warn('⚠️  GIS ya estaba inicializado. Saliendo sin reinicializar.');
            console.groupEnd();
            return;
        }

        const gisId = (window as unknown as GisWindow).google?.accounts?.id;
        if (!gisId) {
            console.error('❌ window.google.accounts.id NO está disponible. El script GIS aún no cargó.');
            console.groupEnd();
            return;
        }

        console.log('✅ window.google.accounts.id disponible. Llamando initialize()...');
        gisId.initialize({
            client_id: environment.googleClientId,
            callback: async (response: GisCredentialResponse) => {
                console.log('[AuthService] 🎉 Callback de Google recibido. Credential (primeros 30 chars):', response.credential?.slice(0, 30));
                try {
                    const payload = this.decodeJwtPayload(response.credential);
                    console.log('[AuthService] 👤 Payload decodificado:', payload);
                    const user: UserProfile = { uid: payload.sub, email: payload.email, displayName: payload.name };
                    const vaultKey = await this.deriveStorageKey(user.uid);
                    this.dbService.initializeVault(vaultKey);
                    this.pendingResolve?.(user);
                } catch (err) {
                    console.error('[AuthService] ❌ Error procesando credential:', err);
                    this.pendingReject?.(err as Error);
                } finally {
                    this.pendingResolve = null;
                    this.pendingReject = null;
                }
            },
            error_callback: (reason: GisNotificationReason) => {
                const msg = reason?.getMomentType?.() ?? 'unknown';
                console.error('[AuthService] ❌ error_callback de GIS:', msg);
                this.pendingReject?.(new Error(`[AuthService] Google Sign-In falló: ${msg}`));
                this.pendingResolve = null;
                this.pendingReject = null;
            }
        });

        this.gisReady = true;
        console.log('✅ GIS inicializado correctamente. gisReady = true');
        console.groupEnd();
    }

    async loginWithGoogle(): Promise<UserProfile> {
        // --- DEBUG ---
        console.group('[AuthService] loginWithGoogle()');
        console.log('🔑 Client ID:', environment.googleClientId);
        console.log('🌐 Origen:', window.location.origin);
        console.log('🔄 gisReady:', this.gisReady);

        if (!this.gisReady) {
            console.warn('⚠️  gisReady era false. Intentando lazy init...');
            this.initializeGis();
        }

        const gisId = (window as unknown as GisWindow).google?.accounts?.id;
        if (!gisId) {
            console.error('❌ gisId no disponible antes de prompt()');
            console.groupEnd();
            throw new Error('[AuthService] Google Identity Services SDK no disponible.');
        }

        console.log('📣 Llamando gisId.prompt()...');
        console.groupEnd();

        return new Promise<UserProfile>((resolve, reject) => {
            this.pendingResolve = resolve;
            this.pendingReject = reject;

            // Pass a notification callback to prompt() to detect if the popup fails
            gisId.prompt((notification: any) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    const reason = notification.getNotDisplayedReason?.() || notification.getSkippedReason?.() || 'unknown_reason';
                    console.warn(`[AuthService] El popup de Google One Tap no se mostró: ${reason}`);

                    if (!environment.production) {
                        console.info('🛠️ [DEV MODE] GIS falló (probablemente por propagación de CORS/Adblocker). Usando Fallback MOCK para continuar.');
                        const mockUser: UserProfile = {
                            uid: 'mock_dev_uid_123',
                            email: 'dev@localhost.test',
                            displayName: 'Developer Fallback'
                        };

                        this.deriveStorageKey(mockUser.uid).then(vaultKey => {
                            this.dbService.initializeVault(vaultKey);
                            resolve(mockUser);
                        }).catch(reject);
                    } else {
                        reject(new Error(`No se pudo mostrar el inicio de sesión de Google (${reason}).`));
                    }
                }
            });
        });
    }

    async deriveStorageKey(uid: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(uid);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return `nodemesh_vault_${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}`;
    }

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
