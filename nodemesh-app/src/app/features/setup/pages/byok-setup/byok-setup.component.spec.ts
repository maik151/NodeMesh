import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ByokSetupComponent } from './byok-setup.component';
import { AuthService } from '../../../../core/services/auth.service';
import { CryptoService } from '../../../../core/services/crypto.service';
import { DatabaseService } from '../../../../core/services/database.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../../core/services/theme.service';
import { LiquidGlassComponent } from '../../../../shared/components/liquid-glass/liquid-glass.component';
import { vi } from 'vitest';

describe('ByokSetupComponent (TDD - AUT-02)', () => {
    let component: ByokSetupComponent;
    let fixture: ComponentFixture<ByokSetupComponent>;

    let mockAuthService: any;
    let mockCryptoService: any;
    let mockDbService: any;
    let mockRouter: any;

    beforeEach(async () => {
        HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
            clearRect: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
        }) as any;

        class ResizeObserverMock {
            observe = vi.fn();
            unobserve = vi.fn();
            disconnect = vi.fn();
        }
        global.ResizeObserver = ResizeObserverMock as any;

        mockAuthService = {
            getCurrentUser: vi.fn().mockReturnValue({ uid: 'mock_uid_123', email: 'test@test.com', displayName: 'Mock User' })
        };

        mockCryptoService = {
            deriveKeyFromUid: vi.fn().mockResolvedValue({} as CryptoKey),
            encrypt: vi.fn().mockResolvedValue('encrypted_mock_key')
        };

        mockDbService = {
            saveApiKey: vi.fn().mockResolvedValue(undefined)
        };

        mockRouter = {
            navigate: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [ByokSetupComponent, FormsModule, LiquidGlassComponent],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: CryptoService, useValue: mockCryptoService },
                { provide: DatabaseService, useValue: mockDbService },
                { provide: Router, useValue: mockRouter }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ByokSetupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('debe mostrar error y no activar el botón si testGeminiKey falla durante onTestKey', async () => {
        component.apiKey = 'invalid_key';
        const testSpy = vi.spyOn(component as any, 'testGeminiKey').mockResolvedValue(false);

        await component.onTestKey();

        expect(testSpy).toHaveBeenCalledWith('invalid_key');
        expect(component.errorMessage).toBe('La API Key proporcionada no es válida o está revocada.');
        expect(component.isTestLoading).toBe(false);
        expect(component.apiTestedSuccessfully).toBe(false);
    });

    it('debe validar la API con onTestKey y luego permitir guardar con onSaveKey', async () => {
        vi.useFakeTimers();

        component.apiKey = 'valid_key_123';
        const testSpy = vi.spyOn(component as any, 'testGeminiKey').mockResolvedValue(true);

        // 1. Paso Test
        await component.onTestKey();

        expect(testSpy).toHaveBeenCalledWith('valid_key_123');
        expect(component.apiTestedSuccessfully).toBe(true);
        expect(component.isTestLoading).toBe(false);
        expect(component.errorMessage).toBe('');

        // 2. Paso Save
        const savePromise = component.onSaveKey();
        await Promise.resolve();
        await savePromise;

        expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
        expect(mockCryptoService.deriveKeyFromUid).toHaveBeenCalledWith('mock_uid_123');
        expect(mockCryptoService.encrypt).toHaveBeenCalledWith('valid_key_123', expect.anything());
        expect(mockDbService.saveApiKey).toHaveBeenCalledWith('gemini', 'encrypted_mock_key');

        expect(component.isSaveSuccess).toBe(true);
        expect(component.isSaveLoading).toBe(false);

        vi.runAllTimers();
        vi.useRealTimers();
    });
});
