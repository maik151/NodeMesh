import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PromptCompilerComponent } from './prompt-compiler.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../../core/services/ui/theme.service';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('PromptCompilerComponent', () => {
  let component: PromptCompilerComponent;
  let fixture: ComponentFixture<PromptCompilerComponent>;

  const mockThemeService = {
    isDark$: of(true)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptCompilerComponent, CommonModule, FormsModule],
      providers: [
        { provide: ThemeService, useValue: mockThemeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PromptCompilerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe validar que la suma de la matriz coincida con el total de preguntas', () => {
    component.compiler.totalPreguntas = 10;
    component.compiler.matrix.single_choice = 5;
    component.compiler.matrix.cloze_deletion = 5;
    
    const keys = Object.keys(component.compiler.matrix) as (keyof typeof component.compiler.matrix)[];
    keys.forEach(k => {
      if (k !== 'single_choice' && k !== 'cloze_deletion') component.compiler.matrix[k] = 0;
    });

    expect(component.isCompilerValid).toBe(false); 
    component.compiler.tema = 'TypeScript';
    expect(component.isCompilerValid).toBe(true);
    
    component.compiler.matrix.single_choice = 2;
    expect(component.isCompilerValid).toBe(false);
  });

  it('debe simular el copiado del prompt', () => {
    Object.assign(navigator, {
      clipboard: { writeText: () => Promise.resolve() }
    });
    
    component.compiler.tema = 'React';
    component.compiler.totalPreguntas = 2;
    component.compiler.matrix.single_choice = 2;
    const keys = Object.keys(component.compiler.matrix) as (keyof typeof component.compiler.matrix)[];
    keys.forEach(k => { if (k !== 'single_choice') component.compiler.matrix[k] = 0; });

    component.copyPromptBtn();
    expect(component.isCopied).toBe(true);
  });
});
