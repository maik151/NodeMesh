import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { DifficultyLevel, ChallengeType } from '../../../../core/models/node.model';
import { LiquidGlassComponent } from '../../../../shared/components/liquid-glass/liquid-glass.component';

@Component({
  selector: 'app-command-center',
  standalone: true,
  imports: [CommonModule, FormsModule, LiquidGlassComponent],
  template: `
    <div class="command-center-container">
      <header class="cc-header">
        <div class="header-left">
          <h1 class="cc-title">Command Center</h1>
          <div class="header-meta">
            <p class="cc-subtitle">ORQUESTA TU FLUJO COGNITIVO</p>
            <div class="status-indicator">
              <div class="status-pill">
                <span class="dot pulse"></span>
                <span class="status-text">SYNC: LOCAL_DB</span>
              </div>
            </div>
          </div>
        </div>
        <div class="header-right">
          <!-- Espacio reservado para el menú de usuario -->
        </div>
      </header>

      <div class="cc-grid">
        <!-- PRIMARY OPS: INJECT PAYLOAD (Wide) -->
        <div class="cc-card span-8 row-2">
          <app-liquid-glass [simple]="true" [radius]="20" [depth]="2" [blur]="18" [backgroundColor]="'rgba(10, 12, 10, 0.75)'">
            <div class="card-inner flex-row space-between items-center" (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)" (drop)="onDrop($event)" [class.dragging]="isDragging">
               <div class="inner-glow"></div>
              <div class="payload-visual">
                <div class="icon-orb">
                  <span class="material-symbols-rounded neon-text">database_upload</span>
                </div>
                <div class="payload-info">
                  <h3>INJECT_PAYLOAD</h3>
                  <p>Arrastra archivos JSON o usa <kbd>Ctrl+V</kbd></p>
                </div>
              </div>
              <button class="btn-terminal-action" (click)="openCompilerModal()">
                <span class="material-symbols-rounded">terminal</span>
                <span>OPEN_COMPILER</span>
              </button>
            </div>
          </app-liquid-glass>
        </div>

        <!-- ACTION: FORZAR SPRINT (Compact & Powerful) -->
        <div class="cc-card span-4 row-2">
          <app-liquid-glass [simple]="true" [radius]="20" [depth]="4" [blur]="24" [backgroundColor]="'rgba(154, 205, 50, 0.15)'">
            <div class="card-inner centered gap-1">
              <div class="glow-orb"></div>
              <span class="material-symbols-rounded bolt-icon neon-text">bolt</span>
              <button class="btn-sprint-main" (click)="startInterleaving()">FORZAR_SPRINT</button>
              <div class="stress-meter">
                <div class="meter-bar" style="width: 85%"></div>
                <span class="label-micro">STRESS_LVL: MAX</span>
              </div>
            </div>
          </app-liquid-glass>
        </div>

        <!-- TRIAGE: QUEUE (Vertical) -->
        <div class="cc-card span-4 row-4">
          <app-liquid-glass [simple]="true" [radius]="20" [depth]="2" [blur]="16" [backgroundColor]="'rgba(10, 12, 10, 0.7)'">
            <div class="card-inner no-padding">
              <div class="inner-glow"></div>
              <div class="header-micro-technical">
                <span class="material-symbols-rounded size-mini">priority_high</span>
                <span class="label-micro">TRIAGE_QUEUE</span>
              </div>
              <div class="body-list scroll-hide">
                <div *ngIf="dueModules.length === 0" class="empty-state">
                  <span class="material-symbols-rounded">check_circle</span>
                  <p>SYSTEM_OPTIMIZED</p>
                </div>
                <div class="triage-item" *ngFor="let mod of dueModules" (click)="startSprint(mod.folder_id)">
                  <div class="triage-status" [class.overdue]="mod.status === 'overdue'"></div>
                  <span class="triage-name">{{ mod.nombre_tema }}</span>
                  <span class="triage-count">{{ mod.count }}</span>
                </div>
              </div>
            </div>
          </app-liquid-glass>
        </div>

        <!-- ANALYTICS: CONSISTENCY MAP (Large) -->
        <div class="cc-card span-8 row-4">
          <app-liquid-glass [simple]="true" [radius]="20" [depth]="2" [blur]="20" [backgroundColor]="'rgba(10, 12, 10, 0.7)'">
            <div class="card-inner no-padding">
              <div class="inner-glow"></div>
              <div class="header-micro-technical">
                <span class="material-symbols-rounded size-mini">analytics</span>
                <span class="label-micro">CONSISTENCY_MAP</span>
              </div>
              <div class="heatmap-container">
                <svg viewBox="0 0 740 100" class="heatmap-svg">
                  <rect *ngFor="let day of heatmapNodes; let i = index"
                        [attr.x]="(i % 52) * 14" [attr.y]="getY(i) * 14"
                        width="11" height="11" rx="2"
                        [attr.fill]="getHeatColor(day.count)"
                        class="heat-node">
                  </rect>
                </svg>
              </div>
            </div>
          </app-liquid-glass>
        </div>

        <!-- WIDGETS: STREAK & TIMER (Small Square) -->
        <div class="cc-card span-3 row-2">
          <app-liquid-glass [simple]="true" [radius]="20" [depth]="1" [blur]="20" [backgroundColor]="'rgba(10, 12, 10, 0.7)'">
            <div class="widget-square">
              <div class="inner-glow"></div>
              <div class="widget-header">
                <span class="label-micro">STREAK_SESSION</span>
                <span class="material-symbols-rounded ico-mini">local_fire_department</span>
              </div>
              <div class="widget-value neon-text">{{ streak }}</div>
            </div>
          </app-liquid-glass>
        </div>

        <div class="cc-card span-3 row-2">
          <app-liquid-glass [simple]="true" [radius]="20" [depth]="1" [blur]="20" [backgroundColor]="'rgba(10, 12, 10, 0.7)'">
            <div class="widget-square clickable" (click)="togglePomo()">
              <div class="inner-glow"></div>
              <div class="widget-header">
                <span class="label-micro">ZEN_TIMER</span>
                <span class="material-symbols-rounded ico-mini">{{ pomo.running ? 'pause' : 'play_arrow' }}</span>
              </div>
              <div class="widget-value mono">{{ pomoTime }}</div>
            </div>
          </app-liquid-glass>
        </div>

        <!-- WIDGET: MASTERY (Vertical/Accent) -->
        <div class="cc-card span-2 row-2">
          <app-liquid-glass [simple]="true" [radius]="20" [depth]="1" [blur]="15" [backgroundColor]="'rgba(10, 12, 10, 0.7)'">
            <div class="widget-mastery">
              <div class="inner-glow"></div>
              <div class="circular-progress">
                <svg viewBox="0 0 36 36" class="chart-svg">
                  <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path class="circle-fg" [attr.stroke-dasharray]="masteryRatio + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
                <div class="perc-text">{{ masteryRatio | number:'1.0-0' }}%</div>
              </div>
              <span class="label-micro mt-1">MASTERY</span>
            </div>
          </app-liquid-glass>
        </div>

        <!-- FOOTER: VAULTS (Mid) -->
        <div class="cc-card span-4 row-2">
          <app-liquid-glass [radius]="20" [depth]="1" [blur]="20" [backgroundColor]="'rgba(10, 12, 10, 0.7)'">
            <div class="card-inner">
              <div class="inner-glow"></div>
              <div class="label-micro mb-1">VAULTS_CACHE</div>
              <div class="vault-tokens">
                <div class="vault-token" *ngFor="let v of recentVaults">
                  <span class="material-symbols-rounded">folder</span>
                  <span>{{ v.nombre_tema }}</span>
                </div>
              </div>
            </div>
          </app-liquid-glass>
        </div>

        <!-- FOOTER: FLUX (Wide) -->
        <div class="cc-card span-12 row-2">
          <app-liquid-glass [radius]="20" [depth]="1" [blur]="20" [backgroundColor]="'rgba(10, 12, 10, 0.6)'">
            <div class="card-inner flex-row items-center gap-3">
              <div class="inner-glow"></div>
              <div class="label-micro no-wrap">RETENTION_FLUX</div>
              <div class="flux-viz">
                <svg class="flux-svg" viewBox="0 0 800 40" preserveAspectRatio="none">
                  <path [attr.d]="retentionPath" fill="none" stroke="var(--accent)" stroke-width="2" opacity="0.6"/>
                  <path [attr.d]="retentionPath" fill="none" stroke="var(--accent)" stroke-width="6" opacity="0.1" filter="blur(4px)"/>
                </svg>
              </div>
            </div>
          </app-liquid-glass>
        </div>
      </div>

      <!-- MODALS & TOASTS -->
      <div class="cc-modal-backdrop" *ngIf="showCompiler">
        <div class="cc-modal card-glass shadow-bloom">
          <header class="modal-header">
            <h3>COMPILADOR DE PROMPT MAESTRO</h3>
            <button class="btn-close" (click)="showCompiler = false">×</button>
          </header>
          <div class="modal-body">
            <div class="input-group">
                <label>TEMA CENTRAL</label>
                <input type="text" [(ngModel)]="compiler.theme" placeholder="Ej. Arquitectura Microservicios" class="cc-input">
            </div>
            <div class="row">
              <div class="input-group half">
                <label>NIVEL DE FRICCIÓN</label>
                <select [(ngModel)]="compiler.level" class="cc-select">
                  <option value="Aprendiz">Baja / Retención</option>
                  <option value="Intermedio">Media / Aplicación</option>
                  <option value="Senior">Máxima / Maestría</option>
                </select>
              </div>
              <div class="input-group half">
                <label>DENSIDAD (NODOS)</label>
                <input type="number" [(ngModel)]="compiler.count" min="5" max="25" class="cc-input">
              </div>
            </div>
          </div>
          <footer class="modal-footer">
            <button class="btn-primary-neon full" (click)="copyPrompt()">
              GENERAR Y COPIAR
            </button>
          </footer>
        </div>
      </div>

      <div class="injection-toast" *ngIf="injectionStatus !== 'idle'" [class]="injectionStatus">
        <span class="material-symbols-rounded">{{ injectionStatus === 'success' ? 'check_circle' : 'error' }}</span>
        {{ injectionMsg }}
      </div>
    </div>
  `,
  styles: [`
    :host { 
      --accent: #9ACD32; 
      --accent-glow: #C5E100;
      --bg-void: #050505; 
      --surface: #0a0c0a;
      --glass-border: rgba(255, 255, 255, 0.05);
      display: block;
      min-height: 100vh;
      background: radial-gradient(circle at top right, #0d120d, var(--bg-void));
    }
    
    .command-center-container {
      padding: 3rem 2.5rem 1.5rem;
      max-width: 1512px;
      margin: 0 auto;
      color: #fff;
      font-family: 'Inter', sans-serif;
    }

    /* HEADER */
    .cc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2.5rem;
      position: relative;
    }
    .cc-title {
      font-size: 2.8rem;
      font-weight: 950;
      letter-spacing: -2.5px;
      margin: 0;
      line-height: 1;
      background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header-meta {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-top: 0.5rem;
    }
    .cc-subtitle {
      font-size: 0.7rem;
      font-weight: 900;
      letter-spacing: 4px;
      opacity: 0.3;
      text-transform: uppercase;
      margin: 0;
    }
    .status-indicator { display: flex; align-items: center; }
    .status-pill {
      background: rgba(154, 205, 50, 0.05); /* Sutil tinte verde */
      padding: 0.3rem 0.7rem;
      border-radius: 100px;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-family: 'Fira Code', monospace;
      font-size: 0.65rem;
      font-weight: 600;
      box-shadow: inset 0 0 10px rgba(255,255,255,0.02);
    }
    .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); }

    /* BENTO GRID 12-COLUMN - TIGHTER */
    .cc-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      grid-auto-rows: minmax(60px, auto);
      gap: 12px;
    }
    .span-12 { grid-column: span 12; }
    .span-8 { grid-column: span 8; }
    .span-4 { grid-column: span 4; }
    .span-3 { grid-column: span 3; }
    .span-2 { grid-column: span 2; }
    .row-4 { grid-row: span 4; }
    .row-2 { grid-row: span 2; }

    .cc-card { 
      position: relative; 
      border-radius: 20px; 
      overflow: hidden; 
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s;
    }
    .cc-card:hover { 
      transform: translateY(-4px); 
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.6);
    }
    app-liquid-glass { width: 100%; height: 100%; display: block; }

    /* CARD INTERNALS */
    .card-inner { height: 100%; padding: 1.25rem; position: relative; z-index: 2; overflow: hidden; }
    .card-inner.no-padding { padding: 0; }
    .inner-glow {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 40%);
      pointer-events: none; z-index: 1;
    }

    .flex-row { display: flex; }
    .items-center { align-items: center; }
    .space-between { justify-content: space-between; }
    .centered { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .gap-1 { gap: 0.75rem; }
    .gap-3 { gap: 1.5rem; }
    .no-wrap { white-space: nowrap; }

    /* PAYLOAD SECTION */
    .payload-visual { display: flex; align-items: center; gap: 1.25rem; z-index: 2; }
    .icon-orb {
      width: 48px; height: 48px;
      background: rgba(154, 205, 50, 0.05);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: inset 0 0 15px rgba(154, 205, 50, 0.1);
    }
    .icon-orb span { font-size: 1.75rem; }
    .payload-info h3 { font-size: 1rem; font-weight: 950; margin: 0; letter-spacing: -0.5px; color: #eee; }
    .payload-info p { font-size: 0.7rem; opacity: 0.3; margin: 0.15rem 0 0; }
    .btn-terminal-action {
      background: rgba(255,255,255,0.015);
      border: 1px solid rgba(255,255,255,0.05);
      color: #aaa;
      padding: 0.6rem 1rem;
      border-radius: 10px;
      display: flex; align-items: center; gap: 0.6rem;
      font-size: 0.65rem; font-weight: 900; cursor: pointer;
      transition: all 0.2s; z-index: 2;
    }
    .btn-terminal-action:hover { background: rgba(255,255,255,0.04); color: #fff; border-color: rgba(255,255,255,0.1); }

    /* SPRINT SECTION */
    .glow-orb {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 140px; height: 140px;
      background: radial-gradient(circle, rgba(154, 205, 50, 0.1) 0%, transparent 70%);
      filter: blur(30px); z-index: -1;
    }
    .bolt-icon { font-size: 3rem; opacity: 0.8; }
    .btn-sprint-main {
      background: var(--accent); color: #000; border: none;
      padding: 0.75rem 1.75rem; border-radius: 12px;
      font-size: 0.8rem; font-weight: 950; cursor: pointer;
      box-shadow: 0 4px 15px rgba(154, 205, 50, 0.3);
      transition: all 0.2s;
    }
    .btn-sprint-main:hover { transform: scale(1.05); box-shadow: 0 8px 25px rgba(154, 205, 50, 0.4); }
    .stress-meter { width: 120px; }
    .meter-bar { height: 2px; background: rgba(255,255,255,0.05); border-radius: 10px; position: relative; overflow: hidden; margin-bottom: 0.3rem; }
    .meter-bar::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 85%; background: var(--accent); opacity: 0.4; }

    /* TRIAGE QUEUE */
    .header-micro-technical {
      padding: 1rem 1.25rem;
      display: flex; align-items: center; gap: 0.6rem;
      background: rgba(255,255,255,0.01);
      box-shadow: inset 0 -1px 0 rgba(255,255,255,0.03);
    }
    .body-list { padding: 0.4rem 0; height: 100%; position: relative; z-index: 2; }
    .triage-item {
      padding: 0.65rem 1.25rem;
      display: flex; align-items: center; gap: 0.9rem;
      cursor: pointer; transition: background 0.2s;
    }
    .triage-item:hover { background: rgba(255,255,255,0.02); }
    .triage-status { width: 6px; height: 6px; border-radius: 50%; background: #2a2a2a; }
    .triage-status.overdue { background: #ff4444; box-shadow: 0 0 6px #ff4444; }
    .triage-name { font-size: 0.7rem; font-weight: 600; flex: 1; opacity: 0.6; }
    .triage-count { font-family: 'Fira Code', monospace; font-size: 0.65rem; font-weight: 900; opacity: 0.15; }
    .empty-state { height: 160px; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.1; }
    .empty-state span { font-size: 2rem; margin-bottom: 0.4rem; }
    .empty-state p { font-size: 0.6rem; font-weight: 950; letter-spacing: 2px; }

    /* HEATMAP */
    .heatmap-container { padding: 1.25rem; display: flex; align-items: center; justify-content: center; height: calc(100% - 40px); position: relative; z-index: 2; }
    .heatmap-svg { width: 100%; max-width: 740px; }
    .heat-node { cursor: pointer; transition: transform 0.2s; }
    .heat-node:hover { transform: scale(1.15); }

    /* WIDGETS */
    .widget-square { height: 100%; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 2; }
    .widget-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .widget-value { font-size: 2rem; font-weight: 950; letter-spacing: -1px; color: #fff; }
    .widget-value.mono { font-family: 'Fira Code', monospace; font-size: 1.6rem; }
    .widget-mastery { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; z-index: 2; }
    .circular-progress { position: relative; width: 70px; height: 70px; }
    .chart-svg { transform: rotate(-90deg); }
    .circle-bg { fill: none; stroke: rgba(255,255,255,0.02); stroke-width: 2.5; }
    .circle-fg { fill: none; stroke: var(--accent); stroke-width: 2.5; stroke-linecap: round; transition: stroke-dasharray 1s ease-out; }
    .perc-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 950; font-family: 'Fira Code', monospace; }

    /* VAULTS & FLUX */
    .vault-tokens { display: flex; flex-wrap: wrap; gap: 0.4rem; position: relative; z-index: 2; }
    .vault-token {
      background: rgba(255,255,255,0.015);
      border: 1px solid rgba(255,255,255,0.03);
      padding: 0.35rem 0.6rem; border-radius: 8px;
      display: flex; align-items: center; gap: 0.4rem;
      font-size: 0.65rem; font-weight: 700; color: #888;
    }
    .vault-token span:first-child { font-size: 0.8rem; opacity: 0.2; }
    .flux-viz { flex: 1; height: 35px; padding-top: 4px; position: relative; z-index: 2; }
    .flux-svg { width: 100%; height: 100%; }

    /* MISC */
    kbd { background: #1a1a1a; border-radius: 4px; padding: 0.1rem 0.25rem; border: 1px solid #2a2a2a; font-family: inherit; font-size: 0.6rem; color: #666; }
    .neon-text { color: var(--accent); text-shadow: 0 0 10px rgba(154, 205, 50, 0.2); }
    .clickable { cursor: pointer; }
    .mb-1 { margin-bottom: 0.5rem; }
    .mt-1 { margin-top: 0.4rem; }

    /* MODAL UI */
    .cc-input, .cc-select {
      width: 100%; padding: 0.75rem 1rem; background: #070907; border: 1px solid rgba(255,255,255,0.05);
      border-radius: 10px; color: #fff; font-family: 'Inter', sans-serif; font-size: 0.85rem;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
    }
    .cc-input:focus, .cc-select:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 15px rgba(154, 205, 50, 0.1); }
    .modal-body label { font-size: 0.55rem; font-weight: 950; opacity: 0.2; letter-spacing: 1px; margin-bottom: 0.4rem; display: block; }
    .input-group { margin-bottom: 1.25rem; }

    @keyframes pulse { 0% { opacity: 0.2; transform: scale(0.95); } 50% { opacity: 0.6; transform: scale(1.05); } 100% { opacity: 0.2; transform: scale(0.95); } }
  `]

})
export class CommandCenterComponent implements OnInit {
  private readonly db = inject(DatabaseService);
  private readonly router = inject(Router);

