import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PomodoroService {
  // Configs (in minutes)
  readonly focusTime = signal<number>(25);
  readonly breakTime = signal<number>(5);

  // State
  readonly timeRemaining = signal<number>(25 * 60);
  readonly isRunning = signal<boolean>(false);
  readonly isActive = signal<boolean>(false);
  readonly sessionType = signal<'focus' | 'break'>('focus');

  private intervalId: any = null;

  constructor() {
    // Cargar configuraciones guardadas
    const savedFocus = localStorage.getItem('pomodoro_focus');
    const savedBreak = localStorage.getItem('pomodoro_break');
    
    if (savedFocus) {
      this.focusTime.set(parseInt(savedFocus, 10));
    }
    if (savedBreak) {
      this.breakTime.set(parseInt(savedBreak, 10));
    }
    
    this.resetTimer();
  }

  updateConfig(focusMin: number, breakMin: number) {
    const fVal = Math.max(1, Math.min(60, focusMin));
    const bVal = Math.max(1, Math.min(60, breakMin));
    
    this.focusTime.set(fVal);
    this.breakTime.set(bVal);
    
    localStorage.setItem('pomodoro_focus', fVal.toString());
    localStorage.setItem('pomodoro_break', bVal.toString());

    if (!this.isActive()) {
      this.resetTimer();
    }
  }

  private resetTimer() {
    const minutes = this.sessionType() === 'focus' ? this.focusTime() : this.breakTime();
    this.timeRemaining.set(minutes * 60);
  }

  start() {
    if (this.isRunning()) return;
    
    this.isRunning.set(true);
    this.isActive.set(true);
    
    this.intervalId = setInterval(() => {
      const current = this.timeRemaining();
      if (current > 1) {
        this.timeRemaining.set(current - 1);
      } else {
        this.timeRemaining.set(0);
        this.handleSessionEnd();
      }
    }, 1000);
  }

  pause() {
    if (!this.isRunning()) return;
    
    this.isRunning.set(false);
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  stop() {
    this.pause();
    this.isActive.set(false);
    this.sessionType.set('focus');
    this.resetTimer();
  }

  private handleSessionEnd() {
    this.pause();
    
    // Cambiar tipo de sesión
    const nextType = this.sessionType() === 'focus' ? 'break' : 'focus';
    this.sessionType.set(nextType);
    this.resetTimer();

    // Notificación sonora
    try {
      const audio = new Audio('assets/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}

    // Auto-iniciar la siguiente sesión (flujo continuo)
    this.start();
  }
}
