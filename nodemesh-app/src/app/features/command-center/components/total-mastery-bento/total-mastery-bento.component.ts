import { Component, Input, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiquidGlassComponent } from '../../../../shared/components/liquid-glass/liquid-glass.component';

@Component({
  selector: 'app-total-mastery-bento',
  standalone: true,
  imports: [CommonModule, LiquidGlassComponent],
  template: `
    <app-liquid-glass [simple]="true" [radius]="20" [depth]="2" [blur]="16" backgroundColor="var(--glass-fill)" style="display: flex; flex-direction: column; height: 100%; width: 100%;">
      <div class="mastery-widget-container">
        
        <!-- HEADER -->
        <div class="mastery-header">
          <div class="mastery-title-box">
            <!-- Custom Trend/Chart-line SVG -->
            <svg class="mastery-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0v94.37L90.73,98a8,8,0,0,1,10.07-.38l58.81,44.11L218.73,90a8,8,0,1,1,10.54,12l-64,56a8,8,0,0,1-10.07.38L96.39,114.29,40,163.63V200H224A8,8,0,0,1,232,208Z" fill="currentColor"></path>
            </svg>
            <span class="mastery-title">Total Mastery</span>
          </div>
        </div>

        <!-- BODY LAYOUT -->
        <div class="mastery-body">
          
          <!-- ZONA IZQUIERDA: Métrica Global -->
          <div class="global-metric">
            <div class="circle-container">
              <svg class="progress-svg" viewBox="0 0 90 90">
                <!-- Anillo de fondo -->
                <circle class="circle-bg" cx="45" cy="45" r="36"></circle>
                <!-- Anillo de progreso -->
                <circle class="circle-fg" cx="45" cy="45" r="36" 
                        stroke-dasharray="226.2" 
                        [attr.stroke-dashoffset]="strokeDashoffset">
                </circle>
              </svg>
              <!-- Texto Central -->
              <div class="center-text font-mono">
                <span class="number">{{ masteryRatio }}</span>
                <span class="percent">%</span>
              </div>
            </div>
            <span class="global-label">Global Mastery</span>
          </div>

          <!-- Línea divisoria sutil -->
          <div class="divider"></div>

          <!-- ZONA DERECHA: Desglose de Dominios (Top 3) -->
          <div class="domains-breakdown">
            <div *ngFor="let domain of topDomains" class="domain-item">
              <div class="domain-info font-mono">
                <span class="domain-name" [title]="domain.nombre_tema">{{ domain.nombre_tema }}</span>
                <span class="domain-perc" [ngClass]="getProgressColorClass(domain.mastery)">{{ domain.mastery }}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fg" 
                     [style.width]="domain.mastery + '%'"
                     [ngClass]="getProgressBarClass(domain.mastery)">
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </app-liquid-glass>
  `,
  styles: [`
    .mastery-widget-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1rem 1.25rem;
      box-sizing: border-box;
      justify-content: space-between;
      overflow: hidden;
    }

    /* HEADER */
    .mastery-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      flex-shrink: 0;
    }

    .mastery-title-box {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--theme-text-secondary);
      font-family: 'JetBrains Mono', monospace;
    }
    :host-context([data-theme="light"]) .mastery-title-box {
      color: #333;
    }

    .mastery-icon {
      width: 22px;
      height: 22px;
      opacity: 0.8;
      color: var(--theme-brand-neon);
    }
    :host-context([data-theme="light"]) .mastery-icon {
      color: #3a7d0a;
    }

    .mastery-title {
      font-size: 0.95rem;
      font-weight: 600;
      letter-spacing: -0.3px;
      opacity: 0.8;
    }

    /* BODY */
    .mastery-body {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
      width: 100%;
    }

    @media (max-width: 380px) {
      .mastery-body {
        flex-direction: column;
        gap: 0.75rem;
      }
      .divider {
        display: none !important;
      }
    }

    /* ZONA IZQUIERDA: Círculo */
    .global-metric {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 90px;
      flex-shrink: 0;
    }

    .circle-container {
      position: relative;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .progress-svg {
      transform: rotate(-90deg);
      width: 100%;
      height: 100%;
    }

    .circle-bg {
      fill: transparent;
      stroke: rgba(255, 255, 255, 0.05);
      stroke-width: 6.5;
    }
    :host-context([data-theme="light"]) .circle-bg {
      stroke: rgba(0, 0, 0, 0.06);
    }

    .circle-fg {
      fill: transparent;
      stroke: var(--theme-brand-neon);
      stroke-width: 6.5;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 0 5px var(--theme-brand-neon));
    }
    :host-context([data-theme="light"]) .circle-fg {
      filter: none;
    }

    .center-text {
      position: absolute;
      display: flex;
      align-items: baseline;
      justify-content: center;
      color: var(--theme-text);
      font-weight: 800;
    }

    .center-text .number {
      font-size: 1.4rem;
      letter-spacing: -1px;
    }

    .center-text .percent {
      font-size: 0.75rem;
      opacity: 0.8;
      margin-left: 1px;
    }

    .global-label {
      margin-top: 0.35rem;
      font-size: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--theme-text-secondary);
      opacity: 0.5;
      font-weight: 700;
      text-align: center;
    }

    /* DIVIDER */
    .divider {
      width: 1px;
      height: 70px;
      background: var(--theme-border);
      opacity: 0.6;
      flex-shrink: 0;
    }

    /* ZONA DERECHA: Desglose de Dominios */
    .domains-breakdown {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
      min-width: 0; /* Permite truncate en flex children */
    }

    .domain-item {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .domain-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.7rem;
      margin-bottom: 0.15rem;
      align-items: center;
    }

    .domain-name {
      color: var(--theme-text-secondary);
      opacity: 0.85;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 140px;
    }
    :host-context([data-theme="light"]) .domain-name {
      color: #475569;
    }

    .domain-perc {
      font-weight: 700;
      font-size: 0.7rem;
    }

    .progress-bar-bg {
      width: 100%;
      height: 5px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 100px;
      overflow: hidden;
      position: relative;
    }
    :host-context([data-theme="light"]) .progress-bar-bg {
      background: rgba(0, 0, 0, 0.08);
    }

    .progress-bar-fg {
      height: 100%;
      border-radius: 100px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* CLASES DE COLOR DE PROGRESO */
    .color-neon {
      color: var(--theme-brand-neon);
    }
    .color-medium {
      color: #94a3b8;
    }
    :host-context([data-theme="light"]) .color-medium {
      color: #64748b;
    }
    .color-muted {
      color: #475569;
    }
    :host-context([data-theme="light"]) .color-muted {
      color: #94a3b8;
    }

    .bg-neon-fill {
      background-color: var(--theme-brand-neon);
      box-shadow: 0 0 6px var(--theme-brand-neon);
    }
    :host-context([data-theme="light"]) .bg-neon-fill {
      box-shadow: none;
    }
    .bg-medium-fill {
      background-color: #94a3b8;
    }
    :host-context([data-theme="light"]) .bg-medium-fill {
      background-color: #64748b;
    }
    .bg-muted-fill {
      background-color: #475569;
    }
    :host-context([data-theme="light"]) .bg-muted-fill {
      background-color: #cbd5e1;
    }
  `]
})
export class TotalMasteryBentoComponent {
  @Input() masteryRatio: number = 0;
  @Input() folderBreakdown: { folder_id: string, nombre_tema: string, mastery: number }[] = [];