  // Dashboard Data
  dueModules: any[] = [];
  recentVaults: any[] = [];
  heatmapNodes: any[] = [];
  streak: number = 0;
  apiCallsToday: number = 14; // Mock
  masteryRatio: number = 0;
  retentionPath: string = '';
  sparklinePath: string = '';

  // Pomodoro
  pomoTime: string = '25:00';
  pomo = { seconds: 1500, running: false, interval: null as any };

  // UI State
  isDragging = false;
  showCompiler = false;
  injectionStatus: 'idle' | 'success' | 'error' = 'idle';
  injectionMsg = '';

  compiler = {
    theme: '',
    level: 'Intermedio' as DifficultyLevel,
    count: 10
  };

  async ngOnInit() {
    await this.refreshAllData();
    this.generateMockHeatmap();
    this.generateRetentionPath();
    this.generateSparkline();
  }

  async refreshAllData() {
    this.dueModules = await this.db.getDueNodesSummary();
    this.recentVaults = await this.db.getRecentFolders(3);
    const activity = await this.db.getDailyActivity(365);
    this.masteryRatio = await this.db.getMasteryRatio();
    
    // Calcular racha
    let currentStreak = 0;
    const sortedActivity = [...activity].reverse();
    for (const day of sortedActivity) {
      if (day.count > 0) currentStreak++;
      else if (day.date === new Date().toISOString().split('T')[0]) continue;
      else break;
    }
    this.streak = currentStreak;
  }

