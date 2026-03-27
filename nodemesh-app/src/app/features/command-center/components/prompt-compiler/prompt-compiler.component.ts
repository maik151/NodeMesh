import { Component, EventEmitter, Output, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromptConfigV2, buildPromptV2, AuditorPersona, OutputLanguage } from '../../../../core/services/pipeline/prompt-templates.constants';
import { ThemeService } from '../../../../core/services/ui/theme.service';
import { DifficultyLevel } from '../../../../core/models/node.model';

@Component({
  selector: 'app-prompt-compiler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cc-modal-backdrop" (click)="onCancel.emit()">
      <div class="cc-modal compiler-modal" (click)="$event.stopPropagation()" style="width: 95%; max-width: 980px; max-height: 90vh; overflow-y: auto;">
        
        <header class="modal-header">
          <h3 class="modal-title">
            <!-- TERMINAL ICON -->
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M128,128a8,8,0,0,1-3,6.25l-40,32a8,8,0,1,1-10-12.5L107.19,128,75,102.25a8,8,0,1,1,10-12.5l40,32A8,8,0,0,1,128,128Zm48,24H136a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Zm56-96V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56ZM216,200V56H40V200H216Z"></path></svg>
            Compilador de PROMPT
          </h3>
          <button class="btn-close" (click)="onCancel.emit()" title="Cerrar">
            <!-- X ICON SVG (Phosphor X) -->
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
          </button>
        </header>
        
        <div class="modal-body compiler-layout">
          <!-- COLUMNA IZQUIERDA (Controles) -->
          <div class="compiler-controls">
            
            <div class="input-group">
                <label class="cc-label">Tema Central (Objetivo):</label>
                <input type="text" [(ngModel)]="compiler.tema" placeholder="Ej. Arquitectura Frontend React" class="cc-input" style="width: 100%; border-radius: 8px;">
            </div>
            
            <div class="row-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
              <div class="input-group">
                <label class="cc-label">Nivel de Complejidad:</label>
                <div class="custom-select-wrapper" [class.active-wrapper]="showNivelSelect" (click)="showNivelSelect = !showNivelSelect; showAuditorSelect=false; showIdiomaSelect=false; $event.stopPropagation()">
                  <div class="cc-select select-trigger" [class.active]="showNivelSelect">
                    <span>{{ getNivelLabel() }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" [style.transform]="showNivelSelect ? 'rotate(180deg)' : 'rotate(0)'" style="transition:0.2s; opacity:0.5; flex-shrink:0;"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm37.66-85.66a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L120,148.69V88a8,8,0,0,1,16,0v60.69l18.34-18.35A8,8,0,0,1,165.66,130.34Z"></path></svg>
                  </div>
                  <div class="select-dropdown" *ngIf="showNivelSelect">
                    <div class="select-option" *ngFor="let opt of niveles" (click)="compiler.nivel = opt.value; showNivelSelect = false; $event.stopPropagation()">
                      <span class="opt-label">{{ opt.label }}</span>
                      <span class="opt-desc">{{ opt.desc }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="input-group">
                <label class="cc-label">Número de Preguntas:</label>
                <div class="number-input-wrapper">
                  <button class="num-btn" (click)="compiler.totalPreguntas = compiler.totalPreguntas > 1 ? compiler.totalPreguntas - 1 : 1">−</button>
                  <input type="number" [(ngModel)]="compiler.totalPreguntas" min="1" max="100" class="cc-input no-arrows" style="width: 60px; text-align: center; border-radius: 8px; font-weight: 800; font-size: 1rem;">
                  <button class="num-btn" (click)="compiler.totalPreguntas = compiler.totalPreguntas < 100 ? compiler.totalPreguntas + 1 : 100">+</button>
                </div>
              </div>
            </div>

            <div class="row-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
              <div class="input-group">
                <label class="cc-label">Personalidad del Auditor:</label>
                <div class="custom-select-wrapper" [class.active-wrapper]="showAuditorSelect" (click)="showAuditorSelect = !showAuditorSelect; showNivelSelect=false; showIdiomaSelect=false; $event.stopPropagation()">
                  <div class="cc-select select-trigger" [class.active]="showAuditorSelect">
                    <span>{{ getAuditorLabel() }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 256 256" [style.transform]="showAuditorSelect ? 'rotate(180deg)' : 'rotate(0)'" style="transition:0.2s; opacity:0.5; flex-shrink:0;"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm37.66-85.66a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L120,148.69V88a8,8,0,0,1,16,0v60.69l18.34-18.35A8,8,0,0,1,165.66,130.34Z"></path></svg>
                  </div>
                  <div class="select-dropdown" *ngIf="showAuditorSelect">
                    <div class="select-option" *ngFor="let opt of auditores" (click)="compiler.auditor = opt.value; showAuditorSelect = false; $event.stopPropagation()">
                      <span class="opt-label">{{ opt.label }}</span>
                      <span class="opt-desc">{{ opt.desc }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="input-group">
                <label class="cc-label">Idioma Salida:</label>
                <div class="custom-select-wrapper" [class.active-wrapper]="showIdiomaSelect" (click)="showIdiomaSelect = !showIdiomaSelect; showNivelSelect=false; showAuditorSelect=false; $event.stopPropagation()">
                  <div class="cc-select select-trigger" [class.active]="showIdiomaSelect">
                    <span>{{ getIdiomaLabel() }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 256 256" [style.transform]="showIdiomaSelect ? 'rotate(180deg)' : 'rotate(0)'" style="transition:0.2s; opacity:0.5; flex-shrink:0;"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm37.66-85.66a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L120,148.69V88a8,8,0,0,1,16,0v60.69l18.34-18.35A8,8,0,0,1,165.66,130.34Z"></path></svg>
                  </div>
                  <div class="select-dropdown" *ngIf="showIdiomaSelect">
                    <div class="select-option" *ngFor="let opt of idiomas" (click)="compiler.idioma = opt.value; showIdiomaSelect = false; $event.stopPropagation()">
                      <span class="opt-label">{{ opt.label }}</span>
                      <span class="opt-desc">{{ opt.desc }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- MATRIZ -->
            <div class="matrix-container" style="margin-top: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <label class="cc-label" style="margin: 0;">Matriz de Preguntas:</label>
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <span [style.color]="matrixSum === compiler.totalPreguntas ? 'var(--theme-brand-neon)' : '#ff4444'" style="font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 0.9rem;">
                    {{ matrixSum }} / {{ compiler.totalPreguntas }}
                  </span>
                  <button class="btn-aleatorio" (click)="distribuirAzar()" title="Distribuir preguntas aleatoriamente">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M48,64a8,8,0,0,1,8-8H72V40a8,8,0,0,1,16,0V56h16a8,8,0,0,1,0,16H88V88a8,8,0,0,1-16,0V72H56A8,8,0,0,1,48,64ZM184,192h-8v-8a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16Zm56-48H224V128a8,8,0,0,0-16,0v16H192a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V160h16a8,8,0,0,0,0-16ZM219.31,80,80,219.31a16,16,0,0,1-22.62,0L36.68,198.63a16,16,0,0,1,0-22.63L176,36.69a16,16,0,0,1,22.63,0l20.68,20.68A16,16,0,0,1,219.31,80Zm-54.63,32L144,91.31l-96,96L68.68,208ZM208,68.69,187.31,48l-32,32L176,100.69Z"></path></svg>
                    Aleatorio
                  </button>
                </div>
              </div>
              
              <div class="matrix-grid-v2">
                <div class="matrix-item" *ngFor="let key of matrixKeys">
                  <div class="matrix-label-row">
                    <span class="matrix-key-label">{{ getMatrixLabel(key) }}</span>
                    <div class="matrix-tooltip-wrapper">
                      <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a16,16,0,1,1,16,16A16,16,0,0,1,112,84Z"></path></svg>
                      <div class="matrix-tooltip">
                        <strong>{{ getMatrixLabel(key) }}</strong>
                        <p>{{ getMatrixDescription(key) }}</p>
                      </div>
                    </div>
                  </div>
                  <input type="number" min="0" [(ngModel)]="compiler.matrix[key]" class="cc-input mini no-arrows">
                </div>
              </div>
            </div>

            <!-- TOGGLES -->
            <div class="toggle-cards-row" style="margin-top: 1.25rem;">
               <div class="toggle-card" [class.toggle-active]="compiler.adjuntarDocs" (click)="compiler.adjuntarDocs = !compiler.adjuntarDocs">
                 <div class="toggle-card-top">
                   <span class="toggle-card-title">Adjuntar Docs</span>
                   <label class="toggle-switch" (click)="$event.stopPropagation()">
                     <input type="checkbox" [(ngModel)]="compiler.adjuntarDocs">
                     <span class="slider"></span>
                   </label>
                 </div>
                 <span class="toggle-card-desc">¿Adjuntar documentación técnica externa para mayor contexto y precisión?</span>
               </div>
               <div class="toggle-card" [class.toggle-active]="compiler.incluirPistas" (click)="compiler.incluirPistas = !compiler.incluirPistas">
                 <div class="toggle-card-top">
                   <span class="toggle-card-title">Incluir Pistas</span>
                   <label class="toggle-switch" (click)="$event.stopPropagation()">
                     <input type="checkbox" [(ngModel)]="compiler.incluirPistas">
                     <span class="slider"></span>
                   </label>
                 </div>
                 <span class="toggle-card-desc">¿Generar pistas socráticas para guiar al estudiante sin revelar la respuesta?</span>
               </div>
               <div class="toggle-card" [class.toggle-active]="compiler.forzarJsonRaw" (click)="compiler.forzarJsonRaw = !compiler.forzarJsonRaw">
                 <div class="toggle-card-top">
                   <span class="toggle-card-title">JSON RAW</span>
                   <label class="toggle-switch" (click)="$event.stopPropagation()">
                     <input type="checkbox" [(ngModel)]="compiler.forzarJsonRaw">
                     <span class="slider"></span>
                   </label>
                 </div>
                 <span class="toggle-card-desc">¿Omitir el bloque \`\`\`json y devolver texto plano sin formato markdown?</span>
               </div>
            </div>
          </div>

          <!-- COLUMNA DERECHA (Preview) -->
          <div class="compiler-preview">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 0.5rem; min-height: 36px;">
               <button *ngIf="isCompilerValid" class="btn-copier" (click)="copyPromptBtn()" [class.copied]="isCopied">
                 <span class="copy-state" [class.hidden-state]="isCopied">
                   <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 256 256"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path></svg>
                   Copiar
                 </span>
                 <span class="copy-state success-state" [class.visible-state]="isCopied">
                   <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path></svg>
                   Copiado
                 </span>
               </button>
            </div>
            <div class="preview-container">
               <textarea class="preview-textarea" readonly [value]="livePromptPreview"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cc-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.88); backdrop-filter: blur(12px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; animation: fadeIn 0.25s ease; }
    .cc-modal { background: #0e0e10; border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 1.5rem 2rem; position: relative; animation: slideUp 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.1); font-size: 11px; }

    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; }
    .modal-title { color: var(--theme-brand-neon); display: flex; align-items: center; gap: 0.65rem; font-size: 1.35rem; font-weight: 900; letter-spacing: -0.5px; margin: 0; font-family: 'JetBrains Mono', monospace; }

    .btn-close {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.5);
      width: 32px; height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .btn-close:hover { background: rgba(255,68,68,0.15); border-color: rgba(255,68,68,0.4); color: #ff6b6b; }

    .compiler-layout { display: grid; grid-template-columns: 1.15fr 1fr; gap: 2.5rem; }
    .cc-label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 800; color: var(--theme-text-secondary); margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.75; }
    .cc-input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: var(--theme-text); padding: 0.5rem 0.7rem; font-size: 0.8rem; border-radius: 8px; transition: 0.2s; font-family: 'JetBrains Mono', monospace; }
    .cc-input:focus { border-color: var(--theme-brand-neon); outline: none; background: rgba(159, 255, 34, 0.04); }
    .no-arrows::-webkit-inner-spin-button, .no-arrows::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    .no-arrows[type=number] { -moz-appearance: textfield; }

    .custom-select-wrapper { position: relative; cursor: pointer; }
    .select-trigger { display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.6rem 0.8rem; font-size: 0.85rem; font-weight: 600; background: rgba(255,255,255,0.03); font-family: 'JetBrains Mono', monospace; color: var(--theme-text); transition: 0.2s; }
    .select-trigger:hover { border-color: rgba(255,255,255,0.2); }
    .select-trigger.active { border-color: var(--theme-brand-neon); background: rgba(159, 255, 34, 0.04); }
    .select-dropdown { position: absolute; top: calc(100% + 4px); left: 0; width: 100%; background: #17181c; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; z-index: 100; box-shadow: 0 16px 40px rgba(0,0,0,0.6); overflow: hidden; }
    .select-option { padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04); transition: 0.15s; cursor: pointer; }
    .select-option:last-child { border-bottom: none; }
    .select-option:hover { background: rgba(159, 255, 34, 0.08); }
    .opt-label { font-weight: 700; display: block; font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; color: var(--theme-text); }
    .opt-desc { font-size: 0.7rem; opacity: 0.55; color: var(--theme-text-secondary); margin-top: 0.15rem; display: block; }

    /* MATRIX */
    .matrix-grid-v2 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; }
    .matrix-item { display: flex; flex-direction: column; gap: 0.35rem; }
    .matrix-label-row { display: flex; align-items: center; justify-content: space-between; gap: 0.3rem; }
    .matrix-key-label { font-size: 0.6rem; font-weight: 800; color: var(--theme-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; font-family: 'JetBrains Mono', monospace; opacity: 0.65; }
    .info-icon { opacity: 0.3; cursor: help; flex-shrink: 0; transition: opacity 0.2s; }
    .matrix-tooltip-wrapper { position: relative; display: flex; }
    .matrix-tooltip-wrapper:hover .info-icon { opacity: 0.8; }
    .matrix-tooltip {
      display: none;
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: #1a1d24;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 0.65rem 0.85rem;
      min-width: 200px;
      max-width: 240px;
      z-index: 200;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    .matrix-tooltip strong { display: block; font-size: 0.75rem; font-weight: 800; color: var(--theme-brand-neon); text-transform: uppercase; letter-spacing: 0.5px; font-family: 'JetBrains Mono', monospace; margin-bottom: 0.3rem; }
    .matrix-tooltip p { font-size: 0.72rem; line-height: 1.5; color: var(--theme-text-secondary); margin: 0; opacity: 0.85; }
    .matrix-tooltip-wrapper:hover .matrix-tooltip { display: block; animation: fadeIn 0.15s ease; }
    .cc-input.mini { text-align: center; font-weight: 800; font-family: 'JetBrains Mono', monospace; width: 100%; font-size: 1rem; }

    /* AZAR BUTTON */
    .btn-aleatorio {
      display: inline-flex; align-items: center; gap: 0.4rem;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: var(--theme-text-secondary);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem; font-weight: 700;
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .btn-aleatorio:hover { background: rgba(159, 255, 34, 0.1); border-color: rgba(159, 255, 34, 0.3); color: var(--theme-brand-neon); }

    /* NUMBER STEPPER */
    .number-input-wrapper { display: flex; align-items: center; gap: 0.5rem; }
    .num-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--theme-text); width: 30px; height: 30px; border-radius: 6px; cursor: pointer; font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: all 0.15s ease; flex-shrink: 0; }
    .num-btn:hover { background: rgba(159,255,34,0.1); border-color: rgba(159,255,34,0.3); color: var(--theme-brand-neon); }

    /* TOGGLE CARDS */
    .toggle-cards-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem; }
    .toggle-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 0.75rem; cursor: pointer; transition: all 0.2s ease; }
    .toggle-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.12); }
    .toggle-card.toggle-active { background: rgba(159,255,34,0.06); border-color: rgba(159,255,34,0.25); }
    .toggle-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
    .toggle-card-title { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: var(--theme-text); }
    .toggle-active .toggle-card-title { color: var(--theme-brand-neon); }
    .toggle-card-desc { font-size: 0.68rem; line-height: 1.45; color: var(--theme-text-secondary); opacity: 0.6; display: block; }
    .compiler-preview { display: flex; flex-direction: column; gap: 0.5rem; height: 100%; }    .toggle-switch { position: relative; width: 44px; height: 22px; cursor: pointer; flex-shrink: 0; display: inline-block; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
    .slider { 
      position: absolute; inset: 0; 
      background: rgba(255,255,255,0.06); 
      border-radius: 100px; 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
      border: 1.5px solid rgba(255,255,255,0.1);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
    }
    .slider:before { 
      position: absolute; content: ""; 
      height: 14px; width: 14px; 
      left: 4px; top: 50%;
      transform: translateY(-50%);
      background: #fff; 
      border-radius: 50%; 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    input:checked + .slider { 
      background: var(--theme-brand-neon); 
      border-color: rgba(255,255,255,0.2);
      box-shadow: 0 0 12px rgba(159, 255, 34, 0.3), inset 0 1px 2px rgba(255,255,255,0.2);
    }
    input:checked + .slider:before { 
      left: 26px; /* 44 - 14 - 4 = 26 */
    }
    :host-context([data-theme="light"]) .slider { background: #e2e8f0; border-color: #cbd5e1; box-shadow: inset 0 1px 3px rgba(0,0,0,0.08); }
    :host-context([data-theme="light"]) input:checked + .slider { background: #6aad1c; border-color: #598c00; box-shadow: 0 2px 8px rgba(106, 173, 28, 0.2); }
    :host-context([data-theme="light"]) input:checked + .slider:before { background: #fff; box-shadow: -1px 0 3px rgba(0,0,0,0.1); }
    /* COPY BUTTON */
    .btn-copier {
      position: relative; overflow: hidden;
      display: inline-flex; align-items: center; gap: 0.4rem;
      background: transparent;
      border: none;
      color: var(--theme-text-secondary);
      font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; font-weight: 700;
      padding: 0.4rem 0.9rem;
      border-radius: 8px; cursor: pointer;
      transition: all 0.2s ease;
      min-width: 105px; height: 34px;
    }
    .btn-copier:hover { background: rgba(255,255,255,0.05); color: var(--theme-text); }
    .btn-copier.copied { background: transparent; color: var(--theme-brand-neon); pointer-events: none; }
    .copy-state { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 0.4rem; transition: opacity 0.25s ease, transform 0.25s ease; opacity: 1; transform: scale(1); }
    .copy-state.hidden-state { opacity: 0; transform: scale(0.85); }
    .success-state { opacity: 0; transform: scale(0.85); color: var(--theme-brand-neon); }
    .success-state.visible-state { opacity: 1; transform: scale(1); }

    .preview-container { flex: 1; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; background: rgba(255,255,255,0.015); padding: 1rem; }
    .preview-textarea { width: 100%; height: 100%; min-height: 480px; background: transparent; border: none; color: #71717a; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; resize: none; outline: none; line-height: 1.6; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    
    /* ===== LIGHT MODE ===== */
    :host-context([data-theme="light"]) .cc-modal-backdrop { background: rgba(100,100,120,0.45); }
    :host-context([data-theme="light"]) .cc-modal { background: #f4f5f7; border-color: #d1d5db; }
    :host-context([data-theme="light"]) .modal-header { border-bottom-color: #d1d5db; }
    :host-context([data-theme="light"]) .modal-title { color: #3a7d0a; }
    :host-context([data-theme="light"]) .cc-label { color: #5a6272; }
    :host-context([data-theme="light"]) .cc-input { background: #ffffff; border-color: #d1d5db; color: #1a1a2e; }
    :host-context([data-theme="light"]) .cc-input:focus { border-color: #3a7d0a; background: #f0fce8; }
    :host-context([data-theme="light"]) .select-trigger { background: #ffffff; border-color: #d1d5db; color: #1a1a2e; }
    :host-context([data-theme="light"]) .select-dropdown { background: #fff; border-color: #d1d5db; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    :host-context([data-theme="light"]) .opt-label { color: #1a1a2e; }
    :host-context([data-theme="light"]) .opt-desc { color: #5a6272; }
    :host-context([data-theme="light"]) .select-option:hover { background: #f0fce8; }
    :host-context([data-theme="light"]) .matrix-grid-v2 { background: #ffffff; border-color: #d1d5db; }
    :host-context([data-theme="light"]) .matrix-key-label { color: #5a6272; }
    :host-context([data-theme="light"]) .matrix-tooltip { background: #fff; border-color: #d1d5db; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    :host-context([data-theme="light"]) .matrix-tooltip strong { color: #3a7d0a; }
    :host-context([data-theme="light"]) .matrix-tooltip p { color: #5a6272; }
    :host-context([data-theme="light"]) .num-btn { background: #f4f5f7; border-color: #d1d5db; color: #1a1a2e; }
    :host-context([data-theme="light"]) .num-btn:hover { background: #f0fce8; border-color: #3a7d0a; color: #3a7d0a; }
    :host-context([data-theme="light"]) .toggle-card { background: #ffffff; border-color: #d1d5db; }
    :host-context([data-theme="light"]) .toggle-card:hover { background: #f9fafb; border-color: #b1b8c4; }
    :host-context([data-theme="light"]) .toggle-card.toggle-active { background: #f0fce8; border-color: #6aad1c; }
    :host-context([data-theme="light"]) .toggle-card-title { color: #1a1a2e; }
    :host-context([data-theme="light"]) .toggle-active .toggle-card-title { color: #3a7d0a; }
    :host-context([data-theme="light"]) .toggle-card-desc { color: #5a6272; }
    :host-context([data-theme="light"]) .slider { background: #d1d5db; }
    :host-context([data-theme="light"]) .preview-textarea { color: #52525b; }
    :host-context([data-theme="light"]) .preview-container { background: #ffffff; border-color: #d1d5db; }
    :host-context([data-theme="light"]) .btn-close { color: #5a6272; background: #ffffff; border-color: #d1d5db; }
    :host-context([data-theme="light"]) .btn-close:hover { background: rgba(220,53,69,0.1); border-color: rgba(220,53,69,0.3); color: #dc3545; }
    :host-context([data-theme="light"]) .btn-aleatorio { color: #5a6272; background: #fff; border-color: #d1d5db; }
    :host-context([data-theme="light"]) .btn-aleatorio:hover { background: #f0fce8; border-color: #6aad1c; color: #3a7d0a; }
    :host-context([data-theme="light"]) .btn-copier { color: #5a6272; }
    :host-context([data-theme="light"]) .btn-copier.copied { color: #3a7d0a; }
  `]
})
export class PromptCompilerComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly themeService = inject(ThemeService);
  isDark$ = this.themeService.isDark$;

  @Output() onCancel = new EventEmitter<void>();

  showNivelSelect = false;
  showAuditorSelect = false;
  showIdiomaSelect = false;
  isCopied = false;

  compiler: PromptConfigV2 = {
    tema: '',
    nivel: 'Intermedio',
    totalPreguntas: 50,
    auditor: 'Socrático',
    idioma: 'Español',
    tagsExtra: '',
    adjuntarDocs: false,
    incluirPistas: false,
    forzarJsonRaw: false,
    matrix: { single_choice: 10, cloze_deletion: 10, ordering: 10, optimization: 5, feynman_synthesis: 5, multi_choice: 2, output_prediction: 4, anomaly_detection: 2, case_analysis: 2 }
  };

  niveles: { value: DifficultyLevel, label: string, desc: string }[] = [
    { value: 'Aprendiz', label: 'Junior', desc: 'Preguntas de retención teórica directa y conceptos básicos.' },
    { value: 'Intermedio', label: 'Medium', desc: 'Preguntas de aplicación práctica en contextos reales y casos de uso.' },
    { value: 'Senior', label: 'Senior', desc: 'Preguntas de diseño de sistemas, arquitectura profunda y performance.' }
  ];

  auditores: { value: AuditorPersona, label: string, desc: string }[] = [
    { value: 'Socrático', label: 'Socrático', desc: 'Te guía a la respuesta con pistas lógicas deductivas y analogías.' },
    { value: 'Implacable', label: 'Implacable', desc: 'Estilo revisión de código en GitHub, directo y al grano. Evalúa rudo.' },
    { value: 'Académico', label: 'Académico', desc: 'Cita documentación oficial, RFCs y principios computacionales rigurosos.' }
  ];

  idiomas: { value: OutputLanguage, label: string, desc: string }[] = [
    { value: 'Español', label: 'Español', desc: 'El prompt output será generado en Castellano/Español.' },
    { value: 'Inglés', label: 'English', desc: 'Generates the rigorous structured prompt internally in English.' }
  ];

  get matrixKeys() { return Object.keys(this.compiler.matrix) as (keyof typeof this.compiler.matrix)[]; }

  getNivelLabel() { return this.niveles.find(n => n.value === this.compiler.nivel)?.label || 'Seleccionar...'; }
  getAuditorLabel() { return this.auditores.find(a => a.value === this.compiler.auditor)?.label || 'Seleccionar...'; }
  getIdiomaLabel() { return this.idiomas.find(i => i.value === this.compiler.idioma)?.label || 'Seleccionar...'; }

  get matrixSum(): number { return Object.values(this.compiler.matrix).reduce((a, b) => a + (b || 0), 0); }
  get isCompilerValid(): boolean { return this.compiler.tema.trim().length > 0 && this.matrixSum === this.compiler.totalPreguntas; }
  get livePromptPreview(): string {
    return this.isCompilerValid ? buildPromptV2(this.compiler) : 'Ajusta la suma de la matriz para que sea igual al total de preguntas, y asegúrate de ingresar el tema.';

  }

  distribuirAzar() {
    const keys = this.matrixKeys;
    keys.forEach(k => this.compiler.matrix[k] = 0);
    let remaining = this.compiler.totalPreguntas;
    while(remaining > 0) {
      this.compiler.matrix[keys[Math.floor(Math.random() * keys.length)]]++;
      remaining--;
    }
  }

  @HostListener('document:click')
  closeDropdowns() { this.showNivelSelect = false; this.showAuditorSelect = false; this.showIdiomaSelect = false; }

  copyPromptBtn() {
    if (!this.isCompilerValid) return;
    navigator.clipboard.writeText(this.livePromptPreview);
    this.isCopied = true;
    this.cdr.detectChanges();
    setTimeout(() => { this.isCopied = false; this.cdr.detectChanges(); }, 2500);
  }

  getMatrixLabel(key: string): string {
    const labels: Record<string, string> = {
      single_choice: 'Single Choice',
      cloze_deletion: 'Cloze Deletion',
      ordering: 'Ordering',
      optimization: 'Optimization',
      feynman_synthesis: 'Feynman Synthesis',
      multi_choice: 'Multi Choice',
      output_prediction: 'Output Prediction',
      anomaly_detection: 'Anomaly Detection',
      case_analysis: 'Case Analysis'
    };
    return labels[key] ?? key.replace(/_/g, ' ');
  }

  getMatrixDescription(key: string): string {
    const descriptions: Record<string, string> = {
      single_choice: 'El estudiante debe elegir UNA respuesta correcta entre varias opciones. Ideal para evaluar si dominan un concepto concreto y pueden descartar distractores.',
      cloze_deletion: 'Completar el espacio en blanco de un código o definición. Refuerza la memoria activa y la retención de sintaxis o conceptos clave.',
      ordering: 'Ordenar pasos de un proceso, ciclo de vida o algoritmo. Evalúa si el estudiante comprende la secuencia lógica de ejecución.',
      optimization: 'Dado un fragmento de código, identificar o aplicar una mejora de rendimiento o legibilidad. Evalúa pensamiento crítico y refactorización.',
      feynman_synthesis: 'Explicar un concepto complejo con palabras simples, como si se lo explicaras a alguien que no sabe nada. Evalúa comprensión profunda.',
      multi_choice: 'Múltiples respuestas pueden ser correctas. Evalúa matices del conocimiento y la capacidad de identificar combinaciones válidas.',
      output_prediction: 'Dado un fragmento de código, predecir qué imprime o qué valor retorna. Evalúa razonamiento y lectura de código.',
      anomaly_detection: 'Identificar el bug, anti-patrón o error conceptual en un fragmento de código. Evalúa capacidad de debugging y revisión de código.',
      case_analysis: 'Analizar un escenario de arquitectura o diseño de sistema y proponer o evaluar la solución. Evalúa pensamiento de alto nivel.'
    };
    return descriptions[key] ?? 'Tipo de pregunta para evaluar el conocimiento del estudiante.';
  }
}
