import { TestBed } from '@angular/core/testing';
import { IngestionService } from './ingestion.service';
import { CryptoService } from '../storage/crypto.service';
import { DatabaseService } from '../storage/database.service';
import { vi } from 'vitest';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Mock de PDF.js
vi.mock('pdfjs-dist/legacy/build/pdf.mjs', () => ({
    getDocument: vi.fn(),
    GlobalWorkerOptions: { workerPort: null },
    version: '4.8.69'
}));

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
                id_temp: 'nodo_1',
                tipo_reto: 'single_choice',
                requiere_ia: false,
                contexto: 'Seguridad',
                pregunta: 'Es el proceso de convertir datos en formato binario',
                opciones: ['A', 'B'],
                respuesta_esperada: 'Serialización',
                justificacion_correcta: 'Bien',
                justificacion_incorrecta: 'Mal'
            },
            {
                id_temp: 'nodo_2',
                tipo_reto: 'optimization',
                requiere_ia: true,
                contexto: 'Performance',
                pregunta: 'Un sistema necesita persistir 1M de registros...',
                opciones: null,
                respuesta_esperada: 'Usar batch inserts con transacciones',
                justificacion_correcta: 'Bien',
                justificacion_incorrecta: 'Mal'
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
        expect(nodes[0].tipo_reto).toBe('single_choice');
        expect(nodes[0].pregunta).toContain('binario');
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

    describe('Casos de borde en parseAiResponse', () => {
        it('debe lanzar error si el JSON es inválido (ej: falta una coma)', async () => {
             // Mockeamos la respuesta de la IA con JSON roto
             const brokenJson = '[{ "type": "test", "question": "Q" "expectedAnswer": "A" }]'; // Falta coma entre Q y expected
             vi.spyOn(globalThis, 'fetch').mockResolvedValue({
                 ok: true,
                 json: vi.fn().mockResolvedValue({ candidates: [{ content: { parts: [{ text: brokenJson }] } }] })
             } as any);

             await expect(service.generateNodes('T', 'k', 'S')).rejects.toThrow('El JSON retornado por la IA no es válido');
        });

        it('debe lanzar error si la IA retorna un array vacío', async () => {
            vi.spyOn(globalThis, 'fetch').mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({ candidates: [{ content: { parts: [{ text: '[]' }] } }] })
            } as any);

            await expect(service.generateNodes('T', 'k', 'S')).rejects.toThrow('La IA retornó un array vacío');
        });

        it('debe lanzar error si candidates es nulo o vacío', async () => {
            vi.spyOn(globalThis, 'fetch').mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({ candidates: [] })
            } as any);

            await expect(service.generateNodes('T', 'k', 'S')).rejects.toThrow('La IA no retornó contenido válido');
        });
    });

    describe('Extracción de PDF (Mocked)', () => {
        it('debe extraer texto de un archivo PDF mockeado', async () => {
            const mockPage = {
                getTextContent: vi.fn().mockResolvedValue({
                    items: [{ str: 'Hello' }, { str: 'World' }]
                })
            };
            const mockPdf = {
                numPages: 1,
                getPage: vi.fn().mockResolvedValue(mockPage)
            };
            (pdfjsLib.getDocument as any).mockReturnValue({
                promise: Promise.resolve(mockPdf)
            });

            const fakeFile = new File(['fake content'], 'test.pdf', { type: 'application/pdf' });
            const result = await service.extractTextFromPdf(fakeFile);

            expect(result).toBe('Hello World');
            expect(pdfjsLib.getDocument).toHaveBeenCalled();
        });
    });
});
