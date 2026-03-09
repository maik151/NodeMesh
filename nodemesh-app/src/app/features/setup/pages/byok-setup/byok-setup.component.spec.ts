import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ByokSetupComponent } from './byok-setup.component';
import { AuthService } from '../../../../core/services/auth.service';
import { CryptoService } from '../../../../core/services/crypto.service';
import { DatabaseService } from '../../../../core/services/database.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

describe('ByokSetupComponent (TDD - AUT-02)', () => {
    let component: ByokSetupComponent;
    let fixture: ComponentFixture<ByokSetupComponent>;

    let mockAuthService: any;
    let mockCryptoService: any;
    let mockDbService: any;
    let mockRouter: any;

    beforeEach(async () => {
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
            imports: [ByokSetupComponent, FormsModule],
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

    it('debe mostrar error si testGeminiKey falla durante onSaveKey', async () => {
        component.apiKey = 'invalid_key';
        const testSpy = vi.spyOn(component as any, 'testGeminiKey').mockResolvedValue(false);

        await component.onSaveKey();

        expect(testSpy).toHaveBeenCalledWith('invalid_key');
        expect(component.errorMessage).toBe('La API Key proporcionada no es válida o está revocada.');
        expect(component.isLoading).toBe(false);
        expect(component.isSuccess).toBe(false);
        expect(mockDbService.saveApiKey).not.toHaveBeenCalled();
    });

    it('debe cifrar y guardar la API Key si testGeminiKey es exitoso', async () => {
        vi.useFakeTimers();

        component.apiKey = 'valid_key_123';
        const testSpy = vi.spyOn(component as any, 'testGeminiKey').mockResolvedValue(true);

        // Call without await to immediately advance the timer afterwards
        const savePromise = component.onSaveKey();

        // Resolve all microtasks (the fetch and crypto awaits)
        await Promise.resolve();
        await savePromise;

        expect(testSpy).toHaveBeenCalledWith('valid_key_123');
        expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
        expect(mockCryptoService.deriveKeyFromUid).toHaveBeenCalledWith('mock_uid_123');
        expect(mockCryptoService.encrypt).toHaveBeenCalledWith('valid_key_123', expect.anything());
        expect(mockDbService.saveApiKey).toHaveBeenCalledWith('gemini', 'encrypted_mock_key');
        expect(component.isSuccess).toBe(true);
        expect(component.isLoading).toBe(false);
        expect(component.errorMessage).toBe('');

        vi.runAllTimers();
        vi.useRealTimers();
    });
});
