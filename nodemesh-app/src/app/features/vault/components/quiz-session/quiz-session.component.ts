import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NodeChallenge, QuizSession, ChallengeType } from '../../../../core/models/node.model';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { TYPE_ICONS } from '../../../../shared/constants/icons.constants';

interface NodeState {
  userAnswer: string | string[];
  isCorrect: boolean | null;
  showFeedback: boolean;
  history: { selection: string; feedback: string; isCorrect: boolean }[];
}

const TIPO_MAP: Record<string, { label: string; emoji: string }> = {
  single_choice:    { emoji: '🎯', label: 'Single Choice' },
  multi_choice:     { emoji: '🔳', label: 'Multiple Choice' },
  multiple_choice:  { emoji: '🔳', label: 'Multiple Choice' },
  cloze_deletion:   { emoji: '🔤', label: 'Cloze Deletion' },
  output_prediction:{ emoji: '💻', label: 'Output Prediction' },
  ordering:         { emoji: '↕️', label: 'Ordering' },
  anomaly_detection:{ emoji: '🐛', label: 'Anomaly Detection' },
  optimization:     { emoji: '⚙️', label: 'Optimization' },
  case_analysis:    { emoji: '⚖️', label: 'Case Analysis' },
  feynman_synthesis:{ emoji: '🎓', label: 'Feynman Synthesis' },
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
            <button class="qs-exit-btn-alt" (click)="onClose.emit()" title="Salir">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm117.66-93.66L192,84.69a8,8,0,0,0-13.66,5.65V120H104a8,8,0,0,0,0,16h74.34v29.66a8,8,0,0,0,13.66,5.65l37.66-37.65A8,8,0,0,0,229.66,122.34Z"/>
              </svg>
              <span>Salir</span>
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
                    <div class="qs-type-badge">
                      <svg class="qs-type-icon" viewBox="0 0 256 256">
                        <path [attr.d]="getSafeIcon(node.tipo_reto)"/>
                      </svg>
                      <span class="qs-type-tag">{{ getTypeName(node.tipo_reto) }}</span>
                    </div>
                    <button class="qs-hint-link" *ngIf="node.pista" (click)="toggleHint(node.id!)">
                      Pista
                    </button>
                  </div>

                  <div class="qs-pista-inline" *ngIf="hintsVisible[node.id!]">
                    {{ node.pista }}
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
                        [class.reveal-correct]="isVerified && isOptionCorrect(node, opt)"
                        [class.reveal-wrong]="isVerified && isSelected(node, opt) && !isOptionCorrect(node, opt)"
                        (click)="selectOption(node, opt)"
                        [disabled]="isVerified">
                        <div class="qs-mark"></div>
                        {{ opt }}
                      </button>
                    </div>

                    <div class="qs-input-v" *ngIf="isInputType(node)">
                      <input 
                        type="text" 
                        class="qs-field" 
                        [(ngModel)]="nodeStates[node.id!].userAnswer"
                        (ngModelChange)="onAnswerChange()"
                        [disabled]="isVerified"
                        [class.is-correct]="isVerified && nodeStates[node.id!].isCorrect"
                        [class.is-wrong]="isVerified && nodeStates[node.id!].isCorrect === false"
                        placeholder="Contesta aquí...">
                    </div>
                  </div>

                  <div class="qs-node-feedback" *ngIf="isVerified && nodeStates[node.id!].isCorrect !== null">
                    <div class="qs-fb-card" [class.fb-ok]="nodeStates[node.id!].isCorrect">
                      <p>{{ nodeStates[node.id!].isCorrect ? node.justificacion_correcta : node.justificacion_incorrecta }}</p>
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

    .qs-node-num { font-size: 1rem; font-weight: 800; opacity: 0.15; color: var(--theme-text); margin-top: 0.2rem; }
    .qs-node-body { flex: 1; display: flex; flex-direction: column; gap: 0.8rem; }

    .qs-type-badge { display: flex; align-items: center; gap: 0.4rem; padding: 2px 8px; background: rgba(192, 132, 252, 0.05); border-radius: 4px; border: 1px solid rgba(192, 132, 252, 0.1); }
    .qs-type-icon { width: 12px; height: 12px; fill: #c084fc; }
    .qs-type-tag { font-size: 0.5rem; text-transform: uppercase; font-weight: 800; color: #c084fc; }
    
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
    .qs-mark { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--theme-text-muted); transition: 0.2s; }
    .is-selected .qs-mark { background: var(--theme-brand-neon); border-color: var(--theme-brand-neon); box-shadow: 0 0 8px var(--theme-brand-neon); }

    .qs-exam-footer { border-top: 1px solid var(--theme-border); padding-top: 2rem; margin-top: 1rem; display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start; }
    .qs-verify-btn { background: var(--theme-brand-neon); color: #000; border: none; border-radius: 12px; padding: 1rem 3rem; font-weight: 800; font-size: 0.95rem; cursor: pointer; box-shadow: 0 4px 15px rgba(159, 255, 34, 0.3); transition: 0.2s; }
    .qs-verify-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(159, 255, 34, 0.4); }

    .qs-res-close { background: var(--theme-brand-neon); color: #000; border: none; border-radius: 10px; padding: 0.8rem 2.5rem; font-weight: 800; cursor: pointer; box-shadow: 0 5px 15px rgba(159, 255, 34, 0.2); }

    @keyframes qs-fade-in { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class QuizSessionComponent implements OnInit, OnDestroy {
  @Input() quiz!: QuizSession;
  @Input() nodes: NodeChallenge[] = [];
  @Output() onClose = new EventEmitter<void>();

  private readonly cdr = inject(ChangeDetectorRef);
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

  ngOnInit() {
    this.initStates();
    this.startTimer();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  initStates() {
    this.nodes.forEach(node => {
        this.nodeStates[node.id!] = {
            userAnswer: node.tipo_reto === 'multi_choice' ? [] : '',
            isCorrect: null,
            showFeedback: false,
            history: []
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

  get scorePercent() {
    if (this.nodes.length === 0) return 0;
    return Math.round((this.totalCorrect / this.nodes.length) * 100);
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

  getTypeName(tipo: string): string {
    if (!tipo) return 'Unknown';
    const key = tipo.toLowerCase().trim().replace(/ /g, '_');
    if (key.includes('single')) return 'Single Choice';
    if (key.includes('multi')) return 'Multiple Choice';
    if (key.includes('cloze')) return 'Cloze Deletion';
    if (key.includes('output')) return 'Output Prediction';
    if (key.includes('order')) return 'Ordering';
    if (key.includes('anomaly')) return 'Anomaly Detection';
    if (key.includes('optimiz')) return 'Optimization';
    if (key.includes('case')) return 'Case Analysis';
    if (key.includes('feynman')) return 'Feynman Synthesis';

    return TIPO_MAP[tipo]?.label || tipo;
  }

  getSafeIcon(tipo: string): string {
    if (!tipo) return this.ICONS['single_choice'];
    const key = tipo.toLowerCase().trim().replace(/ /g, '_');
    
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

  isChoiceType(node: NodeChallenge): boolean {
    return ['single_choice', 'multi_choice', 'ordering'].includes(node.tipo_reto);
  }

  isInputType(node: NodeChallenge): boolean {
    return ['output_prediction', 'cloze_deletion'].includes(node.tipo_reto);
  }

  selectOption(node: NodeChallenge, opt: string) {
    if (this.isVerified) return;
    const state = this.nodeStates[node.id!];
    if (node.tipo_reto === 'single_choice') {
      state.userAnswer = opt;
    } else {
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
      let correct = false;
      if (this.isChoiceType(node)) {
        if (node.tipo_reto === 'single_choice') {
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
}
