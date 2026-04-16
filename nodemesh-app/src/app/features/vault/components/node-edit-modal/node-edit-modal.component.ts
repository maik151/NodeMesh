import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NodeChallenge } from '../../../../core/models/node.model';
import { MOTOR_ICONS } from '../../../../shared/constants/icons.constants';

@Component({
  selector: 'app-node-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ne-overlay" (click)="onClose.emit()">
      <div class="ne-container" (click)="$event.stopPropagation()">
        
        <!-- HEADER -->
        <div class="ne-header">
          <div class="ne-header-left">
            <span class="ne-type-badge">{{ getTipoLabel(node.tipo_reto) }}</span>
            <div class="ne-title-wrap">
              <h2>Editar Nodo de Conocimiento</h2>
              <p class="ne-subtitle">ID: {{ node.id_temp }}</p>
            </div>
          </div>
          <button class="ne-close-btn" (click)="onClose.emit()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
            </svg>
          </button>
        </div>

        <!-- SCROLLABLE BODY -->
        <div class="ne-body scroll-custom">
          
          <!-- PREGUNTA (PRINCIPAL) -->
          <div class="ne-section">
            <label>La Pregunta</label>
            <textarea 
              [(ngModel)]="tempNode.pregunta" 
              class="ne-textarea ne-pregunta-input" 
              rows="2"
              placeholder="¿Qué quieres preguntar?">
            </textarea>
          </div>

          <div class="ne-grid-2">
            <!-- CONTEXTO -->
            <div class="ne-section">
              <label>Contexto / Snippet de Código</label>
              <textarea 
                [(ngModel)]="tempNode.contexto" 
                class="ne-textarea ne-contexto-input" 
                rows="6"
                placeholder="Agrega el código o contexto necesario...">
              </textarea>
            </div>

            <!-- MOTOR & OPTIONS -->
            <div class="ne-side-cols">
               <div class="ne-section">
                 <label>Motor de Evaluación</label>
                 <div class="ne-motor-toggle" [class.ia-active]="tempNode.requiere_ia" (click)="tempNode.requiere_ia = !tempNode.requiere_ia">
                   <div class="ne-motor-icon">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                       <path [attr.d]="tempNode.requiere_ia ? MOTOR_ICONS.ia : MOTOR_ICONS.local"/>
                     </svg>
                   </div>
                   <div class="ne-motor-info">
                     <span class="ne-motor-name">{{ tempNode.requiere_ia ? 'Motor IA (Cloud)' : 'Motor Local' }}</span>
                     <span class="ne-motor-desc">{{ tempNode.requiere_ia ? 'Ideal para respuestas abiertas' : 'Rápido, basado en reglas' }}</span>
                   </div>
                   <div class="ne-toggle-circle"></div>
                 </div>
               </div>

               <div class="ne-section">
                 <label>Respuesta Esperada</label>
                 <input 
                  type="text" 
                  [(ngModel)]="tempNode.respuesta_esperada" 
                  class="ne-input"
                  placeholder="Respuesta correcta...">
               </div>
            </div>
          </div>

          <!-- PISTA Y DIFICULTAD -->
          <div class="ne-grid-2">
            <div class="ne-section">
              <label>Pista / Hint estratégico</label>
              <textarea 
                [(ngModel)]="tempNode.pista" 
                class="ne-textarea" 
                rows="2"
                placeholder="Pista sutil para ayudar al jugador...">
              </textarea>
            </div>
            <div class="ne-section">
              <label>Nivel de Dificultad</label>
              <select [(ngModel)]="tempNode.dificultad" class="ne-input ne-select">
                <option value="Aprendiz">Aprendiz</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
          </div>

          <!-- JUSTIFICACIONES -->
          <div class="ne-grid-2">
            <div class="ne-section">
              <label class="label-success">Justificación (Acierto)</label>
              <textarea 
                [(ngModel)]="tempNode.justificacion_correcta" 
                class="ne-textarea" 
                rows="3"
                placeholder="¿Por qué es correcto?">
              </textarea>
            </div>
            <div class="ne-section">
              <label class="label-error">Justificación (Fallo)</label>
              <textarea 
                [(ngModel)]="tempNode.justificacion_incorrecta" 
                class="ne-textarea" 
                rows="3"
                placeholder="¿Por qué es incorrecto?">
              </textarea>
            </div>
          </div>

        </div>

        <!-- FOOTER -->
        <div class="ne-footer">
          <button class="ne-btn-cancel" (click)="onClose.emit()">Descartar</button>
          <button class="ne-btn-save" (click)="handleSave()">
             <span>Sincronizar Nodo</span>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
               <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
             </svg>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .ne-overlay {
      position: fixed;
      inset: 0;
      background: var(--theme-shadow-soft); /* Usa la sombra del tema para el overlay */
      backdrop-filter: blur(28px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100001;
      animation: ne-fade-in 0.3s ease;
    }

    .ne-container {
      width: 720px;
      max-width: 95vw;
      background: var(--theme-surface-solid);
      border: 1px solid var(--theme-border);
      border-radius: 28px;
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      box-shadow: 0 40px 120px var(--theme-shadow-soft);
      animation: ne-reveal 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }

    /* HEADER */
    .ne-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .ne-header-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .ne-type-badge {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
      padding: 0.35rem 0.8rem;
      border-radius: 8px;
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.1em;
      font-family: 'JetBrains Mono', monospace;
    }

    .ne-title-wrap h2 {
      margin: 0;
      font-size: 1.2rem;
      color: var(--theme-text);
      font-family: 'Outfit', sans-serif;
    }

    .ne-subtitle {
      margin: 0;
      font-size: 0.75rem;
      color: var(--theme-text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .ne-close-btn {
      background: transparent;
      border: none;
      color: var(--theme-text-muted);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      display: flex;
      transition: all 0.2s;
    }
    .ne-close-btn:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
    .ne-close-btn svg { width: 22px; height: 22px; fill: currentColor; }

    /* BODY */
    .ne-body {
      padding: 2rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .scroll-custom::-webkit-scrollbar { width: 6px; }
    .scroll-custom::-webkit-scrollbar-track { background: transparent; }
    .scroll-custom::-webkit-scrollbar-thumb { 
      background: rgba(255, 255, 255, 0.05); 
      border-radius: 10px; 
    }
    .scroll-custom::-webkit-scrollbar-thumb:hover { 
      background: rgba(255, 255, 255, 0.1); 
    }

    .ne-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .ne-section label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--theme-text-muted);
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
    }

    .ne-grid-2 {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 1.5rem;
    }

    .ne-side-cols { display: flex; flex-direction: column; gap: 1.5rem; }

    /* INPUTS */
    .ne-textarea, .ne-input, .ne-select {
      width: 100%;
      background: var(--theme-input-bg);
      border: 1px solid var(--theme-border);
      border-radius: 14px;
      padding: 1rem;
      color: var(--theme-text);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      outline: none;
      transition: all 0.3s;
      resize: vertical;
      box-sizing: border-box;
    }

    .ne-textarea:focus, .ne-input:focus {
      border-color: rgba(159, 255, 34, 0.3);
      background: rgba(255, 255, 255, 0.04);
    }

    .ne-select {
      appearance: none;
      cursor: pointer;
      background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239F9F9F%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem top 50%;
      background-size: 0.65rem auto;
      padding-right: 2.5rem;
    }
    .ne-select option {
      background: var(--theme-surface-solid);
      color: var(--theme-text);
      padding: 0.5rem;
    }

    .ne-pregunta-input {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--theme-brand-neon);
      border-color: rgba(159, 255, 34, 0.2);
    }

    .ne-contexto-input {
      font-size: 0.85rem;
      line-height: 1.6;
      background: var(--theme-input-bg);
      border-color: var(--theme-border);
      color: var(--theme-text);
    }

    /* MOTOR TOGGLE */
    .ne-motor-toggle {
      background: var(--theme-input-bg);
      border: 1px solid var(--theme-border);
      border-radius: 16px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
    }

    .ne-motor-icon {
      width: 40px; height: 40px;
      background: rgba(128, 128, 128, 0.1);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s;
    }
    .ne-motor-icon svg { width: 22px; height: 22px; fill: var(--theme-text-muted); }

    .ne-motor-info { display: flex; flex-direction: column; flex: 1; }
    .ne-motor-name { font-size: 0.9rem; font-weight: 700; color: var(--theme-text); }
    .ne-motor-desc { font-size: 0.7rem; color: var(--theme-text-muted); }

    .ne-toggle-circle {
      width: 20px; height: 20px; border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.1);
      position: relative;
    }

    .ne-motor-toggle.ia-active {
      background: rgba(168, 85, 247, 0.08);
      border-color: rgba(168, 85, 247, 0.3);
    }
    .ne-motor-toggle.ia-active .ne-motor-icon { background: rgba(168, 85, 247, 0.2); }
    .ne-motor-toggle.ia-active .ne-motor-icon svg { fill: #c084fc; }
    .ne-motor-toggle.ia-active .ne-toggle-circle { border-color: #c084fc; background: #c084fc; box-shadow: 0 0 10px #c084fc; }

    .label-success { color: #4ade80 !important; opacity: 0.7 !important; }
    .label-error { color: #f87171 !important; opacity: 0.7 !important; }

    /* FOOTER */
    .ne-footer {
      padding: 1rem 1.75rem;
      background: rgba(128, 128, 128, 0.05);
      border-top: 1px solid var(--theme-border);
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 1rem;
    }

    .ne-btn-cancel {
      background: transparent;
      border: none;
      color: var(--theme-text-muted);
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      cursor: pointer;
      padding: 0.6rem 1rem;
      font-size: 0.85rem;
    }

    .ne-btn-save {
      background: var(--theme-brand-neon);
      border: none;
      border-radius: 10px;
      color: var(--theme-brand-btn-text);
      font-family: 'Outfit', sans-serif;
      padding: 0.6rem 1.25rem;
      font-size: 0.85rem;
      font-weight: 700;
      display: flex; align-items: center; gap: 0.6rem;
      cursor: pointer;
      transition: all 0.3s;
    }
    .ne-btn-save:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(159, 255, 34, 0.2); }
    .ne-btn-save svg { width: 16px; height: 16px; fill: currentColor; }

    /* ANIMATIONS */
    @keyframes ne-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes ne-reveal { 
      from { opacity: 0; transform: translateY(30px) scale(0.95); } 
      to { opacity: 1; transform: translateY(0) scale(1); } 
    }
  `]
})
export class NodeEditModalComponent implements OnInit {
  protected readonly MOTOR_ICONS = MOTOR_ICONS;

  @Input() node!: NodeChallenge;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<NodeChallenge>();

  tempNode!: NodeChallenge;

  ngOnInit() {
    // Clonación profunda básica para desvincular del original
    this.tempNode = JSON.parse(JSON.stringify(this.node));
  }

  handleSave() {
    this.onSave.emit(this.tempNode);
  }

  getTipoLabel(tipo: string): string {
    if (!tipo) return 'Desconocido';
    const key = tipo.toLowerCase().trim().replace(/ /g, '_');
    if (key.includes('single')) return 'Selección Única';
    if (key.includes('multi')) return 'Selección Múltiple';
    if (key.includes('cloze')) return 'Completar Espacios';
    if (key.includes('output')) return 'Predicción de Salida';
    if (key.includes('order')) return 'Ordenamiento Lógico';
    if (key.includes('anomaly')) return 'Detección de Anomalías';
    if (key.includes('optimiz')) return 'Optimización de Código';
    if (key.includes('case')) return 'Análisis de Casos';
    if (key.includes('feynman')) return 'Síntesis de Feynman';
    return tipo;
  }
}