  getY(i: number): number {
    return Math.floor(i / 52);
  }

  generateMockHeatmap() {
    // 52 semanas * 7 días = 364 días
    this.heatmapNodes = Array.from({ length: 364 }, (_, i) => ({
      date: `Day ${i}`,
      count: Math.floor(Math.random() * 20)
    }));
  }

  getHeatColor(count: number): string {
    if (count === 0) return '#111411';
    if (count < 5) return 'rgba(159, 255, 34, 0.2)';
    if (count < 15) return 'rgba(159, 255, 34, 0.5)';
    return '#9FFF22';
  }

  generateRetentionPath() {
    // Simulación suave de curva
    let p = 'M 0 150';
    for (let x = 0; x <= 600; x += 10) {
      const y = 50 + 80 * Math.exp(-x / 200) + Math.sin(x/50)*5;
      p += ` L ${x} ${150 - y}`;
    }
    p += ' L 600 150 Z';
    this.retentionPath = p;
  }

  generateSparkline() {
    let p = 'M 0 25';
    for (let x = 0; x <= 100; x += 10) {
      const y = 10 + Math.random() * 15;
      p += ` L ${x} ${30 - y}`;
    }
    this.sparklinePath = p;
  }

  togglePomo() {
    this.pomo.running = !this.pomo.running;
    if (this.pomo.running) {
       this.pomo.interval = setInterval(() => {
         if (this.pomo.seconds > 0) {
           this.pomo.seconds--;
           const m = Math.floor(this.pomo.seconds / 60);
           const s = this.pomo.seconds % 60;
           this.pomoTime = `${m}:${s.toString().padStart(2, '0')}`;
         } else {
           this.togglePomo();
         }
       }, 1000);
    } else {
      clearInterval(this.pomo.interval);
    }
  }

