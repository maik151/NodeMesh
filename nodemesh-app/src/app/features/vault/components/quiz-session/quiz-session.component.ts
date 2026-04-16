import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NodeChallenge, QuizSession, ChallengeType } from '../../../../core/models/node.model';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { ToastService } from '../../../../core/services/ui/toast.service';
import { LayoutService } from '../../../../core/services/ui/layout.service';
import { TYPE_ICONS, UI_ICONS } from '../../../../shared/constants/icons.constants';

interface NodeState {
  userAnswer: string | string[];
  isCorrect: boolean | null;
  showFeedback: boolean;
  failedOptions: string[]; 
  history: { selection: string; feedback: string; isCorrect: boolean }[];
  wrongAttempts: number; 
}

interface SM2Impact {
  streakDays: number;
  avgDisplacement: number;
  degradedCount: number;
}

const TIPO_MAP: Record<string, { label: string }> = {
  single_choice:    { label: 'Selección Única' },
  multi_choice:     { label: 'Selección Múltiple' },
  cloze_deletion:   { label: 'Completar Espacios' },
  output_prediction:{ label: 'Predicción de Salida' },
  ordering:         { label: 'Ordenamiento Lógico' },
  anomaly_detection:{ label: 'Detección de Anomalías' },
  optimization:     { label: 'Optimización de Código' },
  case_analysis:    { label: 'Análisis de Casos' },
  feynman_synthesis:{ label: 'Síntesis de Feynman' },
};

