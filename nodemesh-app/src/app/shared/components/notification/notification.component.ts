import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/ui/toast.service';
import { UI_ICONS } from '../../constants/icons.constants';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div 
        *ngFor="let toast of toastService.toasts()" 
        class="toast-item" 
        [class]="toast.type"
        (click)="toastService.remove(toast.id)">
        
        <div class="toast-indicator"></div>
        
        <div class="toast-icon">
          <svg viewBox="0 0 256 256">
            <path [attr.d]="UI_ICONS[toast.type]"></path>
          </svg>
        </div>

        <div class="toast-body">
          <span class="toast-message">{{ toast.message }}</span>
        </div>

        <button class="toast-close">
           <svg viewBox="0 0 256 256">
             <path [attr.d]="UI_ICONS.close"></path>
           </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
      max-width: 400px;
    }

    .toast-item {
      pointer-events: auto;
      background: rgba(15, 15, 15, 0.65);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 0.85rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
      animation: toastIn 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) both;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .toast-item:hover {
      transform: translateY(-2px) scale(1.02);
      border-color: rgba(255, 255, 255, 0.15);
      background: rgba(25, 25, 25, 0.75);
    }

    .toast-indicator {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--toast-color, var(--theme-brand-neon));
    }

    .toast-icon {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--toast-color, var(--theme-brand-neon));
    }

    .toast-icon svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }

    .toast-body {
      flex: 1;
      min-width: 0;
    }

    .toast-message {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--theme-text);
      line-height: 1.4;
      display: block;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: var(--theme-text-muted);
      opacity: 0.3;
      padding: 4px;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
      display: flex;
    }

    .toast-close svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }

    .toast-item:hover .toast-close {
      opacity: 0.8;
    }

    /* Types */
    .success { --toast-color: #9FFF22; }
    .error { --toast-color: #FF4B4B; }
    .warning { --toast-color: #FFB800; }
    .info { --toast-color: #22D3EE; }

    @keyframes toastIn {
      from { opacity: 0; transform: translateX(30px) scale(0.9); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }

    /* Light Mode */
    :host-context([data-theme="light"]) .toast-item {
      background: rgba(255, 255, 255, 0.85);
      border-color: rgba(0, 0, 0, 0.08);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    }
    
    :host-context([data-theme="light"]) .toast-message {
      color: #111;
    }

    :host-context([data-theme="light"]) .success { --toast-color: #3a7d0a; }
  `]
})
export class NotificationComponent {
  protected readonly UI_ICONS = UI_ICONS;
  protected readonly toastService = inject(ToastService);
}