  async openCompilerModal() {
    this.showCompiler = true;
  }

  async copyPrompt() {
    const promptTemplate = `
Eres la Matriz Maestra de NodeMesh. Transforma este texto en una taxonomía de ${this.compiler.count} retos cognitivos.
NIVEL DE DIFICULTAD: ${this.compiler.level}
TEMA: ${this.compiler.theme}
Sigue estrictamente el esquema JSON definido.
    `.trim();
    await navigator.clipboard.writeText(promptTemplate);
    this.showCompiler = false;
    alert('Prompt Copiado. Pégalo en tu IA.');
  }

  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging = true; }
  onDragLeave(e: DragEvent) { this.isDragging = false; }
  async onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file && file.name.endsWith('.json')) {
      const text = await file.text();
      this.processInjection(text);
    }
  }

  async processInjection(jsonStr: string) {
    try {
      const payload = JSON.parse(jsonStr);
      const nodes = Array.isArray(payload) ? payload : (payload.nodos || []);
      if (nodes.length > 0) {
        await this.db.saveNodes(nodes.map((n: any) => ({ ...n, nextReviewDate: new Date() })));
        this.injectionStatus = 'success';
        this.injectionMsg = `¡${nodes.length} Nodos Inyectados!`;
        this.refreshAllData();
      }
    } catch (e) {
      this.injectionStatus = 'error';
      this.injectionMsg = 'Formato JSON Inválido';
    }
    setTimeout(() => this.injectionStatus = 'idle', 3000);
  }

  startSprint(folderId: string) {
    this.router.navigate(['/simulator'], { queryParams: { folder: folderId } });
  }

  startInterleaving() {
    this.router.navigate(['/simulator'], { queryParams: { interleaving: 'true' } });
  }
}
