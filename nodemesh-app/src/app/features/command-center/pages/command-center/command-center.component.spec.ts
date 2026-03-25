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
    getStreak: () => Promise.resolve(0),
    saveFolder: () => Promise.resolve(),
    saveNodes: () => Promise.resolve()
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

  it('debe contener los elementos clave (Subir Preguntas, Generar Prompt, FORZAR_SPRINT)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('SUBIR PREGUNTAS');
    expect(compiled.textContent).toContain('Generar Prompt');
    expect(compiled.textContent).toContain('FORZAR_SPRINT');
  });

  it('debe activar dragging state al hacer drag enter', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const dropArea = compiled.querySelector('.card-ingest') as HTMLElement;
    expect(dropArea.classList.contains('dragging')).toBe(false);
    
    dropArea.dispatchEvent(new Event('dragenter'));
    fixture.detectChanges();
    expect(component.isDragging).toBe(true);
    expect(dropArea.classList.contains('dragging')).toBe(true);
  });

  describe('Modal de Ingesta (TDD)', () => {
    it('debe rechazar payloads interactivos (XSS)', () => {
      component.temporaryUploadPayload = '<script>alert(1)</script>';
      component.analyzePayload();
      expect(component.uploadStats.isValid).toBe(false);
      expect(component.uploadStats.errorMessage).toContain('XSS');
    });

    it('debe aceptar y contar nodos válidos', () => {
      component.temporaryUploadPayload = JSON.stringify({ nodos: [{ pregunta: 'A' }, { pregunta: 'B' }] });
      component.analyzePayload();
      expect(component.uploadStats.isValid).toBe(true);
      expect(component.uploadStats.nodeCount).toBe(2);
    });

    it('debe normalizar JSON malformado (Markdown envolvente)', () => {
      component.temporaryUploadPayload = '```json\n[{"pregunta": "Z"}]\n```';
      component.normalizeJson();
      expect(component.uploadStats.isValid).toBe(true);
      expect(component.uploadStats.nodeCount).toBe(1);
    });
  });
});
