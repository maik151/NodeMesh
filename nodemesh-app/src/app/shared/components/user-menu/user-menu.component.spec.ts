import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UserMenuComponent } from './user-menu.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/ui/theme.service';

describe('UserMenuComponent (TDD)', () => {
  let component: UserMenuComponent;
  let fixture: ComponentFixture<UserMenuComponent>;
  let mockAuthService: any;
  let mockRouter: any;
  let mockThemeService: any;

  const mockUser = {
    uid: 'google-123',
    displayName: 'Test User',
    email: 'test@nodemesh.com'
  };

  beforeEach(async () => {
    mockAuthService = {
      getCurrentUser: vi.fn(),
      logout: vi.fn()
    };
    mockRouter = {
      navigate: vi.fn()
    };
    mockThemeService = {
      isDark$: of(true)
    };

    // Mock ResizeObserver for LiquidGlassComponent
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    await TestBed.configureTestingModule({
      imports: [CommonModule, UserMenuComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ThemeService, useValue: mockThemeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserMenuComponent);
    component = fixture.componentInstance;
  });

  it('debe mostrar el popover cuando el menú está abierto', () => {
    mockAuthService.getCurrentUser.mockReturnValue(mockUser);
    component.isOpen = true;
    fixture.detectChanges();

    const popover = fixture.nativeElement.querySelector('.identity-popover');
    expect(popover).toBeTruthy();
  });

  it('debe alternar el estado isOpen al hacer clic en el trigger del menú', () => {
    expect(component.isOpen).toBe(false);
    
    component.toggleMenu();
    expect(component.isOpen).toBe(true);
    
    component.toggleMenu();
    expect(component.isOpen).toBe(false);
  });

  it('debe llamar a authService.logout() y navegar a /login al cerrar sesión', () => {
    component.handleLogout();
    
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debe cerrarse el menú automáticamente al cerrar sesión', () => {
    component.isOpen = true;
    component.handleLogout();
    expect(component.isOpen).toBe(false);
  });

  it('debe cerrar el menú al hacer clic fuera del componente', () => {
    mockAuthService.getCurrentUser.mockReturnValue(mockUser);
    component.isOpen = true;
    fixture.detectChanges();

    // Simular clic fuera
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.isOpen).toBe(false);
  });
});
