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
      <div (click)="togglePlayPause()" class="widget-icon-circle shadow-lg" [title]="service.isRunning() ? 'Pausar Pomodoro' : 'Reanudar Pomodoro'">
        <!-- Reloj SVG -->
        <svg class="w-5 h-5 icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>

      <!-- Contenido Expansible (Sólo visible en hover) -->
      <div class="widget-expanded-content">
        <!-- Tiempo Restante (MM:SS) -->
        <span class="pomo-timer font-mono">{{ formattedTime }}</span>
        
        <!-- Controles de Sesión -->
        <div class="pomo-actions">
          
          <!-- Botón de Reproducir/Pausar -->
          <button *ngIf="service.isRunning()" (click)="service.pause()" class="btn-action text-yellow-400 hover:text-yellow-300" title="Pausar">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
          </button>
          <button *ngIf="!service.isRunning()" (click)="service.start()" class="btn-action text-green-400 hover:text-green-300" title="Reanudar">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
          </button>

          <!-- Botón de Detener (Stop) -->
          <button (click)="service.stop()" class="btn-action text-red-500 hover:text-red-400" title="Detener y Resetear">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd"></path></svg>
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
      background-color: var(--theme-brand-neon);
      color: var(--theme-brand-btn-text);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    :host-context([data-theme="light"]) .widget-icon-circle {
      background-color: #3a7d0a;
      color: #fff;
    }

    .widget-icon-circle:hover {
      transform: scale(1.05);
      box-shadow: 0 0 12px var(--theme-brand-neon);
    }
    :host-context([data-theme="light"]) .widget-icon-circle:hover {
      box-shadow: 0 0 10px rgba(58, 125, 10, 0.4);
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
