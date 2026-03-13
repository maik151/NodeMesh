import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserMenuComponent } from './user-menu.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('UserMenuComponent (TDD)', () => {
  let component: UserMenuComponent;
  let fixture: ComponentFixture<UserMenuComponent>;
  let mockAuthService: any;
  let mockRouter: any;

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

    await TestBed.configureTestingModule({
      imports: [CommonModule, UserMenuComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserMenuComponent);
    component = fixture.componentInstance;
  });

  it('debe mostrar el nombre del usuario cuando está autenticado y el menú está abierto', () => {
    mockAuthService.getCurrentUser.mockReturnValue(mockUser);
    component.isOpen = true; // El nombre está dentro del popover
    fixture.detectChanges();

    const nameElement = fixture.nativeElement.querySelector('.user-display-name');
    expect(nameElement.textContent).toContain(mockUser.displayName);
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
});
