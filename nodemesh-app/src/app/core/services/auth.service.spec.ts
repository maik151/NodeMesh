import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { DatabaseService } from './database.service';

// ================================================================
// Mock the Google Identity Services OAuth2 SDK on the window object
// so tests run headlessly without needing the real browser popup.
// ================================================================
const MOCK_UID = 'google_oauth_mock_uid_12345';
const MOCK_EMAIL = 'user@example.com';
const MOCK_NAME = 'Mock Google User';
const MOCK_ACCESS_TOKEN = 'ya29.mock_access_token_abc123';

describe('AuthService (TDD - AUT-01) - Refactor Implicit Flow', () => {
    let service: AuthService;
    let mockCallback: ((resp: { access_token: string }) => void) | null = null;
    let globalFetchBackup: typeof fetch;

    beforeEach(() => {
        // Mock global fetch para interceptar la llamada a userinfo
        globalFetchBackup = global.fetch;
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                sub: MOCK_UID,
                email: MOCK_EMAIL,
                name: MOCK_NAME
            })
        });

        // Instalar mock para window.google.accounts.oauth2.initTokenClient
        (window as any).google = {
            accounts: {
                oauth2: {
                    initTokenClient: vi.fn((opts: { callback: (r: { access_token: string }) => void }) => {
                        mockCallback = opts.callback;
                        return {
                            requestAccessToken: vi.fn(() => {
                                // Simular que Google llama al callback instantáneamente con el token
                                if (mockCallback) {
                                    mockCallback({ access_token: MOCK_ACCESS_TOKEN });
                                }
                            })
                        };
                    })
                }
            }
        };

        TestBed.configureTestingModule({});
        service = TestBed.inject(AuthService);
    });

    afterEach(() => {
        // Clean up mocks
        delete (window as any).google;
        mockCallback = null;
        global.fetch = globalFetchBackup;
    });

    // ---- PRUEBA 1: Generación de Identidad Local (con Hash) ----
    it('debe derivar un ID de base de datos único basado en el hash del UID', async () => {
        const mockUid = 'user_abc_123';
        const dbName = await service.deriveStorageKey(mockUid);

        expect(dbName).toContain('nodemesh_vault_');
        expect(dbName).not.toContain(mockUid);
        expect(dbName.length).toBe('nodemesh_vault_'.length + 64);
    });

    // ---- PRUEBA 2: Aislamiento (Usuario B vs Usuario A) ----
    it('debe garantizar que dos usuarios tengan llaves de almacenamiento distintas', async () => {
        const keyA = await service.deriveStorageKey('google_789');
        const keyB = await service.deriveStorageKey('google_000');

        expect(keyA).not.toEqual(keyB);
    });

    // ---- PRUEBA 3: Determinismo del Hash ----
    it('debe generar siempre el mismo hash para el mismo UID', async () => {
        const key1 = await service.deriveStorageKey('test_user_deterministic');
        const key2 = await service.deriveStorageKey('test_user_deterministic');

        expect(key1).toEqual(key2);
    });

    // ---- PRUEBA 4: Inicio de Sesión con Google (OAuth 2.0 Implicit Flow) ----
    it('debe conectar con Google OAuth y retornar un usuario con UID válido', async () => {
        const user = await service.loginWithGoogle();

        expect(user).toBeDefined();
        expect(user.uid).toBe(MOCK_UID);
        expect(user.email).toBe(MOCK_EMAIL);
    });

    // ---- PRUEBA 5: Creación de Bóveda en Login (Integración) ----
    it('debe inicializar la bóveda en DatabaseService tras un login exitoso', async () => {
        const dbService = TestBed.inject(DatabaseService) as any;
        const initSpy = vi.spyOn(dbService, 'initializeVault');

        const user = await service.loginWithGoogle();
        const expectedKey = await service.deriveStorageKey(user.uid);

        expect(initSpy).toHaveBeenCalledWith(expectedKey);
    });

    // ---- PRUEBA 6: GIS SDK inicializó con el Client ID correcto ----
    it('debe inicializar el SDK de Google con el client_id del environment', async () => {
        await service.loginWithGoogle();

        const tokenClientInit = (window as any).google.accounts.oauth2.initTokenClient;
        expect(tokenClientInit).toHaveBeenCalledWith(
            expect.objectContaining({
                client_id: expect.stringContaining('.apps.googleusercontent.com')
            })
        );
    });
});