  get strokeDashoffset(): number {
    const ratio = Math.max(0, Math.min(100, this.masteryRatio));
    return 226.2 * (1 - ratio / 100);
  }

  get topDomains() {
    const list = [...(this.folderBreakdown || [])];
    
    // Fallback data en caso de tener menos de 3 carpetas reales
    const fallbacks = [
      { folder_id: 'fb-oxford', nombre_tema: 'Oxford Test (Inglés B2)', mastery: 85 },
      { folder_id: 'fb-prog', nombre_tema: 'Fundamentos de Programación', mastery: 45 },
      { folder_id: 'fb-hist', nombre_tema: 'Historia del Ecuador', mastery: 12 }
    ];

    for (const fb of fallbacks) {
      if (list.length >= 3) break;
      if (!list.some(f => f.nombre_tema.toLowerCase() === fb.nombre_tema.toLowerCase())) {
        list.push(fb);
      }
    }

    // Ordenar de mayor a menor mastery y tomar el top 3
    return list.sort((a, b) => b.mastery - a.mastery).slice(0, 3);
  }

  getProgressColorClass(perc: number): string {
    if (perc >= 75) return 'color-neon';
    if (perc >= 35) return 'color-medium';
    return 'color-muted';
  }

  getProgressBarClass(perc: number): string {
    if (perc >= 75) return 'bg-neon-fill';
    if (perc >= 35) return 'bg-medium-fill';
    return 'bg-muted-fill';
  }
}
