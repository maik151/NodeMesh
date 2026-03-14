import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandCenterComponent } from './command-center.component';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { of } from 'rxjs';

// Polyfill para ResizeObserver en el entorno de test
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('CommandCenterComponent', () => {
  let component: CommandCenterComponent;
  let fixture: ComponentFixture<CommandCenterComponent>;

  const mockDatabaseService = {
    getDueNodesSummary: () => Promise.resolve([]),
    getRecentFolders: () => Promise.resolve([]),
    getDailyActivity: () => Promise.resolve([]),
    getMasteryRatio: () => Promise.resolve(0),
    getStreak: () => Promise.resolve(0)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandCenterComponent, CommonModule],
      providers: [
        { provide: DatabaseService, useValue: mockDatabaseService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommandCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener un contenedor principal con el grid de 12 columnas', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const grid = compiled.querySelector('.cc-grid');
    expect(grid).toBeTruthy();
  });

  it('debe contener los elementos clave (INJECT_PAYLOAD, FORZAR_SPRINT)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('INJECT_PAYLOAD');
    expect(compiled.textContent).toContain('FORZAR_SPRINT');
  });
});
