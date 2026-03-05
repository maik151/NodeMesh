import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService (TDD - AUT-01)', () => {
    let service: AuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AuthService);
    });

    // PRUEBA 1: Generación de Identidad Local
    it('debe derivar un ID de base de datos único basado en el UID de Google', () => {
        const mockUid = 'user_abc_123';
        // El método todavía no existe, por eso fallará (RED PHASE)
        const dbName = service.deriveStorageKey(mockUid);

        expect(dbName).toBe('nodemesh_vault_user_abc_123');
    });

    // PRUEBA 2: Aislamiento (Usuario B vs Usuario A)
    it('debe garantizar que dos usuarios tengan llaves de almacenamiento distintas', () => {
        const keyA = service.deriveStorageKey('google_789');
        const keyB = service.deriveStorageKey('google_000');

        expect(keyA).not.toEqual(keyB);
    });
});