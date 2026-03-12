import 'fake-indexeddb/auto';
import { TestBed } from '@angular/core/testing';
import { DatabaseService } from './database.service';
import Dexie from 'dexie';

describe('DatabaseService (TDD - AUT-01) - RED phase', () => {
    let service: DatabaseService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DatabaseService);
    });

    afterEach(async () => {
        if (service.db) {
            await service.db.delete(); // Borra la base de datos usando la instancia ya configurada
        }
    });

    // PRUEBA 1: Inicialización de la Bóveda con nombre derivado
    it('debe inicializar la base de datos de Dexie con el nombre proporcionado', async () => {
        const vaultName = 'nodemesh_vault_abc123';
        await service.initializeVault(vaultName);

        // Verificamos que el servicio haya asignado el nombre (como hereda de Dexie, tendrá .name)
        expect(service.name).toBe(vaultName);
    });

    // PRUEBA 2: Estructura de tablas requerida
    it('debe definir las tablas "nodes" y "api_keys" al inicializarse', async () => {
        await service.initializeVault('nodemesh_vault_test');

        // Dexie schema properties
        const tables = service.tables;
        expect(tables.length).toBeGreaterThanOrEqual(2);

        const tableNames = tables.map((t: any) => t.name);
        expect(tableNames).toContain('nodes');
        expect(tableNames).toContain('api_keys');
    });
    // PRUEBA 3: Guardar y Recuperar API Keys
    it('debe guardar una API Key y recuperarla correctamente por proveedor', async () => {
        await service.initializeVault('nodemesh_vault_test_keys');
        const testProvider = 'gemini';
        const testEncryptedKey = 'abc_123_encrypted_base64_string';

        // Save
        await service.saveApiKey(testProvider, testEncryptedKey);

        // Get
        const retrievedKey = await service.getApiKey(testProvider);
        expect(retrievedKey).toBe(testEncryptedKey);
    });

    it('debe devolver null si el proveedor no existe al buscar una API Key', async () => {
        await service.initializeVault('nodemesh_vault_test_keys_empty');
        const result = await service.getApiKey('unknown_provider');
        expect(result).toBeNull();
    });

    // --- F3: Persistencia de Nodos ---
    it('debe guardar nodos y recuperarlos correctamente', async () => {
        await service.initializeVault('nodemesh_vault_test_nodes');
        const nodes = [
            {
                type: 'definicion_inversa' as const,
                question: 'Pregunta test 1',
                expectedAnswer: 'Respuesta test 1',
                difficulty: 'aprendiz' as const,
                sourceId: 'src_001',
                sourceName: 'Tema de Prueba',
                createdAt: new Date(),
                nextReviewDate: new Date()
            },
            {
                type: 'caso_de_estudio' as const,
                question: 'Pregunta test 2',
                expectedAnswer: 'Respuesta test 2',
                difficulty: 'intermedio' as const,
                sourceId: 'src_001',
                sourceName: 'Tema de Prueba',
                createdAt: new Date(),
                nextReviewDate: new Date()
            }
        ];

        await service.saveNodes(nodes);
        const result = await service.getNodes();
        expect(result.length).toBe(2);
        expect(result[0].question).toBe('Pregunta test 1');
        expect(result[1].type).toBe('caso_de_estudio');
    });

    it('debe filtrar nodos por sourceId', async () => {
        await service.initializeVault('nodemesh_vault_test_filter');
        const nodes = [
            {
                type: 'pregunta_socratica' as const,
                question: 'Q from source A',
                expectedAnswer: 'A',
                difficulty: 'avanzado' as const,
                sourceId: 'src_A',
                sourceName: 'Source A',
                createdAt: new Date(),
                nextReviewDate: new Date()
            },
            {
                type: 'analogia_forzada' as const,
                question: 'Q from source B',
                expectedAnswer: 'B',
                difficulty: 'senior' as const,
                sourceId: 'src_B',
                sourceName: 'Source B',
                createdAt: new Date(),
                nextReviewDate: new Date()
            }
        ];

        await service.saveNodes(nodes);
        const filtered = await service.getNodesBySource('src_A');
        expect(filtered.length).toBe(1);
        expect(filtered[0].question).toBe('Q from source A');
    });

    // --- NUEVAS PRUEBAS PARA COBERTURA (Round 1) ---

    describe('Getters y Estados Iniciales', () => {
        it('debe devolver nombre vacío y tablas vacías si no está inicializado', () => {
            const freshService = new DatabaseService();
            expect(freshService.name).toBe('');
            expect(freshService.tables).toEqual([]);
        });

        it('debe devolver el nombre y las tablas después de inicializar', async () => {
            await service.initializeVault('test_getters');
            expect(service.name).toBe('test_getters');
            expect(service.tables.length).toBe(4); // nodes, api_keys, history, statistics
        });
    });

    describe('Manejo de Errores de Inicialización', () => {
        it('debe cerrar la base de datos anterior si se inicializa de nuevo', async () => {
            await service.initializeVault('vault_1');
            const closeSpy = vi.spyOn(service.db, 'close');
            await service.initializeVault('vault_2');
            expect(closeSpy).toHaveBeenCalled();
            expect(service.name).toBe('vault_2');
        });

        it('debe capturar y relanzar QuotaExceededError con mensaje específico', async () => {
            // Simulamos que db.open lanza QuotaExceededError
            const mockDb = new Dexie('test_quota');
            vi.spyOn(Dexie.prototype, 'open').mockRejectedValue({ name: 'QuotaExceededError' });
            const consoleSpy = vi.spyOn(console, 'error');

            await expect(service.initializeVault('test_quota')).rejects.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('CRITICAL: QuotaExceededError'));
            
            vi.restoreAllMocks();
        });

        it('debe capturar y relanzar errores genéricos de apertura', async () => {
            vi.spyOn(Dexie.prototype, 'open').mockRejectedValue(new Error('Generic IDB Error'));
            const consoleSpy = vi.spyOn(console, 'error');

            await expect(service.initializeVault('test_generic')).rejects.toThrow('Generic IDB Error');
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error opening IndexedDB'), expect.anything());

            vi.restoreAllMocks();
        });
    });

    describe('Validaciones de Estado (Uninitialized)', () => {
        const errorMsg = 'Database not initialized';

        it('saveApiKey debe fallar si no hay DB', async () => {
            await expect(service.saveApiKey('p', 'k')).rejects.toThrow(errorMsg);
        });

        it('getApiKey debe fallar si no hay DB', async () => {
            await expect(service.getApiKey('p')).rejects.toThrow(errorMsg);
        });

        it('saveNodes debe fallar si no hay DB', async () => {
            await expect(service.saveNodes([])).rejects.toThrow(errorMsg);
        });

        it('getNodes debe fallar si no hay DB', async () => {
            await expect(service.getNodes()).rejects.toThrow(errorMsg);
        });

        it('getNodesBySource debe fallar si no hay DB', async () => {
            await expect(service.getNodesBySource('s')).rejects.toThrow(errorMsg);
        });
    });
});
