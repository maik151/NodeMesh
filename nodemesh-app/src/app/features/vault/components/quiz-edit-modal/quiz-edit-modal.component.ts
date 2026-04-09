import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizSession } from '../../../../core/models/node.model';

@Component({
  selector: 'app-quiz-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cc-modal-overlay" (click)="onClose.emit()">
      <div class="cc-modal-content" (click)="$event.stopPropagation()">
        
        <!-- HEADER -->
        <div class="cc-modal-header">
          <div class="cc-header-title">
            <div class="cc-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120Zm96-96L147.31,64l24-24L216,84.68Z"/>
              </svg>
            </div>
            <h2>Configuración del Quiz</h2>
          </div>
          <button class="cc-close-btn" (click)="onClose.emit()" title="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
            </svg>
          </button>
        </div>

        <!-- BODY -->
        <div class="cc-modal-body">
          <div class="cc-form-section">
            <label class="cc-label">Título del Quiz</label>
            <div class="cc-input-wrapper">
              <input 
                type="text" 
                [(ngModel)]="tempTitle" 
                placeholder="Nombre del test..." 
                class="cc-input"
                autofocus>
              <div class="cc-input-focus-line"></div>
            </div>
          </div>

          <div class="cc-form-section">
            <label class="cc-label">Nivel de Dificultad</label>
            <div class="cc-difficulty-grid">
              <button 
                *ngFor="let level of levels" 
                class="cc-diff-item" 
                [class.active]="tempDifficulty === level"
                (click)="tempDifficulty = level">
                <span class="cc-diff-dot"></span>
                {{ level }}
              </button>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="cc-modal-footer">
          <button class="cc-btn-secondary" (click)="onClose.emit()">Cancelar</button>
          <button class="cc-btn-primary" (click)="handleSave()" [disabled]="!tempTitle.trim()">
            <span>Guardar Configuración</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
            </svg>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* OVERLAY */
    .cc-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(28px);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 12vh;
      z-index: 100000;
      animation: cc-fade-in 0.25s ease-out;
    }

    /* CONTENT BOX */
    .cc-modal-content {
      width: 460px;
      max-width: 95vw;
      background: var(--theme-surface-solid);
      border: 1px solid var(--theme-border);
      border-radius: 20px;
      padding: 1.5rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      box-shadow: 0 40px 100px var(--theme-shadow-soft);
      animation: cc-modal-reveal 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }

    /* HEADER */
    .cc-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cc-header-title {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .cc-icon-box {
      width: 36px;
      height: 36px;
      background: rgba(159, 255, 34, 0.05);
      border: 1px solid rgba(159, 255, 34, 0.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cc-icon-box svg {
      width: 18px;
      height: 18px;
      fill: var(--theme-brand-neon);
    }

    .cc-modal-header h2 {
      margin: 0;
      font-size: 1.4rem;
      font-family: 'Outfit', sans-serif;
      color: var(--theme-text);
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .cc-close-btn {
      background: transparent;
      border: none;
      color: var(--theme-text-muted);
      cursor: pointer;
      padding: 0.6rem;
      border-radius: 50%;
      display: flex;
      transition: all 0.2s;
    }

    .cc-close-btn:hover {
      background: rgba(128, 128, 128, 0.1);
      color: var(--theme-text);
      transform: rotate(90deg);
    }

    .cc-close-btn svg { width: 22px; height: 22px; fill: currentColor; }

    /* BODY */
    .cc-modal-body {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .cc-form-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .cc-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--theme-text-muted);
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
    }

    /* INPUT */
    .cc-input-wrapper {
      position: relative;
    }

    .cc-input {
      width: 100%;
      background: var(--theme-input-bg);
      border: 1px solid var(--theme-border);
      border-radius: 10px;
      padding: 0.85rem 1.1rem;
      color: var(--theme-text);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      outline: none;
      transition: all 0.3s;
      box-sizing: border-box;
    }

    .cc-input:focus {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(159, 255, 34, 0.3);
    }

    .cc-input-focus-line {
      position: absolute;
      bottom: 0;
      left: 12px;
      right: 12px;
      height: 1px;
      background: var(--theme-brand-neon);
      transform: scaleX(0);
      transition: transform 0.3s ease;
      opacity: 0.5;
    }

    .cc-input:focus + .cc-input-focus-line {
      transform: scaleX(1);
    }

    /* DIFFICULTY GRID */
    .cc-difficulty-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .cc-diff-item {
      background: var(--theme-input-bg);
      border: 1px solid var(--theme-border);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      color: var(--theme-text-secondary);
      font-family: 'Outfit', sans-serif;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      transition: all 0.25s;
    }

    .cc-diff-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      transition: all 0.25s;
    }

    .cc-diff-item:hover {
      background: rgba(128, 128, 128, 0.1);
      border-color: var(--theme-border);
      color: var(--theme-text);
    }

    .cc-diff-item.active {
      background: rgba(159, 255, 34, 0.08);
      border-color: var(--theme-brand-neon);
      color: var(--theme-brand-neon);
      box-shadow: 0 0 20px rgba(159, 255, 34, 0.05);
    }

    .cc-diff-item.active .cc-diff-dot {
      background: var(--theme-brand-neon);
      box-shadow: 0 0 8px var(--theme-brand-neon);
    }

    /* FOOTER */
    .cc-modal-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 1.25rem;
      margin-top: 0.5rem;
    }

    .cc-btn-secondary {
      background: transparent;
      border: none;
      color: var(--theme-text-muted);
      font-family: 'Outfit', sans-serif;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0.6rem 1rem;
      transition: color 0.2s;
    }

    .cc-btn-secondary:hover {
      color: var(--theme-text);
    }

    .cc-btn-primary {
      background: var(--theme-brand-neon);
      border: none;
      border-radius: 10px;
      color: var(--theme-brand-btn-text);
      font-family: 'Outfit', sans-serif;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      padding: 0.65rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .cc-btn-primary svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    .cc-btn-primary:hover:not(:disabled) {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 30px rgba(159, 255, 34, 0.3);
    }

    .cc-btn-primary:active:not(:disabled) {
      transform: translateY(-1px) scale(0.98);
    }

    .cc-btn-primary:disabled {
      opacity: 0.3;
      filter: grayscale(1);
      cursor: not-allowed;
    }

    /* ANIMATIONS */
    @keyframes cc-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes cc-modal-reveal {
      from { opacity: 0; transform: translateY(40px) scale(0.92); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class QuizEditModalComponent implements OnInit {
  @Input() quiz!: QuizSession;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<{ title: string, difficulty: string }>();

  tempTitle: string = '';
  tempDifficulty: string = '';
  levels = ['Aprendiz', 'Intermedio', 'Avanzado', 'Senior'];

  ngOnInit() {
    this.tempTitle = this.quiz.titulo_quiz;
    this.tempDifficulty = this.quiz.dificultad_global || 'Aprendiz';
  }

  handleSave() {
    if (this.tempTitle.trim()) {
      this.onSave.emit({
        title: this.tempTitle.trim(),
        difficulty: this.tempDifficulty
      });
    }
  }
}
