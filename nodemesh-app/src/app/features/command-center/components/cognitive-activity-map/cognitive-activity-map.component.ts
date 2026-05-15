import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiquidGlassComponent } from '../../../../shared/components/liquid-glass/liquid-glass.component';
import { UI_ICONS } from '../../../../shared/constants/icons.constants';

@Component({
  selector: 'app-cognitive-activity-map',
  standalone: true,
  imports: [CommonModule, LiquidGlassComponent],
  host: {
    style: 'display: block; height: 100%; width: 100%;'
  },
  template: `
    <app-liquid-glass [simple]="true" [radius]="20" [depth]="2" [blur]="16" backgroundColor="var(--glass-fill)" style="display: flex; flex-direction: column; height: 100%; width: 100%;">
      <div class="cam-container">
        
        <div class="cam-header">
          <div class="cam-title-box">
            <svg class="cam-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path [attr.d]="UI_ICONS.cognitive_map" fill="currentColor"></path>
            </svg>
            <span class="cam-title">Cognitive Activity Map</span>
          </div>
          
          <div class="cam-header-kpis">
            <div class="kpi-item">
              <span class="kpi-value">{{ totalRepasos }}</span>
              <span class="kpi-label">Repasos</span>
            </div>
            <div class="kpi-separator"></div>
            <div class="kpi-item">
              <span class="kpi-value">{{ activeDays }}</span>
              <span class="kpi-label">Días Activos</span>
            </div>
          </div>
        </div>
        
        <div class="heatmap-layout">
          <div class="heatmap-wrapper">
            <div class="heatmap-labels-y">
              <span></span>
              <span>Lun</span>
              <span></span>
              <span>Mié</span>
              <span></span>
              <span>Vie</span>
              <span></span>
            </div>
            
            <div class="heatmap-body">
              <div class="heatmap-grid" *ngIf="gridNodes.length > 0">
                <!-- Malla CSS donde las columnas son semanas y las filas días -->
                <div *ngFor="let node of gridNodes"
                     class="heat-square"
                     [ngClass]="getHeatLevelClass(node.count)"
                     [title]="node.date ? node.date + ': ' + node.count + ' repasos' : ''">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="cam-footer">
          <div class="legend-container">
            <span class="legend-text">Menos</span>
            <div class="legend-squares">
              <div class="heat-square level-0"></div>
              <div class="heat-square level-2"></div>
              <div class="heat-square level-4"></div>
              <div class="heat-square level-6"></div>
              <div class="heat-square level-7"></div>
            </div>
            <span class="legend-text">Más</span>
          </div>
        </div>

      </div>
    </app-liquid-glass>
  `,
  styles: [`
    .cam-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      font-family: 'Inter', sans-serif;
    }

    .cam-header { 
      padding: 1rem 1.2rem; 
      display: flex; 
      align-items: center; 
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08); 
    }
    :host-context([data-theme="light"]) .cam-header {
      border-bottom-color: rgba(0,0,0,0.08);
    }
    
    .cam-title-box {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--theme-text-secondary);
      font-family: 'JetBrains Mono', monospace;
    }
    :host-context([data-theme="light"]) .cam-title-box {
      color: #333;
    }

    .cam-icon {
      width: 20px;
      height: 20px;
      opacity: 0.7;
    }
    
    .cam-title { 
      font-size: 0.95rem; 
      font-weight: 600; 
      letter-spacing: -0.3px; 
      opacity: 0.8; 
    }

    /* KPIs */
    .cam-header-kpis {
      display: flex;
      align-items: center;
      gap: 1.2rem;
    }
    .kpi-item {
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
    }
    .kpi-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--theme-text-primary);
      font-family: 'JetBrains Mono', monospace;
    }
    :host-context([data-theme="light"]) .kpi-value {
      color: #1e293b;
    }
    .kpi-label {
      font-size: 0.65rem;
      font-weight: 600;
      color: var(--theme-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.8;
    }
    .kpi-separator {
      width: 1px;
      height: 16px;
      background: rgba(255, 255, 255, 0.1);
    }
    :host-context([data-theme="light"]) .kpi-separator {
      background: rgba(0, 0, 0, 0.1);
    }

    /* Layout & Body */
    .heatmap-layout {
      display: flex;
      flex: 1;
      padding: 1.2rem 1.2rem 0.5rem 0.8rem;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
    }

    .heatmap-wrapper {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 8px;
      width: 100%;
    }

    .heatmap-labels-y {
      display: grid;
      grid-template-rows: repeat(7, 1fr);
      gap: 3px;
      font-size: 0.55rem;
      font-weight: 500;
      color: var(--theme-text-secondary);
      text-align: right;
      opacity: 0.6;
    }
    .heatmap-labels-y span {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    .heatmap-body {
      width: 100%;
    }

    .heatmap-grid {
      display: grid;
      /* Filas = días de la semana (Dom-Sab) */
      grid-template-rows: repeat(7, 1fr);
      grid-auto-flow: column;
      grid-auto-columns: minmax(0, 1fr);
      gap: 3px;
      width: 100%;
    }

    .heat-square {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 2px;
      transition: transform 0.1s, box-shadow 0.1s;
      cursor: crosshair;
    }

    .heatmap-grid .heat-square:not(.filler):hover {
      transform: scale(1.4);
      box-shadow: 0 0 5px rgba(0,0,0,0.5);
      z-index: 10;
    }
    :host-context([data-theme="light"]) .heatmap-grid .heat-square:not(.filler):hover {
      box-shadow: 0 0 5px rgba(0,0,0,0.2);
    }
    
    .heat-square.filler {
      cursor: default;
      background: transparent;
    }

    /* Footer & Legend */
    .cam-footer {
      padding: 0 1.2rem 1rem 1.2rem;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
    .legend-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.65rem;
      color: var(--theme-text-secondary);
      font-weight: 500;
      opacity: 0.8;
    }
    .legend-squares {
      display: flex;
      gap: 4px;
    }
    .legend-squares .heat-square {
      width: 11px;
      height: 11px;
      cursor: default;
    }

    /* COLOR LEVELS - DARK MODE (DEFAULT) */
    .level-0 { background: rgba(255, 255, 255, 0.05); }
    .level-1 { background: rgba(159, 255, 34, 0.2); }
    .level-2 { background: rgba(159, 255, 34, 0.45); }
    .level-3 { background: rgba(159, 255, 34, 0.75); }
    .level-4 { background: #9FFF22; }
    .level-5 { background: #eab308; }
    .level-6 { background: #f59e0b; }
    .level-7 { background: #ef4444; }

    /* COLOR LEVELS - LIGHT MODE */
    :host-context([data-theme="light"]) .level-0 { background: #ebedf0; }
    :host-context([data-theme="light"]) .level-1 { background: #dcfce3; }
    :host-context([data-theme="light"]) .level-2 { background: #86efac; }
    :host-context([data-theme="light"]) .level-3 { background: #4ade80; }
    :host-context([data-theme="light"]) .level-4 { background: #22c55e; }
    :host-context([data-theme="light"]) .level-5 { background: #eab308; }
    :host-context([data-theme="light"]) .level-6 { background: #f59e0b; }
    :host-context([data-theme="light"]) .level-7 { background: #ef4444; }

  `]
})
export class CognitiveActivityMapComponent implements OnChanges {
  UI_ICONS = UI_ICONS;
  @Input() activityData: { date: string, count: number }[] = [];
  
