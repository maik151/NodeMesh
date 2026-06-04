import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UI_ICONS } from '../../../../shared/constants/icons.constants';
import { LiquidGlassComponent } from '../../../../shared/components/liquid-glass/liquid-glass.component';

@Component({
  selector: 'app-triage-queue',
  standalone: true,
  imports: [CommonModule, LiquidGlassComponent],
  host: {
    style: 'display: block; height: 100%; width: 100%;'
  },
  template: `
    <app-liquid-glass [simple]="true" [radius]="20" [depth]="3" [blur]="20" backgroundColor="var(--glass-fill)" style="display: flex; flex-direction: column; height: 100%; width: 100%;">
      <div class="triage-container">
        <!-- HEADER -->
        <div class="triage-header">
          <div class="triage-title-box">
            <svg class="triage-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path [attr.d]="UI_ICONS.list_bullets" fill="currentColor"></path>
            </svg>
            <span class="triage-title">Prioridad SM-2</span>
          </div>
          
          <button class="triage-filter-btn" (click)="toggleSort()" title="Cambiar orden">
            <svg *ngIf="sortOrder === 'desc'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path [attr.d]="UI_ICONS.sort_desc" fill="currentColor"></path>
            </svg>
            <svg *ngIf="sortOrder === 'asc'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path [attr.d]="UI_ICONS.sort_asc" fill="currentColor"></path>
            </svg>
          </button>
        </div>

        <!-- LIST -->
        <div class="triage-list scroll-custom">
          <div *ngIf="dueModules.length === 0" class="empty-state">
            <p>SYSTEM_OPTIMIZED</p>
          </div>

          <div class="triage-item" *ngFor="let mod of sortedModules" (click)="onSprintStart.emit(mod.folder_id)">
            <div class="triage-indicator" [ngClass]="getColorClass(mod.count)"></div>
            
            <div class="triage-info">
              <span class="triage-name">{{ mod.nombre_tema }}</span>
              <span class="triage-subtitle">Retencion: {{ mod.retention }}%</span>
            </div>
            
            <div class="triage-actions">
              <div class="triage-stats">
                <span class="triage-count" [ngClass]="getColorClass(mod.count)">{{ mod.count }}</span>
                <div class="triage-meta">
                  <span>Preguntas</span>
                  <span>~{{ mod.estimatedTime }} min</span>
                </div>
              </div>
              <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                <path [attr.d]="UI_ICONS.play_circle" fill="currentColor"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </app-liquid-glass>
  `,
  styles: [`
    .triage-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      font-family: 'JetBrains Mono', monospace;
      color: #e2e8f0;
      box-sizing: border-box;
    }
    :host-context([data-theme="light"]) .triage-container {
      color: #1e293b;
    }

    .triage-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    :host-context([data-theme="light"]) .triage-header {
      border-bottom-color: rgba(0,0,0,0.08);
    }

    .triage-title-box {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--theme-text-secondary);
    }
    :host-context([data-theme="light"]) .triage-title-box {
      color: #333;
    }

    .triage-icon {
      width: 20px;
      height: 20px;
      opacity: 0.7;
    }

    .triage-title {
      font-size: 0.95rem;
      font-weight: 600;
      opacity: 0.8;
      letter-spacing: -0.3px;
    }

    .triage-filter-btn {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      color: inherit;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      padding: 4px;
    }
    .triage-filter-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
    }
    :host-context([data-theme="light"]) .triage-filter-btn {
      border-color: #cbd5e1;
    }
    :host-context([data-theme="light"]) .triage-filter-btn:hover {
      background: #e2e8f0;
      border-color: #94a3b8;
    }
    .triage-filter-btn svg {
      width: 100%;
      height: 100%;
      opacity: 0.7;
    }

    .triage-list {
      flex: 1;
      overflow-y: auto;
      max-height: 260px;
      padding: 0.5rem 4px 0.5rem 0;
      display: flex;
      flex-direction: column;
    }
    .scroll-custom::-webkit-scrollbar {
      width: 5px;
    }
    .scroll-custom::-webkit-scrollbar-track {
      background: transparent;
    }
    .scroll-custom::-webkit-scrollbar-thumb {
      background: var(--theme-border);
      border-radius: 10px;
    }
    .scroll-custom::-webkit-scrollbar-thumb:hover {
      background: var(--theme-brand-neon);
    }

    .empty-state {
      padding: 2rem 1rem;
      text-align: center;
      opacity: 0.5;
      font-size: 0.75rem;
    }

    .triage-item {
      display: flex;
      align-items: center;
      padding: 0.6rem 1.2rem;
      gap: 0.8rem;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .triage-item:hover {
      background: rgba(255, 255, 255, 0.04);
    }
    :host-context([data-theme="light"]) .triage-item:hover {
      background: rgba(0, 0, 0, 0.03);
    }

    .triage-indicator {
      width: 3px;
      height: 32px;
      border-radius: 2px;
      background: currentColor;
    }
    .is-red { color: #ef4444; }
    .is-orange { color: #f59e0b; }
    .is-yellow { color: #eab308; }
    .is-green { color: var(--theme-brand-neon); }
    :host-context([data-theme="light"]) .is-green { color: #3a7d0a; }

    .triage-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
    }

    .triage-name {
      font-size: 0.85rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 600;
      color: #fff;
    }
    :host-context([data-theme="light"]) .triage-name {
      color: #1e293b;
    }

    .triage-subtitle {
      font-size: 0.65rem;
      color: rgba(255, 255, 255, 0.5);
      font-weight: 500;
    }
    :host-context([data-theme="light"]) .triage-subtitle {
      color: rgba(0, 0, 0, 0.45);
    }

    .triage-actions {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      min-width: 70px;
    }

    .triage-stats {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: opacity 0.2s;
    }

    .triage-count {
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .triage-meta {
      display: flex;
      flex-direction: column;
      font-size: 0.55rem;
      color: rgba(255, 255, 255, 0.5);
      line-height: 1.2;
      align-items: flex-start;
      font-family: monospace;
      font-weight: 600;
    }
    :host-context([data-theme="light"]) .triage-meta {
      color: rgba(0, 0, 0, 0.45);
    }

    .play-icon {
      position: absolute;
      right: 0;
      width: 22px;
      height: 22px;
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.2s;
      color: var(--theme-brand-neon);
    }
    :host-context([data-theme="light"]) .play-icon {
      color: #3a7d0a;
    }

    /* Hover Magic */
    .triage-item:hover .triage-stats {
      opacity: 0;
    }
    .triage-item:hover .play-icon {
      opacity: 1;
      transform: scale(1);
    }
  `]
})
export class TriageQueueComponent {
  UI_ICONS = UI_ICONS;
  
  @Input() dueModules: any[] = [];
  @Output() onSprintStart = new EventEmitter<string>();

  sortOrder: 'desc' | 'asc' = 'desc';

  get sortedModules() {
    if (!this.dueModules) return [];
    return [...this.dueModules].sort((a, b) => {
      if (this.sortOrder === 'desc') {
        return b.count - a.count;
      } else {
        return a.count - b.count;
      }
    });
  }

  toggleSort() {
    this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
  }

  getColorClass(count: number): string {
    if (count >= 50) return 'is-red';
    if (count >= 15) return 'is-orange';
    return 'is-yellow';
  }
}
