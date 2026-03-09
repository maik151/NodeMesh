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
});
