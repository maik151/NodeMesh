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
      isAuthenticated: vi.fn().mockReturnValue(true)
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
    
    // Manual injection to control the mock more strictly if needed
    const router = TestBed.inject(Router);
    // @ts-ignore - hacking router events for the test
    (router as any).events = routerEventsSubject.asObservable();
    // @ts-ignore
    Object.defineProperty(router, 'url', { get: () => routerEventsSubject.value.url });
    
    fixture.detectChanges();
  });

  it('debe mostrar el sidebar en /center si está autenticado', () => {
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
