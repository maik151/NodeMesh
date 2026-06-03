import { TestBed } from '@angular/core/testing';
import { PomodoroService } from './pomodoro.service';
import { vi } from 'vitest';

describe('PomodoroService', () => {
  let service: PomodoroService;

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [PomodoroService]
    });
    service = TestBed.inject(PomodoroService);
  });

  afterEach(() => {
    service.stop();
    vi.useRealTimers();
  });

  it('debe tener configuraciones iniciales por defecto', () => {
    expect(service.focusTime()).toBe(25);
    expect(service.breakTime()).toBe(5);
    expect(service.isRunning()).toBe(false);
    expect(service.isActive()).toBe(false);
    expect(service.sessionType()).toBe('focus');
    expect(service.timeRemaining()).toBe(25 * 60);
  });

  it('debe iniciar el cronómetro correctamente', () => {
    service.start();
    expect(service.isRunning()).toBe(true);
    expect(service.isActive()).toBe(true);

    vi.advanceTimersByTime(2000); // Avanzar 2 segundos
    expect(service.timeRemaining()).toBe(25 * 60 - 2);
  });

  it('debe pausar el cronómetro correctamente', () => {
    service.start();
    vi.advanceTimersByTime(5000);
    expect(service.timeRemaining()).toBe(25 * 60 - 5);

    service.pause();
    expect(service.isRunning()).toBe(false);
    expect(service.isActive()).toBe(true); // Permanece activo pero no corriendo

    vi.advanceTimersByTime(3000);
    expect(service.timeRemaining()).toBe(25 * 60 - 5); // El tiempo no debe cambiar
  });

  it('debe detener y resetear el cronómetro', () => {
    service.start();
    vi.advanceTimersByTime(10000);
    expect(service.isActive()).toBe(true);

    service.stop();
    expect(service.isRunning()).toBe(false);
    expect(service.isActive()).toBe(false);
    expect(service.timeRemaining()).toBe(25 * 60);
    expect(service.sessionType()).toBe('focus');
  });

  it('debe actualizar la configuración y persistir en localStorage', () => {
    service.updateConfig(30, 10);
    expect(service.focusTime()).toBe(30);
    expect(service.breakTime()).toBe(10);
    expect(localStorage.getItem('pomodoro_focus')).toBe('30');
    expect(localStorage.getItem('pomodoro_break')).toBe('10');
    expect(service.timeRemaining()).toBe(30 * 60);
  });

  it('debe alternar de focus a break y auto-iniciar cuando el tiempo se agote', () => {
    service.updateConfig(1, 1); // 1 min cada sesión
    service.start();
    
    // Avanzar 60 segundos
    vi.advanceTimersByTime(60000);
    
    // Debe haber cambiado el tipo de sesión a break y seguir corriendo
    expect(service.sessionType()).toBe('break');
    expect(service.timeRemaining()).toBe(60); // 1 minuto de descanso en segundos
    expect(service.isRunning()).toBe(true);
  });
});
