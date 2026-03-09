import 'fake-indexeddb/auto';
import { TestBed } from '@angular/core/testing';
import { DatabaseService } from './database.service';

describe('DatabaseService (TDD - AUT-01) - RED phase', () => {
    let service: DatabaseService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DatabaseService);
    });

    // PRUEBA 1: Inicialización de la Bóveda con nombre derivado
    it('debe inicializar la base de datos de Dexie con el nombre proporcionado', () => {
        const vaultName = 'nodemesh_vault_abc123';
        service.initializeVault(vaultName);

        // Verificamos que el servicio haya asignado el nombre (como hereda de Dexie, tendrá .name)
        expect(service.name).toBe(vaultName);
    });

    // PRUEBA 2: Estructura de tablas requerida
    it('debe definir las tablas "nodes" y "api_keys" al inicializarse', () => {
        service.initializeVault('nodemesh_vault_test');

        // Dexie schema properties
        const tables = service.tables;
        expect(tables.length).toBeGreaterThanOrEqual(2);

        const tableNames = tables.map((t: any) => t.name);
        expect(tableNames).toContain('nodes');
        expect(tableNames).toContain('api_keys');
    });
    // PRUEBA 3: Guardar y Recuperar API Keys
    it('debe guardar una API Key y recuperarla correctamente por proveedor', async () => {
        service.initializeVault('nodemesh_vault_test_keys');
        const testProvider = 'gemini';
        const testEncryptedKey = 'abc_123_encrypted_base64_string';

        // Save
        await service.saveApiKey(testProvider, testEncryptedKey);

        // Get
        const retrievedKey = await service.getApiKey(testProvider);
        expect(retrievedKey).toBe(testEncryptedKey);
    });

    it('debe devolver null si el proveedor no existe al buscar una API Key', async () => {
        service.initializeVault('nodemesh_vault_test_keys_empty');
        const result = await service.getApiKey('unknown_provider');
        expect(result).toBeNull();
    });
});
