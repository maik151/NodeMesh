import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PomodoroService } from '../../../core/services/ui/pomodoro.service';

@Component({
  selector: 'app-pomodoro-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Sólo se muestra si hay una sesión de Pomodoro activa (corriendo o pausada) -->
    <div *ngIf="service.isActive()" class="pomodoro-floating-widget group shadow-2xl border">
      
      <!-- Círculo / Icono Siempre Visible -->
      <div (click)="togglePlayPause()" 
           class="widget-icon-circle shadow-lg" 
           [class.focus]="service.sessionType() === 'focus'"
           [class.break]="service.sessionType() === 'break'"
           [title]="service.isRunning() ? 'Pausar Pomodoro' : 'Reanudar Pomodoro'">
        <!-- Timer SVG Icon provided by the user -->
        <svg class="w-5 h-5 icon-svg" fill="currentColor" viewBox="0 0 256 256">
          <path d="M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm0,176a80,80,0,1,1,80-80A80.09,80.09,0,0,1,128,216ZM173.66,90.34a8,8,0,0,1,0,11.32l-40,40a8,8,0,0,1-11.32-11.32l40-40A8,8,0,0,1,173.66,90.34ZM96,16a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,16Z"></path>
        </svg>
      </div>

      <!-- Contenido Expansible (Sólo visible en hover) -->
      <div class="widget-expanded-content">
        <!-- Tiempo Restante (MM:SS) y Tipo de Sesión -->
        <div style="display: flex; flex-direction: column; align-items: flex-start; line-height: 1.1;">
          <span class="pomo-timer font-mono">{{ formattedTime }}</span>
          <span class="pomo-badge font-mono" [class.focus]="service.sessionType() === 'focus'" [class.break]="service.sessionType() === 'break'">
            {{ service.sessionType() === 'focus' ? 'EN FOCO' : 'RECREO' }}
          </span>
        </div>
        
        <!-- Controles de Sesión -->
        <div class="pomo-actions">
          
          <!-- Botón de Reproducir/Pausar -->
          <button *ngIf="service.isRunning()" (click)="service.pause()" class="btn-action text-yellow-400 hover:text-yellow-300" title="Pausar">
            <svg viewBox="0 0 256 256" fill="currentColor">
              <path d="M200,32H160a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm0,176H160V48h40ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Zm0,176H56V48H96Z"></path>
            </svg>
          </button>
          <button *ngIf="!service.isRunning()" (click)="service.start()" class="btn-action text-green-400 hover:text-green-300" title="Reanudar">
            <svg viewBox="0 0 256 256" fill="currentColor">
              <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"></path>
            </svg>
          </button>

          <!-- Botón de Detener (Stop) -->
          <button (click)="service.stop()" class="btn-action text-red-500 hover:text-red-400" title="Detener y Resetear">
            <svg viewBox="0 0 256 256" fill="currentColor">
              <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40Zm0,160H48V56H208V200Z"></path>
            </svg>
          </button>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .pomodoro-floating-widget {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      background: var(--theme-surface-solid);
      border-color: var(--theme-border);
      border-radius: 9999px;
      padding: 0.35rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      width: 44px;
      height: 44px;
      cursor: default;
    }

    .pomodoro-floating-widget:hover {
      width: 220px;
    }

    /* CIRCULO / ICONO SIEMPRE VISIBLE */
    .widget-icon-circle {
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s, background-color 0.3s ease;
    }

    .widget-icon-circle.focus {
      background-color: var(--theme-brand-neon);
      color: var(--theme-brand-btn-text);
    }
    :host-context([data-theme="light"]) .widget-icon-circle.focus {
      background-color: #3a7d0a;
      color: #fff;
    }
    .widget-icon-circle.break {
      background-color: #38bdf8;
      color: #000;
    }
    :host-context([data-theme="light"]) .widget-icon-circle.break {
      background-color: #0284c7;
      color: #fff;
    }

    .widget-icon-circle.focus:hover {
      transform: scale(1.05);
      box-shadow: 0 0 12px var(--theme-brand-neon);
    }
    :host-context([data-theme="light"]) .widget-icon-circle.focus:hover {
      box-shadow: 0 0 10px rgba(58, 125, 10, 0.4);
    }
    .widget-icon-circle.break:hover {
      transform: scale(1.05);
      box-shadow: 0 0 12px #38bdf8;
    }
    :host-context([data-theme="light"]) .widget-icon-circle.break:hover {
      box-shadow: 0 0 10px rgba(2, 132, 199, 0.4);
    }

    .widget-icon-circle:active {
      transform: scale(0.95);
    }

    .icon-svg {
      width: 20px;
      height: 20px;
    }

    /* CONTENIDO EXPANDIDO (Oculto por defecto) */
    .widget-expanded-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      padding-left: 0.75rem;
      padding-right: 0.5rem;
    }

    .pomodoro-floating-widget:hover .widget-expanded-content {
      opacity: 1;
      pointer-events: auto;
      transition-delay: 0.1s;
    }

    .pomo-timer {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--theme-text);
      letter-spacing: 0.5px;
    }

    .pomo-badge {
      font-size: 0.55rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-top: 1px;
    }
    .pomo-badge.focus {
      color: var(--theme-brand-neon);
    }
    :host-context([data-theme="light"]) .pomo-badge.focus {
      color: #3a7d0a;
    }
    .pomo-badge.break {
      color: #38bdf8;
    }
    :host-context([data-theme="light"]) .pomo-badge.break {
      color: #0284c7;
    }

    .pomo-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-action {
      background: none;
      border: none;
      padding: 0.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s, opacity 0.15s;
      width: 24px;
      height: 24px;
    }

    .btn-action:hover {
      transform: scale(1.1);
    }
    .btn-action:active {
      transform: scale(0.95);
    }

    .btn-action svg {
      width: 100%;
      height: 100%;
    }
  `]
})
export class PomodoroWidgetComponent {
  readonly service = inject(PomodoroService);

  togglePlayPause() {
    if (this.service.isRunning()) {
      this.service.pause();
    } else {
      this.service.start();
    }
  }

  get formattedTime(): string {
    const total = this.service.timeRemaining();
    const min = Math.floor(total / 60);
    const sec = total % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }
}
