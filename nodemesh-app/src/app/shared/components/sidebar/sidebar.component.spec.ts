import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { ThemeService } from '../../../core/services/ui/theme.service';

describe('SidebarComponent (TDD)', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  class MockThemeService {
    isDark = true;
  }

  let mockThemeService: MockThemeService;

  beforeEach(async () => {
    mockThemeService = new MockThemeService();

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
  });

  it('debe tener la estructura bento con 5 enlaces principales', () => {
    fixture.detectChanges();
    const links = fixture.debugElement.queryAll(By.css('a'));
    const expectedPaths = ['/center', '/vault', '/stats', '/docs', '/settings'];
    
    expectedPaths.forEach(path => {
      const link = links.find(l => l.attributes['routerLink'] === path);
      expect(link).toBeTruthy();
    });
  });

  it('debe iniciar expandido con las clases host correctas', () => {
    fixture.detectChanges();
    expect(component.isExpanded).toBe(true);
    expect(fixture.debugElement.classes['expanded']).toBeTruthy();
    expect(fixture.debugElement.classes['collapsed']).toBeFalsy();
  });

  it('debe aplicar la clase host "collapsed" al contraerse', () => {
    component.isExpanded = false;
    fixture.detectChanges();
    expect(fixture.debugElement.classes['collapsed']).toBeTruthy();
    expect(fixture.debugElement.classes['expanded']).toBeFalsy();
  });

  it('debe alternar el estado isExpanded al llamar a toggle()', () => {
    fixture.detectChanges();
    component.toggle();
    expect(component.isExpanded).toBe(false);
  });

  it('debe tener los iconos de Material Symbols correctos', () => {
    fixture.detectChanges();
    const centerIcon = fixture.debugElement.query(By.css('a[routerLink="/center"] span.material-symbols-rounded'));
    expect(centerIcon.nativeElement.textContent.trim()).toBe('terminal');

    const vaultIcon = fixture.debugElement.query(By.css('a[routerLink="/vault"] span.material-symbols-rounded'));
    expect(vaultIcon.nativeElement.textContent.trim()).toBe('database');
  });

  it('debe devolver el logotipo blanco en modo oscuro', () => {
    mockThemeService.isDark = true;
    expect(component.logoSrc).toContain('nodeMesh_white.png');
  });

  it('debe devolver el logotipo oscuro en modo claro', () => {
    mockThemeService.isDark = false;
    expect(component.logoSrc).toContain('nodemesh_dark.png');
  });
});