  gridNodes: { date: string, count: number }[] = [];

  totalRepasos: number = 0;
  activeDays: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activityData'] && this.activityData) {
      this.buildGrid();
    }
  }

  buildGrid() {
    this.gridNodes = [];
    this.totalRepasos = 0;
    this.activeDays = 0;
    
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364); // Último año exacto

    const dayOfWeek = startDate.getDay(); // 0 es Domingo
    
    // Padding inicial para que empiece en el día correcto de la cuadrícula
    for (let i = 0; i < dayOfWeek; i++) {
      this.gridNodes.push({ date: '', count: -1 });
    }

    const map = new Map<string, number>();
    if (this.activityData && this.activityData.length > 0) {
      for (const d of this.activityData) {
        map.set(d.date, d.count);
        
        // Calcular KPIs solo de datos reales
        if (d.count > 0) {
          this.totalRepasos += d.count;
          this.activeDays++;
        }
      }
    }

    for (let i = 0; i <= 364; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const count = map.get(dateStr) || 0;
      this.gridNodes.push({ date: dateStr, count });
    }
  }

  getHeatLevelClass(count: number): string {
    if (count === -1) return 'filler';
    if (count === 0) return 'level-0';
    if (count >= 1 && count <= 2) return 'level-1';
    if (count >= 3 && count <= 6) return 'level-2';
    if (count >= 7 && count <= 10) return 'level-3';
    if (count >= 11 && count < 15) return 'level-4';
    if (count >= 15 && count < 30) return 'level-5';
    if (count >= 30 && count < 45) return 'level-6';
    return 'level-7';
  }
}
