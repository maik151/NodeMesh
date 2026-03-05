import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

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
});