import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { LayoutService } from '../services/ui/layout.service';
import { ToastService } from '../services/ui/toast.service';

/**
 * Guard que evita que el usuario abandone accidentalmente un quiz en progreso.
 */
export const quizGuard: CanDeactivateFn<any> = () => {
  const layout = inject(LayoutService);
  const toast = inject(ToastService);

  if (layout.isQuizActive) {
    toast.warning('Bloqueo de Seguridad: Debes confirmar la salida dentro del Quiz para abandonar la sesión.', 6000);
    return false;
  }

  return true;
};