@Component({
  selector: 'app-quiz-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="qs-shell">
      <div class="qs-container" *ngIf="!isFinished; else finishedState">
        
        <header class="qs-header">
          <div class="qs-header-left">
            <button 
              class="qs-exit-btn-alt" 
              [class.confirming]="isConfirmingExit"
              (click)="handleExit()" 
              [title]="isConfirmingExit ? 'Clic de nuevo para confirmar' : 'Salir'">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                <path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z"/>
              </svg>
              <span>{{ isConfirmingExit ? '¡Confirmar Salida!' : 'Salir' }}</span>
            </button>
            <div class="qs-quiz-info-set">
              <div class="qs-quiz-icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                  <path d="M96,104a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H104A8,8,0,0,1,96,104Zm8,40h64a8,8,0,0,0,0-16H104a8,8,0,0,0,0,16Zm128,48a32,32,0,0,1-32,32H88a32,32,0,0,1-32-32V64a16,16,0,0,0-32,0c0,5.74,4.83,9.62,4.88,9.66h0A8,8,0,0,1,24,88a7.89,7.89,0,0,1-4.79-1.61h0C18.05,85.54,8,77.61,8,64A32,32,0,0,1,40,32H176a32,32,0,0,1,32,32V168h8a8,8,0,0,1,4.8,1.6C222,170.46,232,178.39,232,192ZM96.26,173.48A8.07,8.07,0,0,1,104,168h88V64a16,16,0,0,0-16-16H67.69A31.71,31.71,0,0,1,72,64V192a16,16,0,0,0,32,0c0-5.74-4.83-9.62-4.88-9.66A7.82,7.82,0,0,1,96.26,173.48ZM216,192a12.58,12.58,0,0,0-3.23-8h-94a26.92,26.92,0,0,1,1.21,8,31.82,31.82,0,0,1-4.29,16H200A16,16,0,0,0,216,192Z"/>
                </svg>
              </div>
              <h1 class="qs-quiz-title-alt">{{ quiz.titulo_quiz }}</h1>
            </div>
          </div>

          <div class="qs-header-right">
            <div class="qs-widget">
              <div class="qs-widget-main">
                <span class="qs-val">{{ answeredCount }}/{{ nodes.length }}</span>
                <span class="qs-lbl">Nodos</span>
              </div>
              <div class="qs-widget-prog-track">
                <div class="qs-widget-prog-fill" [style.width.%]="progress"></div>
              </div>
            </div>

            <div class="qs-widget">
              <div class="qs-widget-main">
                <span class="qs-val">{{ scorePercent }}%</span>
                <span class="qs-lbl">Precisión</span>
              </div>
              <div class="qs-widget-prog-track">
                <div class="qs-widget-prog-fill" [style.width.%]="scorePercent" style="background: var(--theme-brand-neon); box-shadow: 0 0 15px var(--theme-brand-neon);"></div>
              </div>
            </div>

            <div class="qs-widget">
              <div class="qs-widget-main">
                <span class="qs-val">{{ timerLabel }}</span>
                <span class="qs-lbl">Tiempo</span>
              </div>
            </div>
          </div>
        </header>

        <div class="qs-content-layout">
          <main class="qs-main-scroll">
            <div class="qs-exam-list">
            
            <ng-container *ngFor="let node of visibleNodes; let i = index">
              <div class="qs-node-block" [id]="'node-' + node.id">
                <div class="qs-node-num">#{{ (currentPage * pageSize) + i + 1 }}</div>
                
                <div class="qs-node-body">
                  <div class="qs-node-meta">
                    <div class="qs-meta-left">
                      <div class="qs-type-badge">
                        <svg class="qs-type-icon" viewBox="0 0 256 256">
                          <path [attr.d]="getSafeIcon(node.tipo_reto)"/>
                        </svg>
                        <span class="qs-type-tag">{{ getTypeName(node.tipo_reto) }}</span>
                      </div>
                      
                      <div class="qs-hint-wrap" *ngIf="node.pista">
                        <button class="qs-hint-trigger">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                            <path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.5C39.74,56.83,78.26,17.15,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.64,71.64,0,0,0,27.64,56.3h0A32,32,0,0,1,96,186v6h24V147.31L90.34,117.66a8,8,0,0,1,11.32-11.32L128,132.69l26.34-26.35a8,8,0,0,1,11.32,11.32L136,147.31V192h24v-6a32.12,32.12,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Z"/>
                          </svg>
                          <span>Pista</span>
                        </button>
                        <div class="qs-hint-glass">
                           <p>{{ node.pista }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 class="qs-question">{{ node.pregunta }}</h3>
                  
                  <div class="qs-snippet-box" *ngIf="node.contexto">
                    <code>{{ node.contexto }}</code>
                  </div>

                  <div class="qs-interaction-box">
                    <div class="qs-options-v" *ngIf="isChoiceType(node)">
                      <button 
                        *ngFor="let opt of node.opciones"
                        class="qs-opt-row"
                        [class.is-selected]="isSelected(node, opt)"
                        [class.is-failed]="nodeStates[node.id!].failedOptions.includes(opt)"
                        [class.reveal-correct]="isNodeSolved(node.id!) && isOptionCorrect(node, opt)"
                        (click)="selectOption(node, opt)"
                        [disabled]="isFinished || isNodeSolved(node.id!) || nodeStates[node.id!].failedOptions.includes(opt)">
                        <div class="qs-mark"></div>
                        {{ opt }}
                      </button>
                    </div>

                    <div class="qs-history-log" *ngIf="nodeStates[node.id!].history.length > 0">
                       <div *ngFor="let h of nodeStates[node.id!].history" 
                            class="qs-log-entry" 
                            [class.is-correct]="h.isCorrect">
                          <span class="log-mark">{{ h.isCorrect ? '✓' : '✗' }}</span>
                          <span class="log-txt">{{ h.feedback }}</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="qs-divider" *ngIf="i < visibleNodes.length - 1"></div>
            </ng-container>

            <footer class="qs-exam-footer">
              <div class="qs-progress-bar">
                 <div class="qs-prog-fill" [style.width.%]="progress"></div>
              </div>
              <div class="qs-pag-controls">
                <button class="qs-btn-nav" [disabled]="currentPage === 0" (click)="changePage(-1)">← Anterior</button>
                <span class="qs-page-info">Pág {{ currentPage + 1 }} de {{ totalPages }}</span>
                <button class="qs-btn-nav" *ngIf="!isLastPage" (click)="changePage(1)">Siguiente →</button>
              </div>
            </footer>

            </div>
          </main>

          <!-- SIDEBAR: ESQUEMA DE PREGUNTAS -->
          <aside class="qs-map-sidebar">
            <div class="qs-map-header">
              <svg class="qs-map-icon" viewBox="0 0 256 256">
                <path [attr.d]="UI_ICONS.quiz_map"/>
              </svg>
              <h3>Esquema de Preguntas</h3>
            </div>

            <div class="qs-map-grid scroll-custom">
              <div 
                *ngFor="let node of nodes; let i = index" 
                class="qs-map-item"
                [class.is-correct]="nodeStates[node.id!]?.isCorrect === true"
                [class.is-wrong]="nodeStates[node.id!]?.isCorrect === false"
                [class.is-current]="isCurrentNode(i)"
                [title]="'Pregunta ' + (i + 1)">
                
                <div class="qs-map-status-icon">
                  <svg *ngIf="nodeStates[node.id!]?.isCorrect === null" viewBox="0 0 256 256">
                    <circle cx="128" cy="128" r="16" fill="currentColor" opacity="0.3"></circle>
                  </svg>
                  <svg *ngIf="nodeStates[node.id!]?.isCorrect === true" viewBox="0 0 256 256">
                    <path [attr.d]="UI_ICONS.success"></path>
                  </svg>
                  <svg *ngIf="nodeStates[node.id!]?.isCorrect === false" viewBox="0 0 256 256">
                    <path [attr.d]="UI_ICONS.error"></path>
                  </svg>
                </div>
                <span class="qs-map-num">{{ i + 1 }}</span>
              </div>
            </div>
            
            <button class="qs-finish-btn-sidebar" *ngIf="isLastPage" (click)="finishQuiz()">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm36.44-94.66-48-32A8,8,0,0,0,104,96v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,145.05V111l25.58,17Z"></path></svg>
              Finalizar
            </button>
          </aside>
        </div>
      </div>

    <ng-template #finishedState>
        <div class="qs-final-results">
          
          <header class="fr-header">
            <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
               <path d="M243.28,68.24l-24-23.56a16,16,0,0,0-22.59,0L104,136.23l-36.69-35.6a16,16,0,0,0-22.58.05l-24,24a16,16,0,0,0,0,22.61l71.62,72a16,16,0,0,0,22.63,0L243.33,90.91A16,16,0,0,0,243.28,68.24ZM103.62,208,32,136l24-24a.6.6,0,0,1,.08.08l42.35,41.09a8,8,0,0,0,11.19,0L208.06,56,232,79.6Z"/>
            </svg>
            <h1>Resultados</h1>
          </header>

          <div class="fr-bento-card">
            <!-- ROW 1: Big KPIs -->
            <div class="fr-row-top">
              <div class="fr-cell">
                <div class="fr-circle" [style.--percent]="scorePercent" [class.success]="scorePercent >= 80" [class.warning]="scorePercent < 80 && scorePercent >= 50" [class.fail]="scorePercent < 50">
                  <div class="fr-circle-inner">
                    <span class="fr-big">{{ scorePercent }}%</span>
                  </div>
                </div>
                <div class="fr-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M248,124a56.11,56.11,0,0,0-32-50.61V72a48,48,0,0,0-88-26.49A48,48,0,0,0,40,72v1.39a56,56,0,0,0,0,101.2V176a48,48,0,0,0,88,26.49A48,48,0,0,0,216,176v-1.41A56.09,56.09,0,0,0,248,124ZM88,208a32,32,0,0,1-31.81-28.56A55.87,55.87,0,0,0,64,180h8a8,8,0,0,0,0-16H64A40,40,0,0,1,50.67,86.27,8,8,0,0,0,56,78.73V72a32,32,0,0,1,64,0v68.26A47.8,47.8,0,0,0,88,128a8,8,0,0,0,0,16,32,32,0,0,1,0,64Zm104-44h-8a8,8,0,0,0,0,16h8a55.87,55.87,0,0,0,7.81-.56A32,32,0,1,1,168,144a8,8,0,0,0,0-16,47.8,47.8,0,0,0-32,12.26V72a32,32,0,0,1,64,0v6.73a8,8,0,0,0,5.33,7.54A40,40,0,0,1,192,164Zm16-52a8,8,0,0,1-8,8h-4a36,36,0,0,1-36-36V80a8,8,0,0,1,16,0v4a20,20,0,0,0,20,20h4A8,8,0,0,1,208,112ZM60,120H56a8,8,0,0,1,0-16h4A20,20,0,0,0,80,84V80a8,8,0,0,1,16,0v4A36,36,0,0,1,60,120Z"></path></svg>
                  <span>Porcentaje de<br>Acierto</span>
                </div>
              </div>
              <div class="fr-cell">
                <span class="fr-big">{{ timerLabelCentered }}</span>
                <div class="fr-time-bar">
                  <div class="fr-time-fill" [style.width.%]="progress"></div>
                </div>
                <div class="fr-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm0,176a80,80,0,1,1,80-80A80.09,80.09,0,0,1,128,216ZM61.66,37.66l-32,32A8,8,0,0,1,18.34,58.34l32-32A8,8,0,0,1,61.66,37.66Zm176,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,237.66,69.66ZM184,128a8,8,0,0,1,0,16H128a8,8,0,0,1-8-8V80a8,8,0,0,1,16,0v48Z"></path></svg>
                  <span>Tiempo de<br>Enfoque</span>
                </div>
              </div>
              <div class="fr-cell">
                <span class="fr-big">{{ answeredCount }}/{{ nodes.length }}</span>
                <div class="fr-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M200,152a31.84,31.84,0,0,0-19.53,6.68l-23.11-18A31.65,31.65,0,0,0,160,128c0-.74,0-1.48-.08-2.21l13.23-4.41A32,32,0,1,0,168,104c0,.74,0,1.48.08,2.21l-13.23,4.41A32,32,0,0,0,128,96a32.59,32.59,0,0,0-5.27.44L115.89,81A32,32,0,1,0,96,88a32.59,32.59,0,0,0,5.27-.44l6.84,15.4a31.92,31.92,0,0,0-8.57,39.64L73.83,165.44a32.06,32.06,0,1,0,10.63,12l25.71-22.84a31.91,31.91,0,0,0,37.36-1.24l23.11,18A31.65,31.65,0,0,0,168,184a32,32,0,1,0,32-32Zm0-64a16,16,0,1,1-16,16A16,16,0,0,1,200,88ZM80,56A16,16,0,1,1,96,72,16,16,0,0,1,80,56ZM56,208a16,16,0,1,1,16-16A16,16,0,0,1,56,208Zm56-80a16,16,0,1,1,16,16A16,16,0,0,1,112,128Zm88,72a16,16,0,1,1,16-16A16,16,0,0,1,200,200Z"></path></svg>
                  <span>Nodos<br>Resueltos</span>
                </div>
              </div>
            </div>

            <!-- ROW 2: Sub KPIs -->
            <div class="fr-row-bottom">
              <div class="fr-cell-sm">
                <span class="fr-med">{{ displacementLabel }}</span>
                <div class="fr-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88v64a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm59.16,30.45L152,176h16a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136,23.76,23.76,0,0,1,171.16,150.45Z"></path></svg>
                  <span>Próximo<br>Repaso</span>
                </div>
              </div>
              <div class="fr-cell-sm">
                <span class="fr-med">{{ avgTimePerNode }} seg</span>
                <div class="fr-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M215.79,118.17a8,8,0,0,0-5-5.66L153.18,90.9l14.66-73.33a8,8,0,0,0-13.69-7l-112,120a8,8,0,0,0,3,13l57.63,21.61L88.16,238.43a8,8,0,0,0,13.69,7l112-120A8,8,0,0,0,215.79,118.17ZM109.37,214l10.47-52.38a8,8,0,0,0-5-9.06L62,132.71l84.62-90.66L136.16,94.43a8,8,0,0,0,5,9.06l52.8,19.8Z"></path></svg>
                  <span>Tiempo Promedio<br>por Nodo</span>
                </div>
              </div>
              <div class="fr-cell-sm badge" [class]="performanceBadge.cssClass">
                <div class="fr-label badge-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path [attr.d]="performanceBadge.icon"></path></svg>
                  <span [innerHTML]="performanceBadge.label"></span>
                </div>
              </div>
            </div>
          </div>

          <div class="fr-actions">
            <button class="fr-btn primary" (click)="onClose.emit()">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg>
              Finalizar Sesión
            </button>
            <button class="fr-btn" (click)="repeatQuiz()">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"/></svg>
               Volver a Repasar
            </button>
          </div>

        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .qs-shell { width: 100%; height: 100%; background: var(--theme-bg); color: var(--theme-text); display: flex; flex-direction: column; animation: qs-fade-in 0.3s ease; text-align: left; font-family: 'JetBrains Mono', monospace; }
    .qs-container { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; background: var(--theme-bg-base); }

    .qs-content-layout {
      position: relative;
      display: flex;
      flex: 1;
      height: calc(100vh - 80px);
      width: 100%;
      overflow: hidden;
    }

    .qs-header { 
      height: 80px; 
      padding: 0 2rem; 
      border-bottom: 1px solid var(--theme-border); 
      background: var(--theme-header-bg, rgba(255,255,255,0.02)); 
      backdrop-filter: blur(12px); 
      -webkit-backdrop-filter: blur(12px); 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      z-index: 100; 
      position: sticky; 
      top: 0; 
      flex-shrink: 0; 
    }
    .qs-header-left { display: flex; align-items: center; gap: 1.5rem; min-width: 0; flex: 1; }
    .qs-exit-btn-alt { background: transparent; border: none; color: var(--theme-text-muted); padding:0; display: flex; align-items: center; gap: 0.6rem; cursor: pointer; transition: 0.2s; font-family: 'JetBrains Mono'; font-size: 0.85rem; flex-shrink: 0; }
    .qs-exit-btn-alt:hover { color: #f87171; transform: translateX(-2px); }
    .qs-exit-btn-alt.confirming { color: #ff6b6b; background: rgba(255, 107, 107, 0.1); padding: 4px 12px; border-radius: 8px; font-weight: 800; border: 1px solid rgba(255, 107, 107, 0.2); }
    .qs-exit-btn-alt svg { width: 22px; height: 22px; fill: currentColor; }
    .qs-quiz-info-set { display: flex; align-items: center; gap: 0.75rem; min-width: 0; flex: 1; }
    .qs-quiz-icon-wrap { flex-shrink: 0; }
    .qs-quiz-icon-wrap svg { width: 32px; height: 32px; fill: var(--theme-text); opacity: 0.6; }
    .qs-quiz-title-alt { font-size: 1.1rem; font-weight: 500; margin: 0; color: var(--theme-text); letter-spacing: -0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .qs-header-right { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
    .qs-widget { height: 52px; min-width: 90px; background: var(--theme-surface); border: 1px solid var(--theme-border); border-radius: 8px; display: flex; flex-direction: column; position: relative; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .qs-widget-main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 1rem; }
    .qs-widget .qs-val { font-size: 1rem; font-weight: 600; color: var(--theme-text); line-height: 1; }
    .qs-widget .qs-lbl { font-size: 0.55rem; text-transform: uppercase; color: var(--theme-text-muted); margin-top: 3px; letter-spacing: 0.05em; }
    .qs-widget-prog-track { height:3px; background: rgba(0,0,0,0.05); width: 100%; position: absolute; bottom: 0; }
    .qs-widget-prog-fill { height: 100%; background: var(--theme-brand-neon); transition: width 0.4s ease; box-shadow: 0 0 10px var(--theme-brand-neon); }

    .qs-main-scroll { 
      flex: 1; 
      overflow-y: auto; 
      padding: 1.5rem 3rem; 
      scroll-behavior: smooth; 
    }

    /* MAP FLOATING CARD (PREMIUM) */
    .qs-map-sidebar {
      position: absolute;
      top: 1.5rem;
      right: 2rem;
      width: 260px;
      background: rgba(18, 18, 22, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
      z-index: 1000;
      transition: all 0.3s ease;
      animation: qs-slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    :host-context([data-theme="light"]) .qs-map-sidebar {
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(0, 0, 0, 0.1);
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    }

    .qs-map-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
      color: var(--theme-text);
      opacity: 0.9;
    }

    .qs-map-header h3 {
      font-size: 1rem;
      margin: 0;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .qs-map-icon {
      width: 22px;
      height: 22px;
      fill: currentColor;
    }

    .qs-map-grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 0.5rem;
      align-content: start;
      max-height: 400px;
      overflow-y: auto;
      overflow-x: hidden;
      padding-right: 4px;
    }

    .qs-map-item {
      aspect-ratio: 1/1.2;
      background: rgba(150, 150, 150, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.3rem;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }

    :host-context([data-theme="light"]) .qs-map-item {
      background: rgba(0, 0, 0, 0.05);
      border-color: rgba(0, 0, 0, 0.05);
      color: #777;
    }

    .qs-map-item.is-correct {
      background: #86db00;
      border-color: #9fff22;
      color: #000;
      box-shadow: 0 4px 15px rgba(134, 219, 0, 0.4);
    }

    .qs-map-item.is-wrong {
      background: #ff4444;
      border-color: #ff6b6b;
      color: #fff;
      box-shadow: 0 4px 15px rgba(255, 68, 68, 0.4);
    }

    .qs-finish-btn-sidebar {
      margin-top: 1rem;
      background: var(--theme-brand-neon);
      color: var(--theme-surface-solid);
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-family: inherit;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      transition: all 0.2s ease;
      animation: qs-slide-up 0.4s ease both;
    }
    .qs-finish-btn-sidebar:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(134, 219, 0, 0.4);
    }
    .qs-finish-btn-sidebar svg {
      width: 20px;
      height: 20px;
    }

    .qs-map-item.is-current {
      border-color: #86db00;
      background: rgba(134, 219, 0, 0.05);
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    }

    :host-context([data-theme="light"]) .qs-map-item.is-current {
      background: rgba(134, 219, 0, 0.1);
      border-color: #86db00;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .qs-map-status-icon {
      width: 26px;
      height: 26px;
    }

    .qs-map-status-icon svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }

    .qs-map-num {
      font-size: 0.72rem;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
    }

    .qs-map-item.is-correct .qs-map-num,
    .qs-map-item.is-wrong .qs-map-num {
       opacity: 1;
    }

    .qs-exam-list { 
      width: 100%;
      max-width: 1100px;
      display: flex; 
      flex-direction: column; 
      gap: 2.5rem; 
      margin: 0; 
      padding-left: 2rem;
      padding-right: 320px; 
      transition: all 0.3s ease;
    }

    @media (max-width: 1400px) {
      .qs-exam-list { padding-right: 0; }
      .qs-map-sidebar { 
        position: relative; 
        top: 0; 
        right: 0; 
        width: 100%; 
        margin-bottom: 2rem; 
        box-shadow: none;
        backdrop-filter: none;
        background: rgba(255,255,255,0.03);
      }
    }
    .qs-node-block { display: flex; gap: 1.5rem; animation: qs-slide-up 0.4s ease; }
    .qs-node-num { font-size: 1.1rem; font-weight: 800; color: var(--theme-text); opacity: 0.15; margin-top: 0.2rem; }
    .qs-node-body { flex: 1; display: flex; flex-direction: column; gap: 0.8rem; }
    .qs-type-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 4px 10px; background: rgba(192, 132, 252, 0.08); border-radius: 6px; border: 1px solid rgba(192, 132, 252, 0.2); }
    .qs-type-icon { width: 13px; height: 13px; fill: #c084fc; }
    .qs-type-tag { font-size: 0.65rem; text-transform: uppercase; font-weight: 800; color: #c084fc; }

    .qs-hint-wrap { position: relative; display: inline-flex; }
    .qs-hint-trigger { background: transparent; border: 1px solid var(--theme-border); color: var(--theme-text-muted); padding: 4px 10px; border-radius: 6px; display: flex; align-items: center; gap: 0.4rem; font-size: 0.65rem; text-transform: uppercase; font-weight: 800; cursor: default; transition: all 0.2s; font-family: inherit; }
    .qs-hint-wrap:hover .qs-hint-trigger { color: #facc15; border-color: rgba(250, 204, 21, 0.4); background: rgba(250, 204, 21, 0.05); }
    .qs-hint-trigger svg { width: 14px; height: 14px; fill: currentColor; }
    .qs-hint-glass { position: absolute; top: calc(100% + 8px); left: 0; width: 280px; padding: 1rem; background: rgba(30, 30, 34, 0.95); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); box-shadow: 0 10px 40px rgba(0,0,0,0.5); opacity: 0; pointer-events: none; transform: translateY(10px); transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); z-index: 50; }
    .qs-hint-wrap:hover .qs-hint-glass { opacity: 1; pointer-events: auto; transform: translateY(0); }
    .qs-hint-glass p { font-size: 0.85rem; color: #e9ecef; margin: 0; line-height: 1.5; font-style: italic; }
    :host-context([data-theme="light"]) .qs-hint-glass { background: rgba(255, 255, 255, 0.95); border-color: rgba(0, 0, 0, 0.1); }
    :host-context([data-theme="light"]) .qs-hint-glass p { color: #333; }
    .qs-question { font-size: 1.05rem; font-weight: 400; line-height: 1.5; margin: 0; }

    .qs-opt-row { background: var(--theme-input-bg); border: 1px solid var(--theme-border); border-radius: 12px; padding: 0.7rem 1.2rem; font-size: 0.85rem; display: flex; align-items: center; gap: 0.8rem; width: 100%; text-align: left; cursor: pointer; transition: all 0.2s; color: var(--theme-text); margin-bottom: 0.5rem; }
    .qs-opt-row:hover:not(:disabled) { border-color: var(--theme-brand-neon); background: rgba(159, 255, 34, 0.03); }
    .qs-opt-row.is-selected { border-color: var(--theme-brand-neon); background: rgba(159, 255, 34, 0.08); }
    .qs-opt-row.is-failed { border-color: #ef4444; background: rgba(239, 68, 68, 0.03); }
    .qs-mark { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--theme-text-muted); flex-shrink: 0; }
    .is-selected .qs-mark { background: var(--theme-brand-neon); border-color: var(--theme-brand-neon); }
    .is-failed .qs-mark { background: #ef4444; border-color: #ef4444; }

    .qs-history-log { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .qs-log-entry { display: flex; gap: 0.75rem; padding: 0.75rem 1rem; background: rgba(255,255,255,0.02); border-radius: 8px; border-left: 3px solid #f87171; font-size: 0.8rem; }
    .qs-log-entry.is-correct { border-left-color: var(--theme-brand-neon); background: rgba(134, 219, 0, 0.03); }

    /* ================= BENTO GRID RESULTS ================= */
    .qs-final-results {
      background: #09090b;
      flex: 1;
      width: 100%;
      height: 100%;
      padding: 2.5rem 3rem;
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: qs-fade-in 0.4s ease;
    }
    
    .fr-header {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      margin-bottom: 2rem;
      align-self: flex-start;
    }
    .fr-header svg { width: 22px; height: 22px; fill: white; }
    .fr-header h1 {
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.2rem;
      font-weight: 500;
      letter-spacing: -0.5px;
      margin: 0;
    }

    .fr-bento-card {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 24px;
      padding: 2.5rem 2.8rem;
      max-width: 700px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .fr-row-top {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1.5rem;
      align-items: center;
      justify-items: center;
    }
    .fr-row-bottom {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1.5rem;
      align-items: center;
      justify-items: center;
      border-top: 1px solid rgba(255,255,255,0.06);
      padding-top: 1.8rem;
    }

    .fr-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.6rem;
    }
    .fr-cell-sm {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.5rem;
    }

    .fr-circle {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      background: conic-gradient(var(--theme-brand-neon) calc(var(--percent) * 1%), rgba(255,255,255,0.06) 0);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .fr-circle.success { background: conic-gradient(#9fff22 calc(var(--percent) * 1%), rgba(255,255,255,0.06) 0); box-shadow: 0 0 30px rgba(159, 255, 34, 0.12); }
    .fr-circle.warning { background: conic-gradient(#fbbf24 calc(var(--percent) * 1%), rgba(255,255,255,0.06) 0); }
    .fr-circle.fail { background: conic-gradient(#ef4444 calc(var(--percent) * 1%), rgba(255,255,255,0.06) 0); }
    .fr-circle::before {
      content: ""; position: absolute; inset: 9px; background: #0d0d0f; border-radius: 50%;
    }
    .fr-circle-inner { position: relative; z-index: 2; }

    .fr-big {
      font-size: 2.4rem;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 400;
      letter-spacing: -1px;
      color: white;
    }
    .fr-med {
      font-size: 1.7rem;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 400;
      letter-spacing: -0.5px;
      color: white;
    }

    .fr-time-bar {
      width: 100%;
      height: 4px;
      background: rgba(255,255,255,0.06);
      border-radius: 4px;
      overflow: hidden;
    }
    .fr-time-fill {
      height: 100%;
      background: var(--theme-brand-neon);
      border-radius: 4px;
      transition: width 0.4s ease;
      box-shadow: 0 0 8px rgba(159, 255, 34, 0.3);
    }

    .fr-label {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.62rem;
      font-weight: 400;
      color: rgba(255,255,255,0.55);
      line-height: 1.35;
    }
    .fr-label svg { fill: rgba(255,255,255,0.45); flex-shrink: 0; }

    .fr-cell-sm.badge {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 0.7rem 1.2rem;
      justify-content: center;
      align-items: center;
      min-height: 56px;
    }
    .fr-cell-sm.badge-danger { background: rgba(239, 68, 68, 0.12); border-color: rgba(239, 68, 68, 0.3); }
    .fr-cell-sm.badge-danger .fr-label { color: rgba(239, 68, 68, 0.9); }
    .fr-cell-sm.badge-danger .fr-label svg { fill: rgba(239, 68, 68, 0.7); }
    .fr-cell-sm.badge-warn { background: rgba(212, 175, 55, 0.12); border-color: rgba(212, 175, 55, 0.3); }
    .fr-cell-sm.badge-warn .fr-label { color: rgba(212, 175, 55, 0.85); }
    .fr-cell-sm.badge-warn .fr-label svg { fill: rgba(212, 175, 55, 0.7); }
    .fr-cell-sm.badge-ok { background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.25); }
    .fr-cell-sm.badge-ok .fr-label { color: rgba(96, 165, 250, 0.9); }
    .fr-cell-sm.badge-ok .fr-label svg { fill: rgba(96, 165, 250, 0.7); }
    .fr-cell-sm.badge-good { background: rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.25); }
    .fr-cell-sm.badge-good .fr-label { color: rgba(74, 222, 128, 0.9); }
    .fr-cell-sm.badge-good .fr-label svg { fill: rgba(74, 222, 128, 0.7); }
    .fr-cell-sm.badge-elite { background: rgba(168, 85, 247, 0.12); border-color: rgba(168, 85, 247, 0.3); }
    .fr-cell-sm.badge-elite .fr-label { color: rgba(192, 132, 252, 0.9); }
    .fr-cell-sm.badge-elite .fr-label svg { fill: rgba(192, 132, 252, 0.7); }
    .badge-label { justify-content: center; text-align: center; }
    .badge-label span { text-align: center; }

    /* ============ LIGHT MODE ============ */
    :host-context([data-theme="light"]) .qs-final-results { background: #f8fafc; color: #1a1a2e; }
    :host-context([data-theme="light"]) .fr-header svg { fill: #1a1a2e; }
    :host-context([data-theme="light"]) .fr-header h1 { color: #1a1a2e; }
    :host-context([data-theme="light"]) .fr-bento-card { background: #fff; border-color: #e2e8f0; }
    :host-context([data-theme="light"]) .fr-big { color: #1a1a2e; }
    :host-context([data-theme="light"]) .fr-med { color: #1a1a2e; }
    :host-context([data-theme="light"]) .fr-label { color: #64748b; }
    :host-context([data-theme="light"]) .fr-label svg { fill: #94a3b8; }
    :host-context([data-theme="light"]) .fr-row-bottom { border-top-color: #e2e8f0; }
    :host-context([data-theme="light"]) .fr-circle::before { background: #fff; }
    :host-context([data-theme="light"]) .fr-time-bar { background: #e2e8f0; }
    :host-context([data-theme="light"]) .fr-btn { background: #fff; border-color: #e2e8f0; color: #1a1a2e; }
    :host-context([data-theme="light"]) .fr-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
    :host-context([data-theme="light"]) .fr-btn.primary { background: var(--theme-brand-neon); color: #000; border-color: transparent; }
    :host-context([data-theme="light"]) .fr-cell-sm.badge { background: #f1f5f9; border-color: #e2e8f0; }

    .fr-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
      padding-top: 2rem;
    }

    .fr-btn {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      font-weight: 500;
      color: white;
      padding: 0.55rem 1.2rem;
      border-radius: 10px;
      cursor: pointer;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.12);
      transition: all 0.25s ease;
    }
    .fr-btn svg { width: 16px; height: 16px; fill: currentColor; }
    .fr-btn:hover {
      background: rgba(255,255,255,0.08);
      border-color: rgba(255,255,255,0.25);
      transform: translateY(-1px);
    }
    .fr-btn.primary {
      background: var(--theme-brand-neon);
      color: #000;
      border-color: transparent;
      font-weight: 600;
    }
    .fr-btn.primary:hover {
      box-shadow: 0 6px 20px rgba(159, 255, 34, 0.2);
      transform: translateY(-2px);
    }

    .qs-exam-footer { border-top: 1px solid var(--theme-border); padding-top: 2rem; display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
    .qs-pag-controls { display: flex; align-items: center; gap: 1rem; }
    
    .qs-finish-btn {
      background: var(--theme-brand-neon); 
      color: #000; 
      border: none; 
      padding: 0.6rem 1.4rem; 
      border-radius: 10px; 
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.95rem;
      font-weight: 600; 
      letter-spacing: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 20px rgba(159, 255, 34, 0);
    }
    .qs-finish-btn:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 25px rgba(159, 255, 34, 0.2);
    }
    .qs-finish-btn svg { width: 20px; height: 20px; fill: currentColor; }

    @keyframes qs-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes qs-slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class QuizSessionComponent implements OnInit, OnDestroy {
  @Input() quiz!: QuizSession;
  @Input() nodes: NodeChallenge[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onFinished = new EventEmitter<void>();

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);
  private readonly db = inject(DatabaseService);
  private readonly layoutService = inject(LayoutService);
  readonly ICONS = TYPE_ICONS;
  protected readonly UI_ICONS = UI_ICONS;

  currentPage = 0;
  pageSize = 10;
  isFinished = false;
  isVerified = false;
  isCopied = false;
  impactSummary: SM2Impact = { streakDays: 0, avgDisplacement: 0, degradedCount: 0 };
  totalCorrect = 0;
  secondsElapsed = 0;
  private timerInterval: any;
  nodeStates: { [nodeId: number]: NodeState } = {};
  hintsVisible: { [nodeId: number]: boolean } = {};
  isConfirmingExit = false;
  private exitTimeout: any;

  isCurrentNode(index: number): boolean {
    // Determine which node is currently "active" in the scroll view or focus.
    // For now, we simple highlight the active page's items if relevant.
    return false; // Gray out everything unless answered or finished.
  }

  ngOnInit() {
    // Ensuring it always collapses on start
    this.layoutService.setExpanded(false);
    this.initNodeStates();
    this.startTimer();
  }

  ngOnDestroy() {
    this.stopTimer();
    if (this.exitTimeout) clearTimeout(this.exitTimeout);
  }

  private initNodeStates() {
    this.nodeStates = {};
    this.nodes.forEach(n => {
      this.nodeStates[n.id!] = {
        userAnswer: this.isChoiceType(n) ? [] : '',
        isCorrect: null,
        showFeedback: false,
        failedOptions: [],
        history: [],
        wrongAttempts: 0
      };
      this.hintsVisible[n.id!] = false;
    });
    this.totalCorrect = 0;
    this.isFinished = false;
  }

  private startTimer() {
    this.timerInterval = setInterval(() => {
      this.secondsElapsed++;
      this.cdr.detectChanges();
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  get timerLabel(): string {
    const m = Math.floor(this.secondsElapsed / 60);
    const s = this.secondsElapsed % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  get avgTimePerNode(): number {
    const answered = this.answeredCount;
    if (answered === 0) return 0;
    return Math.round(this.secondsElapsed / answered);
  }
  
  get timerLabelCentered(): string {
     const m = Math.floor(this.secondsElapsed / 60);
     const s = this.secondsElapsed % 60;
     return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  get displacementLabel(): string {
    const d = this.impactSummary.avgDisplacement;
    if (d <= 0) return 'Inmediato';
    if (d < 1) return '< 1 Día';
    if (d === 1) return '1 Día';
    return `+${d} Días`;
  }

  get performanceBadge(): { label: string; cssClass: string; icon: string } {
    const score = this.scorePercent;
    const degraded = this.impactSummary.degradedCount;
    const total = this.nodes.length;
    // Trophy icon
    const iconTrophy = 'M232,64H208V48a8,8,0,0,0-8-8H56a8,8,0,0,0-8,8V64H24A8,8,0,0,0,16,72V96a40,40,0,0,0,40,40h.5A95.89,95.89,0,0,0,120,163.94V200H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V163.94A95.89,95.89,0,0,0,199.5,136H200a40,40,0,0,0,40-40V72A8,8,0,0,0,232,64ZM56,120A24,24,0,0,1,32,96V80H48v32a96.15,96.15,0,0,0,.91,13.05A24,24,0,0,1,56,120Zm88,28a80,80,0,0,1-80-80V56H192v12A80,80,0,0,1,144,148Zm80-52a24,24,0,0,1-16.91,22.88A96.15,96.15,0,0,0,208,112V80h16Z';
    // Fire icon
    const iconFire = 'M143.38,17.85a8,8,0,0,0-12.63,3.41l-22,60.41L84.59,58.26a8,8,0,0,0-11.93,2.17C51.53,93.8,40,119.92,40,148a88,88,0,0,0,176,0C216,82.14,168.49,36.78,143.38,17.85ZM128,220a72.08,72.08,0,0,1-72-72c0-22,8.09-44.12,24.08-65.74l26.19,26.18a8,8,0,0,0,13.09-2.89l22.42-61.57C167.44,64.82,200,100.66,200,148A72.08,72.08,0,0,1,128,220Z';
    // Star icon
    const iconStar = 'M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59.46-5.15,23.21-55.36a16.4,16.4,0,0,1,28.5,0l23.21,55.36L224.92,86a16.46,16.46,0,0,1,9.37,28.86Z';
    // Rocket icon
    const iconRocket = 'M152,224a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,224Zm73.69-126.19a8,8,0,0,1-2.63,4.25l-28.42,24.47A155.59,155.59,0,0,1,200,148a8,8,0,0,1-16,0,139.22,139.22,0,0,0-5.06-19.55l-9.09,7.83A96.48,96.48,0,0,1,176,168a8,8,0,0,1-16,0,80.28,80.28,0,0,0-4.35-26.14L128,166l-27.65-24.14A80.28,80.28,0,0,0,96,168a8,8,0,0,1-16,0,96.48,96.48,0,0,1,5.15-31.72l-9.09-7.83A139.22,139.22,0,0,0,72,148a8,8,0,0,1-16,0,155.59,155.59,0,0,1,5.36-21.47L33,102.06a8,8,0,0,1,5.34-13.87l47,4.07L111.56,47.8A8,8,0,0,1,118.4,44h19.2a8,8,0,0,1,6.84,3.8l26.24,44.46,47,4.07a8,8,0,0,1,5.34,13.87Z';
    // Chart up icon
    const iconChart = 'M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V156.69l50.34-50.35a8,8,0,0,1,11.32,0L128,132.69,180.69,80H160a8,8,0,0,1,0-16h40a8,8,0,0,1,8,8v40a8,8,0,0,1-16,0V91.31l-58.34,58.35a8,8,0,0,1-11.32,0L96,123.31,40,179.31V200H224A8,8,0,0,1,232,208Z';
    // Warning icon
    const iconWarn = 'M128,72a8,8,0,0,1,8,8v56a8,8,0,0,1-16,0V80A8,8,0,0,1,128,72ZM116,172a12,12,0,1,0,12-12A12,12,0,0,0,116,172Zm124-44a15.85,15.85,0,0,1-4.67,11.28l-96.05,96.06a16,16,0,0,1-22.56,0h0l-96-96.06a16,16,0,0,1,0-22.56l96.05-96.06a16,16,0,0,1,22.56,0l96.05,96.06A15.85,15.85,0,0,1,240,128Zm-16,0L128,32,32,128,128,224h0Z';
    // Skull icon
    const iconSkull = 'M128,16a88.1,88.1,0,0,0-88,88c0,23.43,9.07,49,24.18,68.24C77.78,190.18,96,203.79,96,224a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8c0-20.21,18.22-33.82,31.82-51.76C206.93,153,216,127.43,216,104A88.1,88.1,0,0,0,128,16ZM112,216a62.76,62.76,0,0,0-7.34-24h46.68A62.76,62.76,0,0,0,144,216ZM92,152a20,20,0,1,1,20-20A20,20,0,0,1,92,152Zm72,0a20,20,0,1,1,20-20A20,20,0,0,1,164,152Z';
    // ArrowDown icon  
    const iconDown = 'M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z';

    if (score === 100 && degraded === 0) return { label: 'Dominio<br>Total', cssClass: 'fr-cell-sm badge badge-elite', icon: iconTrophy };
    if (score >= 90)                     return { label: 'Memoria<br>de Acero', cssClass: 'fr-cell-sm badge badge-elite', icon: iconFire };
    if (score >= 80)                     return { label: 'Nivel<br>Maestro', cssClass: 'fr-cell-sm badge badge-good', icon: iconStar };
    if (score >= 70)                     return { label: 'Buen<br>Progreso', cssClass: 'fr-cell-sm badge badge-good', icon: iconRocket };
    if (score >= 50)                     return { label: 'En<br>Desarrollo', cssClass: 'fr-cell-sm badge badge-ok', icon: iconChart };
    if (score >= 35)                     return { label: 'Fase de<br>Adaptación', cssClass: 'fr-cell-sm badge badge-warn', icon: iconWarn };
    if (score >= 15)                     return { label: 'Requiere<br>Refuerzo', cssClass: 'fr-cell-sm badge badge-danger', icon: iconDown };
    if (degraded >= total && total > 0)  return { label: 'Reseteo<br>Cognitivo', cssClass: 'fr-cell-sm badge badge-danger', icon: iconSkull };
    return { label: 'Nivel<br>Principiante', cssClass: 'fr-cell-sm badge badge-danger', icon: iconDown };
  }

  get progress(): number {
    if (!this.nodes.length) return 0;
    return Math.round((this.answeredCount / this.nodes.length) * 100);
  }

  get answeredCount(): number {
    return Object.values(this.nodeStates).filter(s => s.isCorrect !== null).length;
  }

  get scorePercent(): number {
    let answered = 0;
    let wrong = 0;
    for (const node of this.nodes) {
      const state = this.nodeStates[node.id!];
      if (state.isCorrect !== null) {
        answered++;
        wrong += state.wrongAttempts;
      }
    }
    if (answered === 0) return 0;
    return Math.round((answered / (answered + wrong)) * 100);
  }

  get pendingCount(): number {
    return this.nodes.length - this.answeredCount;
  }

  get totalPages(): number {
    return Math.ceil(this.nodes.length / this.pageSize);
  }

  get visibleNodes(): NodeChallenge[] {
    const start = this.currentPage * this.pageSize;
    return this.nodes.slice(start, start + this.pageSize);
  }

  get isLastPage(): boolean {
    return this.currentPage >= this.totalPages - 1;
  }

  onAnswerChange() {
    this.cdr.detectChanges();
  }

  changePage(delta: number) {
    this.currentPage += delta;
    this.cdr.detectChanges();
    const container = document.querySelector('.qs-main-scroll');
    if (container) container.scrollTop = 0;
  }

  private normalizeType(tipo: string): string {
    if (!tipo) return '';
    return tipo.toLowerCase().trim().replace(/ /g, '_');
  }

  isChoiceType(node: NodeChallenge): boolean {
    const t = this.normalizeType(node.tipo_reto);
    return t.includes('single') || t.includes('multi') || t.includes('order');
  }

  isInputType(node: NodeChallenge): boolean {
    const t = this.normalizeType(node.tipo_reto);
    return t.includes('output') || t.includes('cloze');
  }

  isNodeSolved(nodeId: number): boolean {
    const state = this.nodeStates[nodeId];
    return state.history.some(h => h.isCorrect);
  }

  selectOption(node: NodeChallenge, opt: string) {
    if (this.isFinished) return;
    const state = this.nodeStates[node.id!];
    if (this.isNodeSolved(node.id!)) return;
    
    const type = this.normalizeType(node.tipo_reto);

    if (type.includes('single')) {
      const isCorrect = this.isOptionCorrect(node, opt);
      
      if (isCorrect) {
        state.userAnswer = opt;
        if (state.isCorrect === null) {
          state.isCorrect = true;
          this.totalCorrect++;
        }
        state.history.push({
          selection: opt,
          feedback: node.retroalimentaciones_opciones?.[opt] || '¡Correcto! Respuesta sincronizada.',
          isCorrect: true
        });
      } else {
        state.userAnswer = opt;
        if (state.isCorrect === null) state.isCorrect = false;
        state.failedOptions.push(opt);
        state.wrongAttempts++;
        const feedback = node.retroalimentaciones_opciones?.[opt] || 'Esta opción no es la correcta para este reto. Analiza los requerimientos de nuevo.';
        state.history.push({
          selection: opt,
          feedback: feedback,
          isCorrect: false
        });
      }
    } else {
      // MULTI CHOICE LOGIC: One wrong click = failure
      const isCorrect = this.isOptionCorrect(node, opt);
      const current = state.userAnswer as string[];

      if (!isCorrect) {
        // Instant failure on first bad click
        if (state.isCorrect === null) state.isCorrect = false;
        state.wrongAttempts++;
        state.failedOptions.push(opt);
        state.history.push({
          selection: opt,
          feedback: node.retroalimentaciones_opciones?.[opt] || 'Error crítico: Opción incorrecta detectada en selección múltiple.',
          isCorrect: false
        });
      } else {
        // Check if selected
        const idx = current.indexOf(opt);
        if (idx > -1) {
          current.splice(idx, 1);
        } else {
          current.push(opt);
          // Check if all correct ones are selected
          const expected = node.respuesta_esperada as string[];
          if (current.length === expected.length) {
            // Verify all selected are correct (double check)
            const allMatch = current.every(o => expected.includes(o));
            if (allMatch) {
              if (state.isCorrect === null) {
                state.isCorrect = true;
                this.totalCorrect++;
              }
              state.history.push({
                selection: current.join(', '),
                feedback: '¡Excelente! Has identificado todos los elementos correctamente.',
                isCorrect: true
              });
            }
          }
        }
      }
    }
    this.onAnswerChange();
  }

  isSelected(node: NodeChallenge, opt: string): boolean {
    const val = this.nodeStates[node.id!].userAnswer;
    if (Array.isArray(val)) return val.includes(opt);
    return val === opt;
  }

  isOptionCorrect(node: NodeChallenge, opt: string): boolean {
    const expected = node.respuesta_esperada;
    if (Array.isArray(expected)) return expected.includes(opt);
    return expected === opt;
  }

  toggleHint(nodeId: number) {
    this.hintsVisible[nodeId] = !this.hintsVisible[nodeId];
  }

  async finishQuiz() {
    this.stopTimer();
    this.isFinished = true;

    if (!this.quiz) return;

    this.impactSummary = { streakDays: 0, avgDisplacement: 0, degradedCount: 0 };

    const now = new Date();

    const updatedQuiz: QuizSession = {
      ...this.quiz,
      ultimo_repaso: now,
      estadisticas_globales: {
        intentos: (this.quiz.estadisticas_globales?.intentos || 0) + 1,
        ultimo_score_porcentaje: this.scorePercent
      }
    };

    try {
      await this.db.saveQuiz(updatedQuiz);

      let totalDisp = 0;
      let correctC = 0;
      let degradC = 0;

      for (const node of this.nodes) {
        const state = this.nodeStates[node.id!];
        if (!state) continue;

        // Calcular el intervalo previo extraído desde el quiz
        let previousInterval = 1;
        if (node.nextReviewDate && this.quiz.ultimo_repaso) {
          const prevDate = new Date(node.nextReviewDate);
          const lastReview = new Date(this.quiz.ultimo_repaso);
          if (prevDate > lastReview) {
            previousInterval = Math.max(1, Math.round((prevDate.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24)));
          }
        } else if (node.nextReviewDate) {
          // Si no hay ultimo_repaso, calcula de su creacion (Fallback)
          const prevDate = new Date(node.nextReviewDate);
          const created = node.createdAt ? new Date(node.createdAt) : now;
          previousInterval = Math.max(1, Math.round((prevDate.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
        }

        let intervalDays = 1;

        if (state.isCorrect) {
          // SM-2 Curva muy suave (Exámenes a corto plazo)
          if (state.wrongAttempts === 0) {
            intervalDays = Math.ceil(previousInterval * 1.5); 
            if (previousInterval === 1) intervalDays = 2; // Salto inicial lento 1 -> 2
          } else if (state.wrongAttempts === 1) {
            intervalDays = Math.ceil(previousInterval * 1.2);
            if (previousInterval === 1) intervalDays = 1; // Mantiene en 1 día si dudó
          } else {
            intervalDays = 1;
            degradC++;
          }
          // Limites para evitar "absurdos" como dijo el usuario
          if (intervalDays > 8) intervalDays = 8; // MÁXIMO 8 DÍAS (1 semana)
          if (intervalDays < 1) intervalDays = 1;
          
          totalDisp += intervalDays;
          correctC++;
        } else if (state.isCorrect === false) {
          // Q=0 (Olvido Total): Reseteo a nivel Junior
          intervalDays = 1;
          degradC++;
        } else {
          // No respondido: no tocar el nodo
          continue;
        }

        const nextDate = new Date();
        nextDate.setDate(now.getDate() + intervalDays);
        
        await this.db.saveNode({
          ...node,
          nextReviewDate: nextDate
        });
      }

      this.impactSummary.avgDisplacement = correctC > 0 ? parseFloat((totalDisp / correctC).toFixed(1)) : 0;
      this.impactSummary.degradedCount = degradC;
      
      // Racha diaria con localStorage
      const today = now.toISOString().split('T')[0];
      const lastDay = localStorage.getItem('nm_streak_date');
      let streak = parseInt(localStorage.getItem('nm_streak') || '0', 10);
      
      if (lastDay === today) {
        // Ya se registró hoy, no incrementar
      } else {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split('T')[0];
        streak = lastDay === yStr ? streak + 1 : 1;
        localStorage.setItem('nm_streak', streak.toString());
        localStorage.setItem('nm_streak_date', today);
      }
      this.impactSummary.streakDays = streak;

      this.toast.success('Sesión analizada. Impacto cognitivo sincronizado.');
      this.onFinished.emit();
    } catch (e) {
      console.error('[QuizSession] Error al guardar resultados:', e);
      this.toast.error('Error al sincronizar resultados.');
    }
  }

  reviewErrors() {
    const firstErrorIdx = this.nodes.findIndex(n => !this.nodeStates[n.id!].isCorrect);
    if (firstErrorIdx > -1) {
      this.currentPage = Math.floor(firstErrorIdx / this.pageSize);
      this.isFinished = false;
      setTimeout(() => this.layoutService.collapseSidebar(), 0);
      this.cdr.detectChanges();
    }
  }

  repeatQuiz() {
    this.initNodeStates();
    this.currentPage = 0;
    this.secondsElapsed = 0;
    this.startTimer();
    this.cdr.detectChanges();
  }

  handleExit() {
    if (this.isConfirmingExit) {
      this.onClose.emit();
    } else {
      this.isConfirmingExit = true;
      this.toast.warning('⚠️ ¿Seguro que quieres abandonar?', 4000);
      if (this.exitTimeout) clearTimeout(this.exitTimeout);
      this.exitTimeout = setTimeout(() => {
        this.isConfirmingExit = false;
        this.cdr.detectChanges();
      }, 5000);
    }
  }

  getTypeName(tipo: string): string {
    const key = this.normalizeType(tipo);
    return TIPO_MAP[key]?.label || tipo;
  }

  getSafeIcon(tipo: string): string {
    const key = this.normalizeType(tipo);
    if (key.includes('single'))  return this.ICONS['single_choice'];
    if (key.includes('multi'))   return this.ICONS['multiple_choice'];
    if (key.includes('cloze'))   return this.ICONS['cloze_deletion'];
    if (key.includes('output'))  return this.ICONS['output_prediction'];
    if (key.includes('order'))   return this.ICONS['ordering'];
    if (key.includes('anomaly')) return this.ICONS['anomaly_detection'];
    if (key.includes('optimiz')) return this.ICONS['optimization'];
    if (key.includes('case'))    return this.ICONS['case_analysis'];
    if (key.includes('feynman')) return this.ICONS['feynman_synthesis'];
    return '';
  }
}
