import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PomodoroService } from '../../../../core/services/ui/pomodoro.service';
import { LiquidGlassComponent } from '../../../../shared/components/liquid-glass/liquid-glass.component';

@Component({
  selector: 'app-pomodoro-bento',
  standalone: true,
  imports: [CommonModule, LiquidGlassComponent],
  template: `
    <app-liquid-glass [simple]="true" [radius]="20" [depth]="2" [blur]="16" backgroundColor="var(--glass-fill)" style="display: flex; flex-direction: column; height: 100%; width: 100%;">
      <div class="pomodoro-widget-container">
        
        <!-- HEADER -->
        <div class="pomo-header">
          <div class="pomo-title-box">
            <!-- Custom Tomato SVG -->
            <svg class="pomo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path d="M165.87,72.58A64.06,64.06,0,0,0,200,16a8,8,0,0,0-8-8h-8a64,64,0,0,0-56,33.06A64,64,0,0,0,72,8H64a8,8,0,0,0,0,16h8a48.08,48.08,0,0,1,47.4,40.42,88,88,0,1,0,46.47,8.16ZM183.33,24a48.09,48.09,0,0,1-46.66,40A48.09,48.09,0,0,1,183.33,24ZM128,224a72,72,0,1,1,72-72A72.08,72.08,0,0,1,128,224Zm55.89-62.68a57.5,57.5,0,0,1-46.57,46.57A8.52,8.52,0,0,1,136,208a8,8,0,0,1-1.31-15.89,41.29,41.29,0,0,0,33.43-33.43,8,8,0,0,1,15.78,2.64Z" fill="currentColor"></path>
            </svg>
            <span class="pomo-title">Pomodoro Session</span>
          </div>

          <!-- Play/Pause Button in Top Right -->
          <div class="pomo-controls-header">
            <button *ngIf="!service.isRunning()" (click)="service.start()" class="btn-play" title="Iniciar Sesión">
              <svg fill="currentColor" viewBox="0 0 256 256">
                <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"></path>
              </svg>
            </button>
            <button *ngIf="service.isRunning()" (click)="service.pause()" class="btn-pause" title="Pausar Sesión">
              <svg fill="currentColor" viewBox="0 0 256 256">
                <path d="M200,32H160a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm0,176H160V48h40ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Zm0,176H56V48H96Z"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- BODY -->
        <div class="pomo-body">
          <!-- CONFIGURATION CONTROLS -->
          <div class="pomo-time-adjusters">
            
            <!-- Focus Time -->
            <div class="adjuster-card" [class.active]="service.sessionType() === 'focus' && service.isActive()">
              <span class="adjuster-label font-mono">Focus (Min)</span>
              <div class="adjuster-row">
                <button (click)="adjustTime('focus', -1)" [disabled]="service.isRunning() || service.focusTime() <= 1" class="btn-adjust">-</button>
                <span class="adjuster-value font-mono">{{ service.focusTime() | number:'2.0' }}</span>
                <button (click)="adjustTime('focus', 1)" [disabled]="service.isRunning() || service.focusTime() >= 60" class="btn-adjust">+</button>
              </div>
            </div>

            <!-- Break Time -->
            <div class="adjuster-card" [class.active-break]="service.sessionType() === 'break' && service.isActive()">
              <span class="adjuster-label font-mono">Break (Min)</span>
              <div class="adjuster-row">
                <button (click)="adjustTime('break', -1)" [disabled]="service.isRunning() || service.breakTime() <= 1" class="btn-adjust">-</button>
                <span class="adjuster-value font-mono text-gray-400">{{ service.breakTime() | number:'2.0' }}</span>
                <button (click)="adjustTime('break', 1)" [disabled]="service.isRunning() || service.breakTime() >= 60" class="btn-adjust">+</button>
              </div>
            </div>

          </div>

          <!-- PROGRESS BAR -->
          <div class="progress-bar-container">
            <div class="progress-bar-fill" [class.break]="service.sessionType() === 'break'" [style.width]="progressPercentage + '%'"></div>
          </div>
        </div>

      </div>
    </app-liquid-glass>
  `,
  styles: [`
    .pomodoro-widget-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
      justify-content: space-between;
      overflow: hidden;
    }

    /* HEADER */
    .pomo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      flex-shrink: 0;
    }
    :host-context([data-theme="light"]) .pomo-header {
      border-bottom-color: rgba(0,0,0,0.08);
    }

    .pomo-body {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
      padding: 1.2rem;
    }

    .pomo-title-box {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--theme-text-secondary);
      font-family: 'JetBrains Mono', monospace;
    }
    :host-context([data-theme="light"]) .pomo-title-box {
      color: #333;
    }

    .pomo-icon {
      width: 22px;
      height: 22px;
      opacity: 0.8;
    }

    .pomo-title {
      font-size: 0.95rem;
      font-weight: 600;
      letter-spacing: -0.3px;
      opacity: 0.8;
    }

    .pomo-controls-header button {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: transform 0.2s, color 0.2s;
    }

    .pomo-controls-header button:hover {
      transform: scale(1.1);
    }

    .pomo-controls-header button:active {
      transform: scale(0.95);
    }

    .btn-play {
      color: var(--theme-text);
      width: 28px;
      height: 28px;
    }
    .btn-play:hover {
      color: var(--theme-brand-neon);
    }
    :host-context([data-theme="light"]) .btn-play:hover {
      color: #3a7d0a;
    }

    .btn-pause {
      color: #f59e0b;
      width: 28px;
      height: 28px;
    }
    .btn-pause:hover {
      color: #fbbf24;
    }

    /* ADJUSTERS */
    .pomo-time-adjusters {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex: 1;
      width: 100%;
      margin: 0.25rem 0;
    }

    .adjuster-card {
      flex: 1;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
    }
    :host-context([data-theme="light"]) .adjuster-card {
      background: rgba(0, 0, 0, 0.03);
      border-color: rgba(0, 0, 0, 0.08);
    }

    .adjuster-card.active {
      border-color: var(--theme-brand-neon);
      background: rgba(159, 255, 34, 0.08);
      box-shadow: 0 0 10px rgba(159, 255, 34, 0.05);
    }
    :host-context([data-theme="light"]) .adjuster-card.active {
      border-color: #3a7d0a;
      background: rgba(58, 125, 10, 0.06);
    }

    .adjuster-card.active-break {
      border-color: #38bdf8;
      background: rgba(56, 189, 248, 0.08);
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.05);
    }
    :host-context([data-theme="light"]) .adjuster-card.active-break {
      border-color: #0284c7;
      background: rgba(2, 132, 199, 0.06);
    }

    .adjuster-label {
      font-size: 0.55rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--theme-text-secondary);
      opacity: 0.5;
      font-weight: 700;
      margin-bottom: 0.25rem;
      transition: color 0.3s ease, opacity 0.3s ease;
    }

    .adjuster-card.active .adjuster-label {
      color: var(--theme-brand-neon);
      opacity: 0.9;
    }
    :host-context([data-theme="light"]) .adjuster-card.active .adjuster-label {
      color: #3a7d0a;
    }

    .adjuster-card.active-break .adjuster-label {
      color: #38bdf8;
      opacity: 0.9;
    }
    :host-context([data-theme="light"]) .adjuster-card.active-break .adjuster-label {
      color: #0284c7;
    }

    .adjuster-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
    }

    .btn-adjust {
      background: transparent;
      border: none;
      color: var(--theme-text-secondary);
      opacity: 0.6;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: color 0.15s, opacity 0.15s;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-adjust:hover:not(:disabled) {
      color: var(--theme-text);
      opacity: 1;
    }
    .btn-adjust:disabled {
      opacity: 0.2;
      cursor: not-allowed;
    }

    .adjuster-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--theme-text);
      letter-spacing: -1px;
      min-width: 32px;
    }

    /* PROGRESS BAR */
    .progress-bar-container {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 100px;
      overflow: hidden;
      margin-top: 0.75rem;
      flex-shrink: 0;
    }
    :host-context([data-theme="light"]) .progress-bar-container {
      background: rgba(0, 0, 0, 0.08);
    }

    .progress-bar-fill {
      height: 100%;
      background-color: var(--theme-brand-neon);
      border-radius: 100px;
      transition: width 0.3s linear, background-color 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 0 5px var(--theme-brand-neon);
    }
    :host-context([data-theme="light"]) .progress-bar-fill {
      box-shadow: none;
    }

    .progress-bar-fill.break {
      background-color: #38bdf8;
      box-shadow: 0 0 5px #38bdf8;
    }
    :host-context([data-theme="light"]) .progress-bar-fill.break {
      background-color: #0284c7;
      box-shadow: none;
    }
  `]
})
export class PomodoroBentoComponent {
  readonly service = inject(PomodoroService);

  adjustTime(type: 'focus' | 'break', amount: number) {
    if (this.service.isRunning()) return;

    const currentFocus = this.service.focusTime();
    const currentBreak = this.service.breakTime();

    if (type === 'focus') {
      this.service.updateConfig(currentFocus + amount, currentBreak);
    } else {
      this.service.updateConfig(currentFocus, currentBreak + amount);
    }
  }

  get progressPercentage(): number {
    const minutes = this.service.sessionType() === 'focus' ? this.service.focusTime() : this.service.breakTime();
    const totalSeconds = minutes * 60;
    const remaining = this.service.timeRemaining();
    
    if (totalSeconds <= 0) return 0;
    return ((totalSeconds - remaining) / totalSeconds) * 100;
  }
}
