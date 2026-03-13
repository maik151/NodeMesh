import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { ThemeService } from '../../../core/services/ui/theme.service';
import { BehaviorSubject } from 'rxjs';

describe('SidebarComponent (TDD)', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  class MockThemeService {
    private isDarkSubject = new BehaviorSubject<boolean>(true);
    isDark$ = this.isDarkSubject.asObservable();
    
    set isDark(value: boolean) {
      this.isDarkSubject.next(value);
    }
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

  it('debe vincular el logotipo blanco en modo oscuro', () => {
    mockThemeService.isDark = true;
    fixture.detectChanges();
    const logoImg = fixture.debugElement.query(By.css('.logo-img'));
    expect(logoImg.nativeElement.src).toContain('nodeMesh_white.png');
  });

  it('debe vincular el logotipo oscuro en modo claro', () => {
    mockThemeService.isDark = false;
    fixture.detectChanges();
    const logoImg = fixture.debugElement.query(By.css('.logo-img'));
    expect(logoImg.nativeElement.src).toContain('nodemesh_dark.png');
  });

  it('debe mostrar "Docs" en lugar de "Documentos"', () => {
    fixture.detectChanges();
    const docsItem = fixture.debugElement.queryAll(By.css('.item-text'))
      .find(el => el.nativeElement.textContent.trim() === 'Docs');
    expect(docsItem).toBeTruthy();
    
    const documentosItem = fixture.debugElement.queryAll(By.css('.item-text'))
      .find(el => el.nativeElement.textContent.trim() === 'Documentos');
    expect(documentosItem).toBeFalsy();
  });

  it('debe tener la estructura de navegación correcta', () => {
    fixture.detectChanges();
    const navItems = fixture.debugElement.queryAll(By.css('.nav-item'));
    expect(navItems.length).toBe(5);
  });
});
