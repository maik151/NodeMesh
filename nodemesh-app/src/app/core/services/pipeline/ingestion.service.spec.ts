import { TestBed } from '@angular/core/testing';
import { IngestionService } from './ingestion.service';
import { CryptoService } from '../storage/crypto.service';
import { DatabaseService } from '../storage/database.service';
import { vi } from 'vitest';

describe('IngestionService (TDD - F3)', () => {
    let service: IngestionService;
    let mockCryptoService: any;
    let mockDbService: any;

    beforeEach(() => {
        mockCryptoService = {
            sanitizeHtml: vi.fn((input: string) => input)
        };

        mockDbService = {
            saveNodes: vi.fn().mockResolvedValue(undefined),
            getNodes: vi.fn().mockResolvedValue([])
        };

        TestBed.configureTestingModule({
            providers: [
                IngestionService,
                { provide: CryptoService, useValue: mockCryptoService },
                { provide: DatabaseService, useValue: mockDbService }
            ]
        });

        service = TestBed.inject(IngestionService);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('debe parsear correctamente la respuesta JSON de la IA en NodeChallenges', async () => {
        const mockAiResponse = JSON.stringify([
            {
                type: 'definicion_inversa',
                question: 'Es el proceso de convertir datos en formato binario',
                expectedAnswer: 'Serialización',
                difficulty: 'intermedio'
            },
            {
                type: 'caso_de_estudio',
                question: 'Un sistema necesita persistir 1M de registros...',
                expectedAnswer: 'Usar batch inserts con transacciones',
                difficulty: 'avanzado'
            }
        ]);

        const mockFetchResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue({
                candidates: [{
                    content: {
                        parts: [{ text: mockAiResponse }]
                    }
                }]
            })
        };

        vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockFetchResponse as any);

        const nodes = await service.generateNodes('Texto de prueba sobre bases de datos', 'fake_key', 'Test Source');

        expect(nodes.length).toBe(2);
        expect(nodes[0].type).toBe('definicion_inversa');
        expect(nodes[0].question).toContain('binario');
        expect(nodes[0].sourceName).toBe('Test Source');
        expect(nodes[1].difficulty).toBe('avanzado');
        expect(mockCryptoService.sanitizeHtml).toHaveBeenCalled();
    });

    it('debe lanzar error si la API retorna un status no-ok', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 401,
            text: vi.fn().mockResolvedValue('Unauthorized')
        } as any);

        await expect(
            service.generateNodes('Texto', 'bad_key', 'Source')
        ).rejects.toThrow('Error de la API');
    });

    it('debe lanzar error si la IA no retorna JSON parseable', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                candidates: [{
                    content: {
                        parts: [{ text: 'Esto no es JSON válido en absoluto' }]
                    }
                }]
            })
        } as any);

        await expect(
            service.generateNodes('Texto', 'key', 'Source')
        ).rejects.toThrow('No se pudo extraer el JSON');
    });
});
