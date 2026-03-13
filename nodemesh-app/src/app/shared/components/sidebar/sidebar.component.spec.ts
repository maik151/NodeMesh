import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('SidebarComponent (TDD)', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe tener los 5 enlaces principales definidos en el flujo', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));
    const expectedPaths = ['/center', '/vault', '/stats', '/docs', '/settings'];
    
    expectedPaths.forEach(path => {
      const link = links.find(l => l.attributes['routerLink'] === path);
      expect(link).toBeTruthy(`Falta el enlace hacia ${path}`);
    });
  });

  it('debe iniciar en estado expandido por defecto', () => {
    expect(component.isExpanded).toBe(true);
  });

  it('debe alternar el estado isExpanded al llamar a toggle()', () => {
    component.toggle();
    expect(component.isExpanded).toBe(false);
    component.toggle();
    expect(component.isExpanded).toBe(true);
  });

  it('debe tener los iconos de Material Symbols correctos para cada sección', () => {
    const centerIcon = fixture.debugElement.query(By.css('a[routerLink="/center"] span.material-symbols-rounded'));
    expect(centerIcon.nativeElement.textContent.trim()).toBe('terminal');

    const vaultIcon = fixture.debugElement.query(By.css('a[routerLink="/vault"] span.material-symbols-rounded'));
    expect(vaultIcon.nativeElement.textContent.trim()).toBe('database');

    const settingsIcon = fixture.debugElement.query(By.css('a[routerLink="/settings"] span.material-symbols-rounded'));
    expect(settingsIcon.nativeElement.textContent.trim()).toBe('settings');
  });
});
