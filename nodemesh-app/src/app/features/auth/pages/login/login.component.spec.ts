import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/services/auth.service';
import { DatabaseService } from '../../../../core/services/database.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { vi } from 'vitest';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let mockAuthService: any;
    let mockDbService: any;
    let mockThemeService: any;

    beforeEach(async () => {
        // Mock canvas getContext for NodeMeshBgComponent
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

        mockAuthService = {
            loginWithGoogle: vi.fn().mockResolvedValue({ uid: 'test-uid' }),
            initializeGis: vi.fn(),
        };

        mockDbService = {
            getApiKey: vi.fn().mockResolvedValue(null),
        };

        mockThemeService = {
            isDark: true,
            theme: 'dark',
            toggle: vi.fn(),
        };

        await TestBed.configureTestingModule({
            imports: [LoginComponent],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: DatabaseService, useValue: mockDbService },
                { provide: ThemeService, useValue: mockThemeService },
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should call authService.loginWithGoogle when onGoogleLogin is called', async () => {
        await component.onGoogleLogin();

        expect(mockAuthService.loginWithGoogle).toHaveBeenCalled();
    });

    it('should have a button that triggers the login method', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const button = compiled.querySelector('button');

        expect(button).toBeTruthy();

        const loginSpy = vi.spyOn(component, 'onGoogleLogin');
        button?.click();

        expect(loginSpy).toHaveBeenCalled();
    });
});
