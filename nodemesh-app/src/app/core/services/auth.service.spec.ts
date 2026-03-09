import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { DatabaseService } from './database.service';

describe('AuthService (TDD - AUT-01) - Refactor', () => {
    let service: AuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AuthService);
    });

    // PRUEBA 1: Generación de Identidad Local (con Hash)
    it('debe derivar un ID de base de datos único basado en el hash del UID', async () => {
        const mockUid = 'user_abc_123';
        const dbName = await service.deriveStorageKey(mockUid);

        // Verificamos que tenga el prefijo de la bóveda
        expect(dbName).toContain('nodemesh_vault_');
        // Verificamos que ya NO exponga el UID original en texto plano
        expect(dbName).not.toContain(mockUid);
        // Verificamos que el hash tenga una longitud adecuada (SHA-256 en hex son 64 caracteres)
        expect(dbName.length).toBe('nodemesh_vault_'.length + 64);
    });

    // PRUEBA 2: Aislamiento (Usuario B vs Usuario A)
    it('debe garantizar que dos usuarios tengan llaves de almacenamiento distintas', async () => {
        const keyA = await service.deriveStorageKey('google_789');
        const keyB = await service.deriveStorageKey('google_000');

        expect(keyA).not.toEqual(keyB);
    });

    // PRUEBA 3: Determinismo del Hash
    it('debe generar siempre el mismo hash para el mismo UID', async () => {
        const key1 = await service.deriveStorageKey('test_user_deterministic');
        const key2 = await service.deriveStorageKey('test_user_deterministic');

        expect(key1).toEqual(key2);
    });

    // PRUEBA 4: Inicio de Sesión con Google (OAuth 2.0)
    it('debe conectar con Google OAuth y retornar un usuario con UID válido', async () => {
        // Ejecutamos el método (actualmente no existe, por ende la prueba fallará - RED phase)
        const user = await (service as any).loginWithGoogle();

        // Validaciones del comportamiento esperado
        expect(user).toBeDefined();
        expect(user.uid).toBeTruthy();
        expect(typeof user.uid).toBe('string');
        // El email es un dato común de OAuth
        expect(user.email).toBeTruthy();
    });

    // PRUEBA 5: Creación de Bóveda en Login (Integración)
    it('debe inicializar la bóveda en DatabaseService tras un login exitoso', async () => {
        const dbService = TestBed.inject(DatabaseService) as any;
        // Using vitest string spy
        const initSpy = vi.spyOn(dbService, 'initializeVault');

        const user = await service.loginWithGoogle();
        const expectedKey = await service.deriveStorageKey(user.uid);

        expect(initSpy).toHaveBeenCalledWith(expectedKey);
    });
});