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
    it('debe rechazar payloads interactivos (XSS) si no están firmados', () => {
      component.temporaryUploadPayload = '<script>alert(1)</script>';
      component.analyzePayload();
      expect(component.uploadStats.isValid).toBe(false);
      expect(component.uploadStats.errorMessage).toContain('XSS');
    });

    it('debe permitir caracteres técnicos conflictivos si el payload tiene firma nodemesh-v1', () => {
      const signedJson = JSON.stringify({
        metadata: { signature: 'nodemesh-v1', titulo_quiz: 'Test Pro' },
        nodos: [{ pregunta: '¿Cómo funciona onclick=?', tipo_reto: 'single_choice', contexto: 'JS' }]
      });
      component.temporaryUploadPayload = signedJson;
      component.analyzePayload();
      expect(component.uploadStats.isValid).toBe(true);
      expect(component.uploadConfig.quizTitle).toBe('Test Pro');
    });

    it('debe auto-rellenar el título del quiz desde los metadatos', () => {
      const jsonStr = JSON.stringify({
        metadata: { titulo_quiz: 'Mastering Angular' },
        nodos: [{ pregunta: 'Q1', tipo_reto: 'single_choice', contexto: 'Angular' }]
      });
      component.temporaryUploadPayload = jsonStr;
      component.analyzePayload();
      expect(component.uploadConfig.quizTitle).toBe('Mastering Angular');
    });

    it('debe aceptar y contar nodos válidos en formato unificado', () => {
      component.temporaryUploadPayload = JSON.stringify({ 
        metadata: {},
        nodos: [
          { pregunta: 'A', tipo_reto: 'single_choice', contexto: 'X' }, 
          { pregunta: 'B', tipo_reto: 'multi_choice', contexto: 'Y' }
        ] 
      });
      component.analyzePayload();
      expect(component.uploadStats.isValid).toBe(true);
      expect(component.uploadStats.nodeCount).toBe(2);
    });

    it('debe normalizar JSON malformado (Markdown envolvente)', () => {
      component.temporaryUploadPayload = '```json\n{"nodos": [{"pregunta": "Z", "tipo_reto": "single_choice", "contexto": "Z"}]}\n```';
      component.normalizeJson();
      expect(component.uploadStats.isValid).toBe(true);
      expect(component.uploadStats.nodeCount).toBe(1);
    });

    it('debe completar el flujo de confirmUpload guardando en DB', async () => {
      const saveFolderSpy = vi.spyOn(mockDatabaseService, 'saveFolder');
      const saveNodesSpy = vi.spyOn(mockDatabaseService, 'saveNodes');
      
      component.uploadConfig.themeName = 'Nuevo Tema';
      component.temporaryUploadPayload = JSON.stringify({ 
        metadata: { signature: 'nodemesh-v1', titulo_quiz: 'Quiz Final' },
        nodos: [{ pregunta: 'Pregunta Final', tipo_reto: 'single_choice', contexto: 'Final' }] 
      });
      
      component.analyzePayload();
      await component.confirmUpload();
      
      expect(saveFolderSpy).toHaveBeenCalled();
      expect(saveNodesSpy).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ pregunta: 'Pregunta Final' })
      ]));
    });
  });

  describe('Generador de Prompt (Compiler)', () => {
    it('debe validar que la suma de la matriz coincida con el total de preguntas', () => {
      // Usar 'compiler' que es la propiedad real en el componente
      component.compiler.totalPreguntas = 10;
      component.compiler.matrix.single_choice = 5;
      component.compiler.matrix.multi_choice = 5;
      
      // Resetear otros valores para que la suma sea exacta
      const keys = Object.keys(component.compiler.matrix) as (keyof typeof component.compiler.matrix)[];
      keys.forEach(k => {
        if (k !== 'single_choice' && k !== 'multi_choice') component.compiler.matrix[k] = 0;
      });

      expect(component.isCompilerValid).toBe(false); // Porque el tema está vacío
      component.compiler.tema = 'TypeScript';
      expect(component.isCompilerValid).toBe(true);
      
      component.compiler.matrix.single_choice = 2;
      // La suma es 7 (2+5), debe ser inválido
      expect(component.isCompilerValid).toBe(false);
    });

    it('debe simular el copiado del prompt y activar el estado visual', async () => {
      // Mock del clipboard
      Object.assign(navigator, {
        clipboard: { writeText: () => Promise.resolve() }
      });
      
      component.compiler.tema = 'React';
      component.compiler.totalPreguntas = 2;
      component.compiler.matrix.single_choice = 2;
      
      // Resetear otros
      const keys = Object.keys(component.compiler.matrix) as (keyof typeof component.compiler.matrix)[];
      keys.forEach(k => { if (k !== 'single_choice') component.compiler.matrix[k] = 0; });

      component.copyPromptBtn();
      expect(component.isCopied).toBe(true);
    });
  });
});
