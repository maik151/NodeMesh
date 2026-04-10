import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NodeChallenge, QuizSession, ChallengeType } from '../../../../core/models/node.model';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { ToastService } from '../../../../core/services/ui/toast.service';
import { TYPE_ICONS } from '../../../../shared/constants/icons.constants';

interface NodeState {
  userAnswer: string | string[];
  isCorrect: boolean | null;
  showFeedback: boolean;
  failedOptions: string[]; // NEW: Track which options were tried and failed
  history: { selection: string; feedback: string; isCorrect: boolean }[];
  wrongAttempts: number; // NEW: Track count for scoring
}

const TIPO_MAP: Record<string, { label: string }> = {
  single_choice:    { label: 'Desafío Único' },
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
        
        <!-- MODERN GLASS HEADER -->
        <header class="qs-header">
          <div class="qs-header-left">
            <button 
              class="qs-exit-btn-alt" 
              [class.confirming]="isConfirmingExit"
              (click)="handleExit()" 
              [title]="isConfirmingExit ? 'Clic de nuevo para confirmar' : 'Salir'">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm117.66-93.66L192,84.69a8,8,0,0,0-13.66,5.65V120H104a8,8,0,0,0,0,16h74.34v29.66a8,8,0,0,0,13.66,5.65l37.66-37.65A8,8,0,0,0,229.66,122.34Z"/>
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
            <!-- Nodos Widget -->
            <div class="qs-widget">
              <div class="qs-widget-main">
                <span class="qs-val">{{ answeredCount }}/{{ nodes.length }}</span>
                <span class="qs-lbl">Nodos</span>
              </div>
              <div class="qs-widget-prog-track">
                <div class="qs-widget-prog-fill" [style.width.%]="progress"></div>
              </div>
            </div>

            <!-- Precisión Widget -->
            <div class="qs-widget">
              <div class="qs-widget-main">
                <span class="qs-val">{{ scorePercent }}%</span>
                <span class="qs-lbl">Precisión</span>
              </div>
              <div class="qs-widget-prog-track">
                <div class="qs-widget-prog-fill" [style.width.%]="scorePercent" style="background: var(--theme-brand-neon); box-shadow: 0 0 15px var(--theme-brand-neon);"></div>
              </div>
            </div>

            <!-- Tiempo Widget -->
            <div class="qs-widget">
              <div class="qs-widget-main">
                <span class="qs-val">{{ timerLabel }}</span>
                <span class="qs-lbl">Tiempo</span>
              </div>
            </div>

            <!-- Modo Widget -->
            <div class="qs-widget">
              <div class="qs-widget-main">
                <span class="qs-val">MODO</span>
                <span class="qs-lbl">Repaso</span>
              </div>
            </div>
          </div>
        </header>

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
                      
                      <!-- PISTA BUTTON GROUPED -->
                      <div class="qs-hint-wrap" *ngIf="node.pista">
                        <button class="qs-hint-trigger" (click)="toggleHint(node.id!)" [class.active]="hintsVisible[node.id!]">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-88a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h56A8,8,0,0,1,176,128Zm-24,40a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,168Z"/>
                          </svg>
                          <span>Pista</span>
                        </button>
                        <div class="qs-hint-glass" [class.is-visible]="hintsVisible[node.id!]">
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
                        [class.reveal-correct]="isVerified && isOptionCorrect(node, opt)"
                        (click)="selectOption(node, opt)"
                        [disabled]="isVerified || nodeStates[node.id!].isCorrect !== null || nodeStates[node.id!].failedOptions.includes(opt)">
                        <div class="qs-mark"></div>
                        {{ opt }}
                      </button>
                    </div>

                    <!-- ITERATIVE FEEDBACK HISTORY -->
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

            <!-- FOOTER -->
            <div class="qs-exam-footer">
              <div class="qs-pag-controls" *ngIf="nodes.length > pageSize">
                <button [disabled]="currentPage === 0" (click)="changePage(-1)">Anterior</button>
                <span>{{ currentPage + 1 }} / {{ totalPages }}</span>
                <button [disabled]="isLastPage" (click)="changePage(1)">Siguiente</button>
              </div>

              <div class="qs-verify-wrap">
                <button 
                  class="qs-verify-btn" 
                  *ngIf="!isVerified"
                  (click)="verifyPageAnswers()">
                  VERIFICAR RESPUESTAS
                </button>
                <div class="qs-nav-after-verify" *ngIf="isVerified">
                    <button 
                        class="qs-next-btn" 
                        *ngIf="!isLastPage"
                        (click)="changePage(1)">
                        CONTINUAR PÁGINA
                    </button>
                    <button 
                        class="qs-finish-btn" 
                        *ngIf="isLastPage"
                        (click)="finishQuiz()">
                        FINALIZAR EVALUACIÓN
                    </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      <ng-template #finishedState>
        <div class="qs-result-view">
          <h2 class="qs-score-title">{{ scorePercent }}%</h2>
          <p class="qs-score-desc">Completado con {{ totalCorrect }} aciertos en {{ timerLabel }}.</p>
          <button class="qs-res-close" (click)="onClose.emit()">Finalizar Sesión</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .qs-shell {
      width: 100%; height: 100%;
      background: var(--theme-bg);
      color: var(--theme-text);
      display: flex; flex-direction: column;
      animation: qs-fade-in 0.3s ease;
      text-align: left;
      font-family: 'JetBrains Mono', monospace;
    }

    /* GLASS HEADER (Improved for Light/Dark) */
    .qs-header {
      height: 80px; padding: 0 2rem;
      border-bottom: 1px solid var(--theme-border);
      background: var(--theme-header-bg, rgba(255,255,255,0.02));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: space-between;
      z-index: 10;
    }

    .qs-header-left { display: flex; align-items: center; gap: 3rem; }
    
    .qs-exit-btn-alt {
      background: transparent; border: none;
      color: var(--theme-text-muted); padding:0;
      display: flex; align-items: center; gap: 0.6rem;
      cursor: pointer; transition: 0.2s;
      font-family: 'JetBrains Mono'; font-size: 0.85rem;
    }
    .qs-exit-btn-alt:hover { color: #f87171; transform: translateX(-2px); }
    .qs-exit-btn-alt.confirming { color: #ff6b6b; background: rgba(255, 107, 107, 0.1); padding: 4px 12px; border-radius: 8px; font-weight: 800; border: 1px solid rgba(255, 107, 107, 0.2); }
    .qs-exit-btn-alt svg { width: 22px; height: 22px; fill: currentColor; }

    .qs-quiz-info-set { display: flex; align-items: center; gap: 0.8rem; }
    .qs-quiz-icon-wrap { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
    .qs-quiz-icon-wrap svg { width: 100%; height: 100%; fill: var(--theme-brand-neon); filter: drop-shadow(0 0 5px rgba(159, 255, 34, 0.2)); }
    .qs-quiz-title-alt { font-size: 1.25rem; font-weight: 500; margin: 0; color: var(--theme-text); letter-spacing: -0.5px; }

    .qs-header-right { display: flex; align-items: center; gap: 0.75rem; }
    
    .qs-widget {
      height: 52px; min-width: 90px;
      background: var(--theme-surface);
      border: 1px solid var(--theme-border);
      border-radius: 8px;
      display: flex; flex-direction: column;
      position: relative; overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .qs-widget-main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 1rem; }
    .qs-widget .qs-val { font-size: 1rem; font-weight: 600; color: var(--theme-text); line-height: 1; }
    .qs-widget .qs-lbl { font-size: 0.55rem; text-transform: uppercase; color: var(--theme-text-muted); margin-top: 3px; letter-spacing: 0.05em; }
    
    .qs-widget-prog-track { height:3px; background: rgba(0,0,0,0.05); width: 100%; position: absolute; bottom: 0; }
    .qs-widget-prog-fill { height: 100%; background: var(--theme-brand-neon); transition: width 0.4s ease; box-shadow: 0 0 10px var(--theme-brand-neon); }

    .qs-main-scroll { flex: 1; overflow-y: auto; padding: 2.5rem 4rem; scroll-behavior: smooth; }
    .qs-exam-list { max-width: 750px; display: flex; flex-direction: column; gap: 2.5rem; }

    .qs-node-block { display: flex; gap: 1.5rem; animation: qs-slide-up 0.4s ease; }
    @keyframes qs-slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .qs-node-num { font-size: 1.1rem; font-weight: 800; color: var(--theme-text); opacity: 0.15; margin-top: 0.2rem; transition: 0.3s; }
    .qs-node-block:hover .qs-node-num { opacity: 0.8; color: var(--theme-brand-neon); text-shadow: 0 0 10px rgba(159, 255, 34, 0.4); }
    
    :host-context([data-theme="light"]) .qs-node-num { opacity: 0.1; color: #000; }
    :host-context([data-theme="light"]) .qs-node-block:hover .qs-node-num { opacity: 0.6; color: #1a1a2e; }

    .qs-node-body { flex: 1; display: flex; flex-direction: column; gap: 0.8rem; }

    .qs-node-meta { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
    .qs-meta-left { display: flex; align-items: center; gap: 0.8rem; }
    .qs-type-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 4px 10px; background: rgba(192, 132, 252, 0.08); border-radius: 6px; border: 1px solid rgba(192, 132, 252, 0.2); width: fit-content; }
    .qs-type-icon { width: 13px; height: 13px; fill: #c084fc; }
    .qs-type-tag { font-size: 0.65rem; text-transform: uppercase; font-weight: 800; color: #c084fc; letter-spacing: 0.02em; }
    
    .qs-question { font-size: 1.05rem; font-weight: 400; line-height: 1.5; margin: 0; color: var(--theme-text); }
    .qs-snippet-box { background: var(--theme-surface); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--theme-border); font-size: 0.75rem; color: var(--theme-text-secondary); box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
    
    .qs-divider { width: 100%; border-bottom: 1px solid var(--theme-border); opacity: 0.3; margin: 0.5rem 0; }

    .qs-opt-row {
      background: var(--theme-input-bg); border: 1px solid var(--theme-border); border-radius: 12px;
      padding: 0.7rem 1.2rem; font-size: 0.85rem; display: flex; align-items: center; gap: 0.8rem;
      width: 100%; text-align: left; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); color: var(--theme-text);
      margin-bottom: 0.5rem;
    }
    .qs-opt-row:hover:not(:disabled) { border-color: var(--theme-brand-neon); background: rgba(159, 255, 34, 0.03); transform: translateX(4px); }
    .qs-opt-row.is-selected { border-color: var(--theme-brand-neon); background: rgba(159, 255, 34, 0.08); box-shadow: 0 4px 12px rgba(159, 255, 34, 0.1); }
    .qs-mark { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--theme-text-muted); transition: 0.2s; flex-shrink: 0; }
    .is-selected .qs-mark { background: var(--theme-brand-neon); border-color: var(--theme-brand-neon); box-shadow: 0 0 8px var(--theme-brand-neon); }
    
    .qs-opt-row.is-failed { border-color: #ef4444; background: rgba(239, 68, 68, 0.03); }
    .qs-opt-row.is-failed .qs-mark { border-color: #ef4444; background: #ef4444; box-shadow: 0 0 6px rgba(239, 68, 68, 0.5); }

    .qs-exam-footer { border-top: 1px solid var(--theme-border); padding-top: 2rem; margin-top: 1rem; display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start; }
    .qs-verify-btn { background: var(--theme-brand-neon); color: #000; border: none; border-radius: 12px; padding: 1rem 3rem; font-weight: 800; font-size: 0.95rem; cursor: pointer; box-shadow: 0 4px 15px rgba(159, 255, 34, 0.3); transition: 0.2s; }
    .qs-verify-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(159, 255, 34, 0.4); }

    .qs-res-close { background: var(--theme-brand-neon); color: #000; border: none; border-radius: 10px; padding: 0.8rem 2.5rem; font-weight: 800; cursor: pointer; box-shadow: 0 5px 15px rgba(159, 255, 34, 0.2); }

    /* HINT REVEAL */
    .qs-hint-wrap { position: relative; }
    .qs-hint-trigger { background: rgba(255, 193, 7, 0.05); border: 1px solid rgba(255, 193, 7, 0.2); border-radius: 6px; padding: 4px 10px; color: #ffc107; font-size: 0.65rem; font-weight: 800; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
    .qs-hint-trigger:hover, .qs-hint-trigger.active { background: rgba(255, 193, 7, 0.15); border-color: #ffc107; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(255, 193, 7, 0.1); }
    .qs-hint-trigger svg { width: 14px; height: 14px; fill: currentColor; }

    .qs-hint-glass { position: absolute; top: calc(100% + 10px); left: 0; width: 320px; background: rgba(20, 20, 20, 0.85); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid rgba(255, 193, 7, 0.3); border-radius: 12px; padding: 1.25rem; font-size: 0.8rem; line-height: 1.5; color: #fff; box-shadow: 0 15px 40px rgba(0,0,0,0.4); z-index: 1000; opacity: 0; pointer-events: none; transform: translateY(-10px); transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .qs-hint-glass.is-visible { opacity: 1; pointer-events: auto; transform: translateY(0); }
    .qs-hint-glass p { margin: 0; }

    /* LOG HISTORY */
    .qs-history-log { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; animation: qs-fade-in 0.3s ease; }
    .qs-log-entry { display: flex; gap: 0.75rem; padding: 0.75rem 1rem; background: rgba(255,255,255,0.02); border-radius: 8px; border-left: 3px solid #f87171; font-size: 0.8rem; line-height: 1.4; color: var(--theme-text-muted); }
    .qs-log-entry.is-correct { border-left-color: var(--theme-brand-neon); color: var(--theme-text); background: rgba(134, 219, 0, 0.03); }
    .log-mark { font-weight: 900; }

    @keyframes qs-fade-in { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class QuizSessionComponent implements OnInit, OnDestroy {
  @Input() quiz!: QuizSession;
  @Input() nodes: NodeChallenge[] = [];
  @Output() onClose = new EventEmitter<void>();

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);
  readonly ICONS = TYPE_ICONS;

  currentPage = 0;
  pageSize = 10;
  isVerified = false;
  isFinished = false;
  totalCorrect = 0;

  secondsElapsed = 0;
  private timerInterval: any;

  nodeStates: { [nodeId: number]: NodeState } = {};
  hintsVisible: { [nodeId: number]: boolean } = {};
  isConfirmingExit = false;
  private exitTimeout: any;

  ngOnInit() {
    this.initStates();
    this.startTimer();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  initStates() {
    this.nodes.forEach(node => {
        const type = this.normalizeType(node.tipo_reto);
        this.nodeStates[node.id!] = {
            userAnswer: type.includes('multi') ? [] : '',
            isCorrect: null,
            showFeedback: false,
            failedOptions: [],
            history: [],
            wrongAttempts: 0
        };
        this.hintsVisible[node.id!] = false;
    });
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.secondsElapsed++;
      this.cdr.detectChanges();
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  get visibleNodes(): NodeChallenge[] {
    const start = this.currentPage * this.pageSize;
    return this.nodes.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.nodes.length / this.pageSize);
  }

  get isLastPage() {
    return this.currentPage >= this.totalPages - 1;
  }

  get answeredCount(): number {
    return this.nodes.filter(node => {
        const state = this.nodeStates[node.id!];
        if (Array.isArray(state.userAnswer)) return state.userAnswer.length > 0;
        return String(state.userAnswer).trim().length > 0;
    }).length;
  }

  get progress(): number {
    if (this.nodes.length === 0) return 0;
    return (this.answeredCount / this.nodes.length) * 100;
  }

  get timerLabel(): string {
    const mm = Math.floor(this.secondsElapsed / 60).toString().padStart(2, '0');
    const ss = (this.secondsElapsed % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }

  get totalPossibleClicks(): number {
     return this.nodes.reduce((acc, node) => acc + (node.opciones?.length || 1), 0);
  }

  get totalWrongClicks(): number {
     return this.nodes.reduce((acc, node) => acc + this.nodeStates[node.id!].wrongAttempts, 0);
  }

  get scorePercent() {
    if (this.nodes.length === 0) return 0;
    // PRECISION LOGIC: Penalize every wrong click
    const totalPossible = this.totalPossibleClicks;
    const totalWrong = this.totalWrongClicks;
    const accuracy = Math.max(0, (totalPossible - totalWrong) / totalPossible);
    
    // Also consider how many are actually finished correctly
    const completionWeight = this.totalCorrect / this.nodes.length;
    
    return Math.round((accuracy * completionWeight) * 100);
  }

  onAnswerChange() {
    this.cdr.detectChanges();
  }

  changePage(delta: number) {
    this.currentPage += delta;
    this.isVerified = false;
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

  selectOption(node: NodeChallenge, opt: string) {
    if (this.isVerified || this.isFinished) return;
    const state = this.nodeStates[node.id!];
    const type = this.normalizeType(node.tipo_reto);

    if (type.includes('single')) {
      const isCorrect = this.isOptionCorrect(node, opt);
      
      if (isCorrect) {
        state.userAnswer = opt;
        state.isCorrect = true;
        this.totalCorrect++;
        state.history.push({
          selection: opt,
          feedback: node.justificacion_correcta,
          isCorrect: true
        });
      } else {
        state.failedOptions.push(opt);
        state.wrongAttempts++;
        const feedback = node.retroalimentaciones_opciones?.[opt] || node.justificacion_incorrecta || 'Esta opción no es la correcta para este reto.';
        state.history.push({
          selection: opt,
          feedback: feedback,
          isCorrect: false
        });
      }
    } else {
      // Logic for multi_choice or others
      const current = state.userAnswer as string[];
      const idx = current.indexOf(opt);
      if (idx > -1) current.splice(idx, 1);
      else current.push(opt);
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

  verifyPageAnswers() {
    this.visibleNodes.forEach(node => {
      const state = this.nodeStates[node.id!];
      const type = this.normalizeType(node.tipo_reto);
      let correct = false;
      if (this.isChoiceType(node)) {
        if (type.includes('single')) {
          correct = state.userAnswer === node.respuesta_esperada;
        } else {
          const uArr = state.userAnswer as string[];
          const eArr = Array.isArray(node.respuesta_esperada) ? node.respuesta_esperada : [node.respuesta_esperada];
          correct = uArr.length === eArr.length && uArr.every(o => eArr.includes(o));
        }
      } else {
        const uText = String(state.userAnswer).trim().toLowerCase();
        const eText = String(node.respuesta_esperada).trim().toLowerCase();
        correct = uText === eText;
      }
      state.isCorrect = correct;
      if (correct) this.totalCorrect++;
    });
    this.isVerified = true;
    this.cdr.detectChanges();
  }

  finishQuiz() {
    this.stopTimer();
    this.isFinished = true;
  }

  handleExit() {
    if (this.isConfirmingExit) {
      this.onClose.emit();
    } else {
      this.isConfirmingExit = true;
      this.toast.warning('⚠️ ¿Seguro que quieres abandonar? Perderás el progreso de este quiz.', 6000);
      
      if (this.exitTimeout) clearTimeout(this.exitTimeout);
      this.exitTimeout = setTimeout(() => {
        this.isConfirmingExit = false;
        this.cdr.detectChanges();
      }, 5000);
    }
  }

  getTypeName(tipo: string): string {
    if (!tipo) return 'Desconocido';
    const key = this.normalizeType(tipo);
    if (key.includes('single')) return 'Desafío Único';
    if (key.includes('multi')) return 'Selección Múltiple';
    if (key.includes('cloze')) return 'Completar Espacios';
    if (key.includes('output')) return 'Predicción de Salida';
    if (key.includes('order')) return 'Ordenamiento Lógico';
    if (key.includes('anomaly')) return 'Detección de Anomalías';
    if (key.includes('optimiz')) return 'Optimización de Código';
    if (key.includes('case')) return 'Análisis de Casos';
    if (key.includes('feynman')) return 'Síntesis de Feynman';

    return TIPO_MAP[tipo]?.label || tipo;
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

    return (this.ICONS as any)[key] || this.ICONS['single_choice'];
  }
}
