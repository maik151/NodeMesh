import { Injectable, signal, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class PomodoroService {
  private readonly toastService = inject(ToastService);

  // Configs (in minutes)
  readonly focusTime = signal<number>(25);
  readonly breakTime = signal<number>(5);

  // State
  readonly timeRemaining = signal<number>(25 * 60);
  readonly isRunning = signal<boolean>(false);
  readonly isActive = signal<boolean>(false);
  readonly sessionType = signal<'focus' | 'break'>('focus');

  private intervalId: any = null;
  private titleFlashIntervalId: any = null;
  private isWindowFocused = true;

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

    // Configurar listeners de foco de la ventana para el destello del título
    if (typeof window !== 'undefined') {
      this.isWindowFocused = document.hasFocus();
      
      window.addEventListener('focus', () => {
        this.isWindowFocused = true;
        this.stopTitleFlashing();
      });
      
      window.addEventListener('blur', () => {
        this.isWindowFocused = false;
      });
    }
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

  start(autoStart = false) {
    if (this.isRunning()) return;
    
    this.stopTitleFlashing();
    this.requestNotificationPermission();
    
    this.isRunning.set(true);
    this.isActive.set(true);
    this.updateTabTitle();
    
    const isFocus = this.sessionType() === 'focus';
    if (!autoStart) {
      this.toastService.info(isFocus ? '🎯 Sesión de Foco iniciada. ¡A concentrarse!' : '☕ Descanso iniciado. ¡Relájate!');
      this.playSynthSound('start');
    }
    
    this.intervalId = setInterval(() => {
      const current = this.timeRemaining();
      if (current > 1) {
        this.timeRemaining.set(current - 1);
        this.updateTabTitle();
      } else {
        this.timeRemaining.set(0);
        this.handleSessionEnd();
      }
    }, 1000);
  }

  pause(showToast = true) {
    if (!this.isRunning()) return;
    
    this.stopTitleFlashing();
    this.isRunning.set(false);
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.updateTabTitle();
    if (showToast) {
      this.toastService.info('⏸️ Temporizador pausado.');
      this.playSynthSound('pause');
    }
  }

  stop() {
    this.pause(false);
    this.isActive.set(false);
    this.sessionType.set('focus');
    this.resetTimer();
    this.stopTitleFlashing();
    this.updateTabTitle();
    this.toastService.info('⏱️ Temporizador reiniciado.');
  }

  private handleSessionEnd() {
    this.pause(false);
    
    const endedType = this.sessionType();
    
    // Cambiar tipo de sesión
    const nextType = endedType === 'focus' ? 'break' : 'focus';
    this.sessionType.set(nextType);
    this.resetTimer();

    // Notificaciones y sonidos
    if (endedType === 'focus') {
      this.toastService.success('🎉 ¡Buen trabajo! Has completado tu Pomodoro.');
      this.sendDesktopNotification('NodeMesh Pomodoro', '¡Foco completado! Tómate un respiro.');
      this.playSynthSound('focus-end');
      this.startTitleFlashing('🔔 ¡Foco Terminado! 🔔');
    } else {
      this.toastService.success('⚡ El descanso ha terminado. ¿Listo para otra sesión?');
      this.sendDesktopNotification('NodeMesh Pomodoro', 'El descanso ha terminado. ¿Listo para enfocar?');
      this.playSynthSound('break-end');
      this.startTitleFlashing('⚡ ¡Fin del Recreo! ⚡');
    }

    // Auto-iniciar la siguiente sesión (flujo continuo)
    this.start(true);
  }

  private updateTabTitle() {
    if (this.isActive()) {
      const total = this.timeRemaining();
      const min = Math.floor(total / 60);
      const sec = total % 60;
      const formatted = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
      const typeLabel = this.sessionType() === 'focus' ? 'Foco' : 'Recreo';
      const statusLabel = this.isRunning() ? '' : '[Pausado] ';
      document.title = `${statusLabel}(${formatted}) ${typeLabel} | NodeMesh`;
    } else {
      document.title = 'NodeMesh — Herramienta de Estudio';
    }
  }

  private playSynthSound(type: 'start' | 'pause' | 'focus-end' | 'break-end') {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = (freq: number, startTime: number, duration: number, volume = 0.2) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      const now = audioCtx.currentTime;
      
      if (type === 'start') {
        playTone(523.25, now, 0.08, 0.12);
        playTone(659.25, now + 0.08, 0.12, 0.12);
      } else if (type === 'pause') {
        playTone(659.25, now, 0.08, 0.10);
        playTone(523.25, now + 0.08, 0.12, 0.10);
      } else if (type === 'focus-end') {
        playTone(523.25, now, 0.1, 0.2);
        playTone(659.25, now + 0.12, 0.1, 0.2);
        playTone(783.99, now + 0.24, 0.15, 0.2);
        playTone(1046.50, now + 0.36, 0.3, 0.2);
      } else if (type === 'break-end') {
        playTone(880, now, 0.15, 0.2);
        playTone(880, now + 0.2, 0.3, 0.2);
      }
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
    }
  }

  private startTitleFlashing(alertMessage: string) {
    this.stopTitleFlashing();
    
    let useAlertMessage = true;
    let ticks = 0;
    const maxTicks = 20; // 10 segundos a razón de 500ms por tick
    
    const updateFlash = () => {
      ticks++;
      if (ticks >= maxTicks || this.isWindowFocused) {
        this.stopTitleFlashing();
        return;
      }
      
      if (useAlertMessage) {
        document.title = alertMessage;
      } else {
        this.updateTabTitle();
      }
      useAlertMessage = !useAlertMessage;
    };
    
    updateFlash();
    this.titleFlashIntervalId = setInterval(updateFlash, 500);
  }

  private stopTitleFlashing() {
    if (this.titleFlashIntervalId) {
      clearInterval(this.titleFlashIntervalId);
      this.titleFlashIntervalId = null;
    }
    this.updateTabTitle();
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  private sendDesktopNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico'
        });
      } catch (e) {
        console.warn('Failed to send desktop notification:', e);
      }
    }
  }
}
