import { TestBed, ComponentFixture } from '@angular/core/testing';
import { App } from './app';
import { AuthService } from './core/services/auth/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let authServiceSpy: any;
  let routerSpy: any; // Keep it as any to handle mock properties
  let routerEventsSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    authServiceSpy = {
      isAuthenticated: vi.fn().mockReturnValue(true),
      getCurrentUser: vi.fn().mockReturnValue({ displayName: 'Mock User', email: 'user@example.com' }),
      logout: vi.fn()
    };
    
    routerEventsSubject = new BehaviorSubject(new NavigationEnd(1, '/center', '/center'));
    
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([]) // We need a real router instance or a better mock for events
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    
    const router = TestBed.inject(Router);
    // @ts-ignore - hacking router events for the test
    Object.defineProperty(router, 'events', {
      get: () => routerEventsSubject.asObservable(),
      configurable: true
    });
    // @ts-ignore
    Object.defineProperty(router, 'url', { get: () => routerEventsSubject.value.url });
    
  });

  it('debe mostrar el sidebar en /center si está autenticado', () => {
    fixture.detectChanges();
    const sidebar = fixture.debugElement.query(By.css('app-sidebar'));
    expect(sidebar).toBeTruthy();
  });

  it('no debe mostrar el sidebar en /setup aunque esté autenticado', async () => {
    routerEventsSubject.next(new NavigationEnd(2, '/setup', '/setup'));
    fixture.detectChanges();
    
    const sidebar = fixture.debugElement.query(By.css('app-sidebar'));
    expect(sidebar).toBeFalsy();
  });

  it('no debe mostrar el sidebar en /login', () => {
    routerEventsSubject.next(new NavigationEnd(3, '/login', '/login'));
    authServiceSpy.isAuthenticated.mockReturnValue(false);
    fixture.detectChanges();
    
    const sidebar = fixture.debugElement.query(By.css('app-sidebar'));
    expect(sidebar).toBeFalsy();
  });
});
