import { Component, inject, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../../core/services/ui/theme.service';
import { LiquidGlassComponent } from '../../../../shared/components/liquid-glass/liquid-glass.component';
import { Router } from '@angular/router';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { TestUploadComponent } from '../../components/test-upload/test-upload.component';
import { PromptCompilerComponent } from '../../components/prompt-compiler/prompt-compiler.component';
import { TriageQueueComponent } from '../../components/triage-queue/triage-queue.component';
import { FocusTargetBentoComponent } from '../../components/focus-target-bento/focus-target-bento.component';
import { CognitiveActivityMapComponent } from '../../components/cognitive-activity-map/cognitive-activity-map.component';
import { StreakBentoComponent } from '../../components/streak-bento/streak-bento.component';
import { TotalMasteryBentoComponent } from '../../components/total-mastery-bento/total-mastery-bento.component';
import { PomodoroBentoComponent } from '../../components/pomodoro-bento/pomodoro-bento.component';
import { UI_ICONS } from '../../../../shared/constants/icons.constants';

@Component({
  selector: 'app-command-center',
  standalone: true,
  imports: [CommonModule, FormsModule, LiquidGlassComponent, TestUploadComponent, PromptCompilerComponent, TriageQueueComponent, FocusTargetBentoComponent, CognitiveActivityMapComponent, StreakBentoComponent, TotalMasteryBentoComponent, PomodoroBentoComponent],
  template: `
    <div class="command-center-container">
      <header class="cc-header">
        <div class="header-left">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256" style="color: var(--theme-text); flex-shrink:0;"><path d="M128,128a12,12,0,0,1-4.5,9.37l-40,32a12,12,0,1,1-15-18.75L100.28,128,68.5,102.62a12,12,0,1,1,15-18.75l40,32A12,12,0,0,1,128,128Zm60,12H136a12,12,0,0,0,0,24h52a12,12,0,0,0,0-24Zm44-100V216a20,20,0,0,1-20,20H44a20,20,0,0,1-20-20V40A20,20,0,0,1,44,20H212A20,20,0,0,1,232,40ZM208,212V44H48V212H208Z"></path></svg>
            <h1 class="cc-title">Command Center</h1>
          </div>
          <div class="header-meta">
            <p class="cc-subtitle">Orquesta tu Flujo Cognitivo</p>
          </div>
        </div>

      </header>

      <div class="cc-grid">
        <!-- PRIMARY OPS: INJECT PAYLOAD (Wide) -->
        <div class="cc-card span-8 row-2 card-ingest"
             (dragenter)="onDragEnter($event)"
             (dragover)="onDragOver($event)" 
             (dragleave)="onDragLeave($event)" 
             (drop)="onDrop($event)"
             [class.dragging]="isDragging"
             [class.ctrl-active]="isCtrlPressed">
          
          <div class="ingest-header">
            <div class="ingest-title">
              <svg [class.green-key]="isCtrlPressed" style="transition: color 0.2s; flex-shrink:0;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224ZM157.66,106.34a8,8,0,0,1-11.32,11.32L136,107.31V152a8,8,0,0,1-16,0V107.31l-10.34,10.35a8,8,0,0,1-11.32-11.32l24-24a8,8,0,0,1,11.32,0Z"></path></svg>
              <h2 class="title-tech">Subir Preguntas</h2>
            </div>
            <button class="btn-generate-prompt-original" (click)="openCompilerModal()">
              <div class="btn-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,128a8,8,0,0,1-3,6.25l-40,32a8,8,0,1,1-10-12.5L107.19,128,75,102.25a8,8,0,1,1,10-12.5l40,32A8,8,0,0,1,128,128Zm48,24H136a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Zm56-96V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56ZM216,200V56H40V200H216Z"></path></svg>
                <span>Generar Prompt</span>
              </div>
            </button>
          </div>

          <div class="ingest-body-compact">
            <svg class="cloud-icon-small" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256"><path d="M178.34,165.66,160,147.31V208a8,8,0,0,1-16,0V147.31l-18.34,18.35a8,8,0,0,1-11.32-11.32l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32ZM160,40A88.08,88.08,0,0,0,81.29,88.68,64,64,0,1,0,72,216h40a8,8,0,0,0,0-16H72a48,48,0,0,1,0-96c1.1,0,2.2,0,3.29.12A88,88,0,0,0,72,128a8,8,0,0,0,16,0,72,72,0,1,1,100.8,66,8,8,0,0,0,3.2,15.34,7.9,7.9,0,0,0,3.2-.68A88,88,0,0,0,160,40Z"></path></svg>
            <div class="ingest-pasted-text">
              <p>Usa <span [class.green-key]="isCtrlPressed">CTRL</span>+V para subir tus Preguntas</p>
              <small>También puedes subir tu archivo .JSON</small>
            </div>
            <button class="btn-explore-v2" (click)="fileInput.click()">Explorar Archivos</button>
            <input type="file" #fileInput (change)="onFileSelected($event)" accept=".json" style="display: none;">
          </div>
        </div>

        <!-- ACTION: FORZAR SPRINT -->
        <div class="cc-card span-4 row-2 card-action-main glassy-card-container">
          <app-focus-target-bento
             [folders]="allFolders"
             (onSprintStart)="startSprint($event)">
          </app-focus-target-bento>
        </div>

        <!-- TRIAGE: QUEUE -->
        <div class="cc-card span-4 row-4 card-triage glassy-card-container">
          <app-triage-queue 
            [dueModules]="dueModules" 
            (onSprintStart)="startSprint($event)">
          </app-triage-queue>
        </div>

        <!-- INSIGHTS: HEATMAP -->
        <div class="cc-card span-8 row-4 glassy-card-container">
          <app-cognitive-activity-map [activityData]="dailyActivity"></app-cognitive-activity-map>
        </div>

        <!-- WIDGETS -->
        <div class="cc-card span-4 row-2 glassy-card-container">
          <app-streak-bento [activityData]="dailyActivity"></app-streak-bento>
        </div>

        <div class="cc-card span-4 row-2 glassy-card-container">
          <app-total-mastery-bento [masteryRatio]="masteryRatio" [folderBreakdown]="folderMasteryBreakdown"></app-total-mastery-bento>
        </div>

        <div class="cc-card span-4 row-2 glassy-card-container">
          <app-pomodoro-bento></app-pomodoro-bento>
        </div>
      </div>

      <!-- MODALES REFRACTORIZADOS -->
      <app-test-upload 
        *ngIf="showUploadModal" 
        [payload]="temporaryUploadPayload"
        (onCancel)="closeUploadModal()"
        (onUploadSuccess)="onUploadFinished($event)">
      </app-test-upload>

      <app-prompt-compiler
        *ngIf="showCompiler"
        (onCancel)="showCompiler = false">
      </app-prompt-compiler>

      <div class="injection-toast" *ngIf="injectionStatus !== 'idle'" [class]="injectionStatus">
        <span class="material-symbols-rounded">{{ injectionStatus === 'success' ? 'check_circle' : 'error' }}</span>
        {{ injectionMsg }}
      </div>
    </div>
  `,
  styles: [`
    :host { 
      --accent: var(--theme-brand-accent); 
      --accent-glow: var(--theme-brand-neon-alt);
      --glass-fill: rgba(17, 20, 17, 0.4);
      --glass-fill-accent: rgba(154, 205, 50, 0.12);
      --glass-border: var(--theme-border);
      display: block;
      min-height: 100vh;
      background: radial-gradient(circle at top right, var(--theme-surface-solid), var(--theme-bg));
      color: var(--theme-text);
      font-family: 'JetBrains Mono', monospace;
    }
    :host-context([data-theme="light"]) { --glass-fill: rgba(255, 255, 255, 0.15); --glass-fill-accent: rgba(154, 205, 50, 0.08); }
    .command-center-container { padding: 2rem 2rem 1rem; max-width: 1500px; margin: 0; }
    .cc-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .cc-title { font-size: 1.3rem; font-weight: 800; letter-spacing: -0.03em; margin: 0; line-height: 1; color: var(--theme-text); }
    .header-meta { display: flex; align-items: center; gap: 1rem; margin-top: 0.25rem; }
    .cc-subtitle { font-size: 0.85rem; opacity: 0.85; margin: 0; }
    
    .cc-tabs { display: flex; gap: 0.5rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 4px; border-radius: 12px; }
    .nav-btn { 
      background: transparent; border: none; color: var(--theme-text-secondary); 
      padding: 0.6rem 1rem; border-radius: 8px; display: flex; align-items: center; gap: 0.6rem; 
      font-family: inherit; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s; opacity: 0.7;
    }
    .nav-btn:hover { background: rgba(255,255,255,0.05); opacity: 1; }
    .nav-btn.active { background: rgba(159, 255, 34, 0.1); color: var(--theme-brand-neon); border: 1px solid rgba(159, 255, 34, 0.2); opacity: 1; }
    .nav-btn .material-symbols-rounded { font-size: 1.25rem; }

    .status-pill { background: var(--theme-border); padding: 0.3rem 0.6rem; border-radius: 6px; display: flex; align-items: center; gap: 0.5rem; font-size: 0.6rem; font-weight: 800; border: 1px solid rgba(255,255,255,0.05); }
    .cc-grid { display: grid; grid-template-columns: repeat(12, 1fr); grid-auto-rows: minmax(50px, auto); gap: 10px; }
    .span-12 { grid-column: span 12; } .span-8 { grid-column: span 8; } .span-6 { grid-column: span 6; } .span-5 { grid-column: span 5; } .span-4 { grid-column: span 4; } .span-3 { grid-column: span 3; }
    .row-4 { grid-row: span 4; } .row-2 { grid-row: span 2; }
    .cc-card { position: relative; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; background: var(--theme-surface-solid); border: 1px solid var(--theme-border); transition: 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); }
    .cc-card:hover { transform: translateY(-2px); border-color: rgba(159, 255, 34, 0.3); }
    
    .glassy-card-container { background: transparent; border: none; box-shadow: none; }
    :host-context([data-theme="light"]) .glassy-card-container { background: var(--theme-surface-solid); border: 1px solid var(--theme-border); box-shadow: 0 4px 15px rgba(0,0,0,0.03); }

    .card-inner { height: 100%; padding: 1rem; position: relative; z-index: 2; }
    .card-inner.no-padding { padding: 0; }
    .centered { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .gap-compact { gap: 0.5rem; }
    .card-ingest { 
      border: none; 
      background: rgba(255, 255, 255, 0.01); 
      border-radius: 20px; 
      position: relative;
      background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='20' ry='20' stroke='rgba(255,255,255,0.22)' stroke-width='5' stroke-dasharray='10%2c 14' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e");
      transition: all 0.3s ease;
    }
    .card-ingest.dragging, .card-ingest.ctrl-active { 
      background: rgba(154, 205, 50, 0.03);
      background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='20' ry='20' stroke='%239FFF22' stroke-width='5' stroke-dasharray='10%2c 14' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e");
      box-shadow: inset 0 0 20px rgba(159, 255, 34, 0.04);
    }
    .ingest-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; }
    .ingest-title { display: flex; align-items: center; gap: 0.75rem; color: var(--theme-text-secondary); }
    .title-tech { font-size: 1.15rem; font-weight: 500; margin: 0; font-family: 'JetBrains Mono', monospace; opacity: 0.8; }
    .btn-generate-prompt-original { background: rgba(255,255,255,0.03); border: 1px solid var(--theme-border); color: var(--theme-text-secondary); padding: 0.35rem 0.8rem; border-radius: 6px; cursor: pointer; transition: 0.2s; font-size: 0.75rem; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
    .btn-generate-prompt-original:hover { background: rgba(255,255,255,0.08); color: var(--theme-text); border-color: var(--theme-text-muted); }
    .btn-inner { display: flex; align-items: center; gap: 0.5rem; }
    .ingest-body-compact { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; padding: 0.5rem 1rem 2rem; gap: 0.75rem; }
    .cloud-icon-small { opacity: 0.4; color: var(--theme-text-secondary); filter: drop-shadow(0 0 10px rgba(255,255,255,0.05)); }
    .ingest-pasted-text { text-align: center; line-height: 1.6; }
    .ingest-pasted-text p { font-size: 1rem; font-weight: 500; margin: 0 0 0.3rem; opacity: 0.9; }
    .ingest-pasted-text small { font-size: 0.8rem; opacity: 0.4; }
    .green-key { color: var(--theme-brand-neon); font-weight: 800; text-shadow: 0 0 8px var(--theme-brand-neon); }
    .btn-explore-v2 { background: var(--theme-brand-neon); color: #000; border: none; border-radius: 8px; padding: 0.6rem 2rem; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 800; cursor: pointer; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 0 transparent; }
    .btn-explore-v2:hover { background: var(--theme-brand-neon); transform: translateY(-2px); box-shadow: 0 0 15px var(--theme-brand-neon); opacity: 1; }
    .btn-explore-v2:active { transform: translateY(0); box-shadow: 0 0 5px var(--theme-brand-neon); }
    .header-micro-technical { padding: 0.8rem 1rem; display: flex; align-items: center; gap: 0.6rem; background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--theme-border); }
    .label-micro { font-size: 0.65rem; font-weight: 800; letter-spacing: 0.5px; color: var(--theme-text-secondary); font-family: 'JetBrains Mono', monospace; opacity: 0.5; }

    .heatmap-container-v2 { padding: 1rem; display: flex; align-items: center; justify-content: center; }
    .heatmap-svg-v2 { width: 100%; height: auto; }
    .widget-square-compact { height: 100%; display: flex; flex-direction: column; padding: 1rem 1.25rem; }
    .widget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .widget-value-compact { font-size: 1.4rem; font-weight: 800; color: var(--theme-text); }
    .sparkline-mini { height: 25px; margin-top: 0.5rem; opacity: 0.6; }
    
    .widget-mastery-compact { display: flex; flex-direction: column; height: 100%; padding: 1rem 1.25rem; }
    .mastery-header { margin-bottom: 0.5rem; }
    .mastery-body { display: flex; align-items: center; gap: 1rem; flex: 1; }
    .mastery-info { display: flex; flex-direction: column; }
    .mastery-value { font-size: 1.4rem; font-weight: 800; color: var(--theme-text); line-height: 1.1; }
    .mastery-sub { font-size: 0.65rem; color: var(--theme-text-secondary); opacity: 0.6; font-weight: 700; text-transform: uppercase; }
    
    .pomo-body { display: flex; flex-direction: column; justify-content: center; flex: 1; }

    .circular-progress-small { position: relative; width: 50px; height: 50px; flex-shrink: 0; }
    .perc-text-mini { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800; opacity: 0.8; }
    .chart-svg { transform: rotate(-90deg); width: 100%; height: 100%; }
    .circle-bg { fill: none; stroke: rgba(255,255,255,0.05); stroke-width: 3; }
    .circle-fg { fill: none; stroke: var(--theme-brand-neon); stroke-width: 3; stroke-linecap: round; transition: stroke-dasharray 0.3s ease; }
    :host-context([data-theme="light"]) .circle-bg { stroke: rgba(0,0,0,0.05); }

    .btn-sprint-main-compact { background: var(--theme-brand-neon); color: #000; border: none; padding: 0.6rem 1.25rem; border-radius: 8px; font-weight: 900; font-size: 0.8rem; cursor: pointer; font-family: 'JetBrains Mono', monospace; }
    .size-big { font-size: 2.2rem; } .size-mini-icon { font-size: 1rem; opacity: 0.5; }
    .meter-bar-mini { height: 4px; background: rgba(255,255,255,0.05); border-radius: 100px; overflow: hidden; margin-top: 0.5rem; }
    .meter-fill { height: 100%; background: var(--theme-brand-neon); transition: width 1s linear; }
    .injection-toast { position: fixed; bottom: 1.5rem; right: 1.5rem; padding: 0.8rem 1.25rem; border-radius: 10px; display: flex; align-items: center; gap: 0.7rem; z-index: 2000; font-size: 0.85rem; }
    .injection-toast.success { background: var(--theme-brand-neon); color: #000; box-shadow: 0 10px 30px rgba(159, 255, 34, 0.2); }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .btn-inner svg { position: relative; top: -1px; }
    
    :host-context([data-theme="light"]) .cc-card { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-color: #e0e3e8; }
    :host-context([data-theme="light"]) .card-ingest { 
      background: rgba(0,0,0,0.01);
      background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='20' ry='20' stroke='rgba(0,0,0,0.25)' stroke-width='5' stroke-dasharray='10%2c 14' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e");
    }
    :host-context([data-theme="light"]) .card-ingest.dragging,
    :host-context([data-theme="light"]) .card-ingest.ctrl-active {
      background: rgba(58,125,10,0.05);
      background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='20' ry='20' stroke='%233a7d0a' stroke-width='5' stroke-dasharray='10%2c 14' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e");
      box-shadow: inset 0 0 20px rgba(58,125,10,0.06);
    }
    :host-context([data-theme="light"]) .ingest-title { color: #333; }
    :host-context([data-theme="light"]) .title-tech { opacity: 1; color: #222; font-weight: 600; }
    :host-context([data-theme="light"]) .cloud-icon-small { color: #888; opacity: 0.5; }
    :host-context([data-theme="light"]) .ingest-pasted-text p { color: #222; }
    :host-context([data-theme="light"]) .ingest-pasted-text small { color: #666; }
    :host-context([data-theme="light"]) .green-key { color: #3a7d0a; text-shadow: none; font-weight: 900; }
    :host-context([data-theme="light"]) .btn-generate-prompt-original { background: #f5f5f7; border-color: #d1d5db; color: #444; }
    :host-context([data-theme="light"]) .btn-generate-prompt-original:hover { background: #ebebef; color: #222; }
    :host-context([data-theme="light"]) .btn-explore-v2 { color: #fff; }

  `]
})
export class CommandCenterComponent implements OnInit {
  private readonly db = inject(DatabaseService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly cdr = inject(ChangeDetectorRef);
  
  protected readonly UI_ICONS = UI_ICONS;
  isDark$ = this.themeService.isDark$;

  // Dashboard State
  dueModules: any[] = [];
  allFolders: any[] = [];
  dailyActivity: { date: string, count: number }[] = [];
  masteryRatio: number = 0;
  folderMasteryBreakdown: any[] = [];
  retentionPath: string = '';
  sparklinePath: string = '';

  // UI Flow State
  isDragging = false;
  isCtrlPressed = false;
  showUploadModal = false;
  showCompiler = false;
  temporaryUploadPayload = '';
  
  injectionStatus: 'idle' | 'success' | 'error' = 'idle';
  injectionMsg = '';

  async ngOnInit() {
    this.generateRetentionPath();
    this.generateSparkline();
    await this.refreshAllData();
  }

  async onUploadFinished(msg: string) {
    this.showUploadModal = false;
    this.injectionStatus = 'success';
    this.injectionMsg = msg;
    await this.refreshAllData();
    setTimeout(() => this.injectionStatus = 'idle', 4000);
  }

  openCompilerModal() { this.showCompiler = true; }

  async refreshAllData() {
    this.dueModules = await this.db.getDueNodesSummary();
    this.allFolders = await this.db.getAllFolders();
    const activity = await this.db.getDailyActivity(365);
    this.dailyActivity = activity;
    this.masteryRatio = await this.db.getMasteryRatio() || 0;
    this.folderMasteryBreakdown = await this.db.getFolderMasteryBreakdown();
    
    this.cdr.detectChanges();
  }

  // --- MÉTODOS DE SOPORTE UI DASHBOARD ---

  generateRetentionPath() {
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

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) { if (e.key === 'Control' || e.metaKey) this.isCtrlPressed = true; }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent) { if (e.key === 'Control' || (!e.ctrlKey && !e.metaKey)) this.isCtrlPressed = false; }

  @HostListener('window:paste', ['$event'])
  onPaste(e: ClipboardEvent) {
    if (this.showUploadModal || this.showCompiler) return;
    const text = e.clipboardData?.getData('text');
    if (text) {
      this.isCtrlPressed = false;
      this.temporaryUploadPayload = text;
      this.showUploadModal = true;
    }
  }

  onDragEnter(e: DragEvent) { e.preventDefault(); this.isDragging = true; }
  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging = true; }
  onDragLeave(e: DragEvent) { this.isDragging = false; }
  async onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file && file.name.endsWith('.json')) {
      this.temporaryUploadPayload = await file.text();
      this.showUploadModal = true;
    }
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.json')) {
      this.temporaryUploadPayload = await file.text();
      this.showUploadModal = true;
    }
    event.target.value = '';
  }

  startInterleaving() { this.router.navigate(['/simulator'], { queryParams: { interleaving: 'true' } }); }
  startSprint(folderId: string) { this.router.navigate(['/vault'], { queryParams: { playFolder: folderId } }); }

  closeUploadModal() {
    this.showUploadModal = false;
  }
}
