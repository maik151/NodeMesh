import { Component, Input, Output, EventEmitter, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LiquidGlassComponent } from '../../../../shared/components/liquid-glass/liquid-glass.component';

@Component({
  selector: 'app-focus-target-bento',
  standalone: true,
  imports: [CommonModule, FormsModule, LiquidGlassComponent],
  host: {
    style: 'display: block; height: 100%; width: 100%;'
  },
  template: `
    <div class="bento-wrapper">
      <app-liquid-glass [simple]="true" [radius]="20" [depth]="3" [blur]="20" [backgroundColor]="mode === 'active' ? 'var(--glass-fill-accent)' : 'var(--glass-fill)'" style="display: flex; flex-direction: column; height: 100%;">
        
        <!-- ESTADO 1: INACTIVO (IDLE) -->
        <div *ngIf="mode === 'idle'" class="card-inner centered gap-compact inactive-state fade-in">
          <span class="material-symbols-rounded size-big muted-text" style="margin-bottom: 0.5rem;">lock</span>
          <button class="btn-sprint-main-compact disabled" disabled>FORZAR_SPRINT</button>
          <span class="label-micro text-muted" style="margin-top: 0.5rem;">TARGET: NONE</span>
          
          <div style="flex-grow: 1;"></div>
          
          <button class="btn-text-link mt-2" (click)="startConfiguring()">Fijar Nuevo Objetivo</button>
        </div>

        <!-- ESTADO 2: CONFIGURANDO (FORM) -->
        <div *ngIf="mode === 'configuring'" class="card-inner setup-mode slide-left">
          <div class="setup-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--theme-brand-neon)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="target-icon-neon">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            <h2 class="title-small">Nuevo Objetivo</h2>
          </div>

          <div class="form-group w-full relative" style="z-index: 10; margin-top: 0.5rem;">
            <label>CARPETA / TEMA</label>
            <div class="custom-dropdown" (click)="dropdownOpen = !dropdownOpen; $event.stopPropagation()">
              <div class="dropdown-selected compact-input" [class.open]="dropdownOpen">
                <span class="selected-text">{{ getSelectedFolderName() || 'Elige un tema...' }}</span>
                <span class="material-symbols-rounded">expand_more</span>
              </div>
              <div class="dropdown-options fade-in-fast" *ngIf="dropdownOpen">
                <div class="dropdown-option compact-opt" (click)="selectFolder(''); $event.stopPropagation()">
                  <span class="material-symbols-rounded icon-opt">folder_off</span>
                  Elige un tema...
                </div>
                <div class="dropdown-option compact-opt" *ngFor="let folder of folders" (click)="selectFolder(folder.folder_id); $event.stopPropagation()">
                  <span class="material-symbols-rounded icon-opt" style="color: var(--theme-brand-neon)">folder</span>
                  {{ folder.nombre_tema }}
                </div>
              </div>
            </div>
          </div>

          <div class="form-group w-full" style="margin-top: 0.5rem;">
            <label>FECHA LÍMITE</label>
            <div class="date-input-wrapper">
              <input type="date" class="custom-input compact-input" [(ngModel)]="deadline">
            </div>
          </div>

          <div style="flex-grow: 1;"></div>

          <div class="modal-actions w-full" style="margin-top: 0.6rem;">
            <button class="btn-cancel compact-btn" (click)="cancelConfig()">Cancelar</button>
            <button class="btn-fijar compact-btn" (click)="setTarget()" [disabled]="!selectedFolderId || !deadline">FIJAR</button>
          </div>
        </div>

        <!-- ESTADO 3: ACTIVO (HUD) -->
        <div *ngIf="mode === 'active'" class="card-inner centered gap-compact active-state relative fade-in">
          <button class="btn-close-mini" (click)="clearTarget()" title="Eliminar Objetivo">
            <span class="material-symbols-rounded">close</span>
          </button>

          <span class="material-symbols-rounded size-big neon-text" style="margin-bottom: 0.5rem;">bolt</span>
          <button class="btn-sprint-main-compact active-glow" (click)="onSprintStart.emit(activeTarget.folder_id)">FORZAR_SPRINT</button>
          
          <div class="stress-meter-mini">
            <div class="meter-bar" style="width: 100%"></div>
            <span class="label-micro neon-text">STRESS_LVL: MAX</span>
          </div>

          <div style="flex-grow: 1;"></div>

          <div class="hud-mini mt-3 w-full">
            <div class="hud-title-row">
              <div class="pulse-dot"></div>
              <span class="hud-title">{{ activeTarget.nombre_tema }}</span>
            </div>
            <div class="hud-countdown">
              <span class="hud-days">{{ daysRemaining }}</span>
              <span class="hud-days-label">DÍAS RESTANTES</span>
            </div>
          </div>
        </div>

      </app-liquid-glass>
    </div>
  `,
  styles: [`
    .bento-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    app-liquid-glass {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

    .card-inner {
      padding: 1.2rem;
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
      flex: 1;
    }
    
    .centered {
      align-items: center;
      justify-content: flex-start;
      text-align: center;
      padding-top: 1.2rem;
    }

    .setup-mode {
      align-items: flex-start;
      justify-content: flex-start;
      text-align: left;
    }

    .gap-compact { gap: 0.4rem; }
    .mt-2 { margin-top: 0.4rem; }
    .mt-3 { margin-top: 0.8rem; }
    .mb-3 { margin-bottom: 0.8rem; }
    .w-full { width: 100%; }
    .relative { position: relative; }

    /* ANIMACIONES */
    .fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }

    .fade-in-fast {
      animation: fadeInFast 0.15s ease-out forwards;
    }
    @keyframes fadeInFast {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .slide-left {
      animation: slideLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
    }
    @keyframes slideLeft {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    /* TYPOGRAPHY & COLORS */
    .size-big { font-size: 2rem; }
    .muted-text { color: rgba(255, 255, 255, 0.4); }
    :host-context([data-theme="light"]) .muted-text { color: rgba(0, 0, 0, 0.4); }
    .text-muted { color: #666; }

    .neon-text, .text-neon {
      color: var(--theme-brand-neon);
      text-shadow: 0 0 10px rgba(163, 255, 0, 0.3);
    }
    :host-context([data-theme="light"]) .neon-text,
    :host-context([data-theme="light"]) .text-neon {
      color: #3a7d0a;
      text-shadow: none;
    }

    /* BOTONES GLOBALES */
    .btn-sprint-main-compact {
      width: 100%;
      padding: 0.7rem;
      border-radius: 8px;
      font-family: inherit;
      font-weight: 800;
      font-size: 0.8rem;
      letter-spacing: 1px;
      border: none;
      transition: all 0.3s;
    }

    .btn-sprint-main-compact.disabled {
      background: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.3);
      cursor: not-allowed;
    }
    :host-context([data-theme="light"]) .btn-sprint-main-compact.disabled {
      background: rgba(0, 0, 0, 0.05);
      color: rgba(0, 0, 0, 0.3);
    }

    .btn-sprint-main-compact.active-glow {
      background: var(--theme-brand-neon);
      color: #000;
      cursor: pointer;
      box-shadow: 0 0 15px rgba(163, 255, 0, 0.2);
    }
    :host-context([data-theme="light"]) .btn-sprint-main-compact.active-glow {
      background: #84cc16;
    }
    .btn-sprint-main-compact.active-glow:hover {
      box-shadow: 0 0 25px rgba(163, 255, 0, 0.4);
      transform: translateY(-1px);
    }

    .label-micro {
      font-size: 0.6rem;
      letter-spacing: 1px;
      font-weight: 700;
    }

    .btn-text-link {
      background: none;
      border: none;
      color: var(--theme-brand-neon);
      font-size: 0.8rem;
      font-family: inherit;
      cursor: pointer;
      text-decoration: underline;
      opacity: 0.8;
      margin-top: auto;
      padding-bottom: 0.5rem;
    }
    .btn-text-link:hover { opacity: 1; }

    .btn-close-mini {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      padding: 0.2rem;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-close-mini:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
    .btn-close-mini span { font-size: 1.2rem; }

    /* ESTADO 3: HUD */
    .stress-meter-mini {
      width: 100%;
      text-align: center;
      margin-top: 0.2rem;
    }
    .meter-bar {
      height: 4px;
      background: var(--theme-brand-neon);
      border-radius: 2px;
      margin-bottom: 4px;
      box-shadow: 0 0 8px rgba(163, 255, 0, 0.5);
    }

    .hud-mini {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 0.8rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-top: auto;
    }
    :host-context([data-theme="light"]) .hud-mini {
      background: rgba(255, 255, 255, 0.5);
      border-color: rgba(0, 0, 0, 0.05);
    }

    .hud-title-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      background: #ff4444;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7); }
      70% { box-shadow: 0 0 0 4px rgba(255, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0); }
    }

    .hud-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 150px;
    }
    :host-context([data-theme="light"]) .hud-title { color: #000; }

    .hud-countdown {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .hud-days {
      font-size: 1.8rem;
      font-weight: 800;
      color: #fff;
      line-height: 1;
    }
    :host-context([data-theme="light"]) .hud-days { color: #000; }

    .hud-days-label {
      font-size: 0.55rem;
      color: #888;
      font-weight: 700;
      margin-top: 2px;
    }

    /* ESTADO 2: SETUP FORM */
    .setup-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 0.8rem;
      width: 100%;
    }
    :host-context([data-theme="light"]) .setup-header { border-bottom-color: rgba(0,0,0,0.1); }

    .target-icon-neon {
      filter: drop-shadow(0 0 8px rgba(163, 255, 0, 0.4));
    }
    :host-context([data-theme="light"]) .target-icon-neon {
      stroke: #3a7d0a;
      filter: none;
    }

    .title-small {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #fff;
    }
    :host-context([data-theme="light"]) .title-small { color: #1e293b; }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .form-group label {
      font-size: 0.6rem;
      color: #888;
      letter-spacing: 1.5px;
      font-weight: 600;
    }

    /* CUSTOM DROPDOWN UI */
    .custom-dropdown {
      position: relative;
      width: 100%;
    }
    
    .dropdown-selected {
      background: #1e1e1e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      padding: 0.6rem 0.8rem;
      border-radius: 8px;
      font-size: 0.8rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s;
    }
    :host-context([data-theme="light"]) .dropdown-selected {
      background: #fff;
      border-color: #cbd5e1;
      color: #1e293b;
    }
    
    .dropdown-selected:hover, .dropdown-selected.open {
      border-color: var(--theme-brand-neon);
      background: rgba(255,255,255,0.08);
    }
    :host-context([data-theme="light"]) .dropdown-selected:hover,
    :host-context([data-theme="light"]) .dropdown-selected.open {
      border-color: #3a7d0a;
      background: #f8fafc;
    }
    
    .selected-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-selected .material-symbols-rounded {
      font-size: 1.1rem;
      opacity: 0.5;
      transition: transform 0.2s;
    }
    .dropdown-selected.open .material-symbols-rounded {
      transform: rotate(180deg);
    }

    .dropdown-options {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      width: 100%;
      background: #1a1a1a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      z-index: 100;
      max-height: 150px;
      overflow-y: auto;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    :host-context([data-theme="light"]) .dropdown-options {
      background: #fff;
      border-color: #cbd5e1;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    
    /* Scrollbar for dropdown */
    .dropdown-options::-webkit-scrollbar { width: 6px; }
    .dropdown-options::-webkit-scrollbar-track { background: transparent; }
    .dropdown-options::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
    :host-context([data-theme="light"]) .dropdown-options::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); }

    .dropdown-option {
      padding: 0.6rem 0.8rem;
      font-size: 0.8rem;
      cursor: pointer;
      color: #ccc;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.2s, color 0.2s;
    }
    :host-context([data-theme="light"]) .dropdown-option {
      color: #475569;
    }
    
    .dropdown-option:not(:last-child) {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    :host-context([data-theme="light"]) .dropdown-option:not(:last-child) {
      border-bottom-color: #f1f5f9;
    }

    .dropdown-option:hover {
      background: rgba(163, 255, 0, 0.1);
      color: #fff;
    }
    :host-context([data-theme="light"]) .dropdown-option:hover {
      background: rgba(58, 125, 10, 0.08);
      color: #1e293b;
    }
    
    .icon-opt {
      font-size: 0.9rem;
      opacity: 0.7;
    }

    .date-input-wrapper {
      position: relative;
      width: 100%;
    }

    .custom-input {
      background: #1e1e1e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      padding: 0.6rem 0.8rem;
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.8rem;
      outline: none;
      width: 100%;
      box-sizing: border-box;
      transition: all 0.2s;
      color-scheme: dark; /* Fuerza al navegador a usar su popup nativo en modo oscuro */
    }
    :host-context([data-theme="light"]) .custom-input {
      background: #fff;
      border-color: #cbd5e1;
      color: #1e293b;
      color-scheme: light;
    }
    .custom-input:focus {
      border-color: var(--theme-brand-neon);
      background: rgba(255,255,255,0.08);
    }
    :host-context([data-theme="light"]) .custom-input:focus {
      border-color: #3a7d0a;
      background: #f8fafc;
    }
    
    /* TRUCO UX: Personaliza el icono nativo de calendario del navegador */
    .custom-input::-webkit-calendar-picker-indicator {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
      cursor: pointer;
      opacity: 0.5;
      transition: 0.2s;
    }
    :host-context([data-theme="light"]) .custom-input::-webkit-calendar-picker-indicator {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
    }

    .custom-input::-webkit-calendar-picker-indicator:hover {
      opacity: 1;
    }

    .modal-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-cancel {
      flex: 1;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #888;
      padding: 0.6rem;
      border-radius: 8px;
      font-family: inherit;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.75rem;
    }
    :host-context([data-theme="light"]) .btn-cancel {
      border-color: #cbd5e1;
      color: #64748b;
    }
    .btn-cancel:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }

    .btn-fijar {
      flex: 1;
      background: rgba(163, 255, 0, 0.1);
      color: var(--theme-brand-neon);
      border: 1px solid rgba(163, 255, 0, 0.3);
      padding: 0.6rem;
      border-radius: 8px;
      font-family: inherit;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.75rem;
    }
    :host-context([data-theme="light"]) .btn-fijar {
      background: rgba(58, 125, 10, 0.1);
      color: #3a7d0a;
      border-color: rgba(58, 125, 10, 0.3);
    }
    .btn-fijar:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class FocusTargetBentoComponent implements OnInit {
  @Input() folders: any[] = [];
  @Output() onSprintStart = new EventEmitter<string>();

  mode: 'idle' | 'configuring' | 'active' = 'idle';

  activeTarget: any = null;
  selectedFolderId: string = '';
  deadline: string = '';

  daysRemaining: number = 0;
  
  dropdownOpen = false;

  constructor(private eRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if(!this.eRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }

  ngOnInit() {
    const saved = localStorage.getItem('focusTarget');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.folder_id && parsed.deadline) {
          this.activeTarget = parsed;
          this.deadline = parsed.deadline;
          this.calculateDays();
          this.mode = 'active';
        }
      } catch(e) {}
    }
  }
  
  getSelectedFolderName() {
    if (!this.selectedFolderId) return '';
    const f = this.folders.find(f => f.folder_id === this.selectedFolderId);
    return f ? f.nombre_tema : '';
  }

  selectFolder(id: string) {
    this.selectedFolderId = id;
    this.dropdownOpen = false;
  }

  startConfiguring() {
    this.mode = 'configuring';
  }

  cancelConfig() {
    this.mode = this.activeTarget ? 'active' : 'idle';
  }

  setTarget() {
    if (!this.selectedFolderId || !this.deadline) return;

    const folder = this.folders.find(f => f.folder_id === this.selectedFolderId);
    if (!folder) return;

    this.activeTarget = {
      ...folder,
      deadline: this.deadline
    };

    localStorage.setItem('focusTarget', JSON.stringify(this.activeTarget));
    this.calculateDays();
    this.mode = 'active';
  }

  clearTarget() {
    this.activeTarget = null;
    this.selectedFolderId = '';
    this.deadline = '';
    localStorage.removeItem('focusTarget');
    this.mode = 'idle';
  }

  calculateDays() {
    if (!this.activeTarget) return;

    const targetDate = new Date(this.activeTarget.deadline + 'T00:00:00');
    const today = new Date();
    
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    this.daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }
}
