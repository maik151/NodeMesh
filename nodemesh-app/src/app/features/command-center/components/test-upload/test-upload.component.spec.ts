import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestUploadComponent } from './test-upload.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { vi } from 'vitest';

describe('TestUploadComponent', () => {
  let component: TestUploadComponent;
  let fixture: ComponentFixture<TestUploadComponent>;

  const mockDatabaseService = {
    getDueNodesSummary: () => Promise.resolve([]),
    getRecentFolders: () => Promise.resolve([]),
    saveFolder: () => Promise.resolve(),
    saveNodes: () => Promise.resolve()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestUploadComponent, CommonModule, FormsModule],
      providers: [
        { provide: DatabaseService, useValue: mockDatabaseService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestUploadComponent);
    component = fixture.componentInstance;
    component.payload = '';
    fixture.detectChanges();
  });

  it('debe rechazar payloads interactivos (XSS) si no están firmados', () => {
    component.payload = '<script>alert(1)</script>';
    (component as any).analyzePayload();
    expect(component.uploadStats.isValid).toBe(false);
    expect(component.uploadStats.errorMessage).toContain('XSS');
  });

  it('debe permitir caracteres técnicos conflictivos si el payload tiene firma nodemesh-v1', () => {
    const signedJson = JSON.stringify({
      metadata: { signature: 'nodemesh-v1', titulo_quiz: 'Test Pro' },
      nodos: [{ pregunta: '¿Cómo funciona onclick=?', tipo_reto: 'single_choice', contexto: 'JS' }]
    });
    component.payload = signedJson;
    (component as any).analyzePayload();
    expect(component.uploadStats.isValid).toBe(true);
    expect(component.uploadConfig.quizTitle).toBe('Test Pro');
  });

  it('debe auto-rellenar el título del quiz desde los metadatos', () => {
    const jsonStr = JSON.stringify({
      metadata: { titulo_quiz: 'Mastering Angular' },
      nodos: [{ pregunta: 'Q1', tipo_reto: 'single_choice', contexto: 'Angular' }]
    });
    component.payload = jsonStr;
    (component as any).analyzePayload();
    expect(component.uploadConfig.quizTitle).toBe('Mastering Angular');
  });

  it('debe aceptar y contar nodos válidos en formato unificado', () => {
    component.payload = JSON.stringify({ 
      metadata: {},
      nodos: [
        { pregunta: 'A', tipo_reto: 'single_choice', contexto: 'X' }, 
        { pregunta: 'B', tipo_reto: 'multi_choice', contexto: 'Y' }
      ] 
    });
    (component as any).analyzePayload();
    expect(component.uploadStats.isValid).toBe(true);
    expect(component.uploadStats.nodeCount).toBe(2);
  });

  it('debe normalizar JSON malformado (Markdown envolvente)', () => {
    component.payload = '```json\n{"nodos": [{"pregunta": "Z", "tipo_reto": "single_choice", "contexto": "Z"}]}\n```';
    component.normalizeJson();
    expect(component.uploadStats.isValid).toBe(true);
    expect(component.uploadStats.nodeCount).toBe(1);
  });

  it('debe completar el flujo de confirmUpload guardando en DB', async () => {
    const saveFolderSpy = vi.spyOn(mockDatabaseService, 'saveFolder');
    const saveNodesSpy = vi.spyOn(mockDatabaseService, 'saveNodes');
    
    component.uploadConfig.themeName = 'Nuevo Tema';
    component.payload = JSON.stringify({ 
      metadata: { signature: 'nodemesh-v1', titulo_quiz: 'Quiz Final' },
      nodos: [{ pregunta: 'Pregunta Final', tipo_reto: 'single_choice', contexto: 'Final' }] 
    });
    
    (component as any).analyzePayload();
    await component.confirmUpload();
    
    expect(saveFolderSpy).toHaveBeenCalled();
    expect(saveNodesSpy).toHaveBeenCalled();
  });
});
