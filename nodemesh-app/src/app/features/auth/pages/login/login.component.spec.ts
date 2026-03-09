import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/services/auth.service';
import { vi } from 'vitest';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let mockAuthService: any;

    beforeEach(async () => {
        // Create a mock auth service
        mockAuthService = {
            loginWithGoogle: vi.fn().mockResolvedValue({ uid: 'test-uid' })
        };

        await TestBed.configureTestingModule({
            imports: [LoginComponent],
            providers: [
                { provide: AuthService, useValue: mockAuthService }
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

        // Simulate click
        const loginSpy = vi.spyOn(component, 'onGoogleLogin');
        button?.click();

        expect(loginSpy).toHaveBeenCalled();
    });
});
