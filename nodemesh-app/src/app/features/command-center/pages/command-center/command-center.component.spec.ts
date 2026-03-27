import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandCenterComponent } from './command-center.component';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { ThemeService } from '../../../../core/services/ui/theme.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { vi } from 'vitest';

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

  const mockThemeService = {
    isDark$: of(true)
  };

  const mockRouter = {
    navigate: vi.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandCenterComponent, CommonModule],
      providers: [
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommandCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe contener los elementos clave (SUBIR PREGUNTAS, Generar Prompt, FORZAR_SPRINT)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('SUBIR PREGUNTAS');
    expect(compiled.textContent).toContain('Generar Prompt');
    expect(compiled.textContent).toContain('FORZAR_SPRINT');
  });

  it('debe activar dragging state al hacer drag enter', () => {
    const dropArea = fixture.nativeElement.querySelector('.card-ingest') as HTMLElement;
    dropArea.dispatchEvent(new Event('dragenter'));
    fixture.detectChanges();
    expect(component.isDragging).toBe(true);
  });

  it('debe abrir el modal de subida al pegar texto', () => {
    const event = new Event('paste');
    Object.defineProperty(event, 'clipboardData', {
      value: { getData: () => '{"test": 1}' }
    });
    
    window.dispatchEvent(event);
    fixture.detectChanges();
    
    expect(component.showUploadModal).toBe(true);
    expect(component.temporaryUploadPayload).toBe('{"test": 1}');
  });

  it('debe abrir el compiler al hacer click en Generar Prompt', () => {
    component.openCompilerModal();
    expect(component.showCompiler).toBe(true);
  });
});
