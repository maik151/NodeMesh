import { Component, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ThemeService } from '../../../core/services/ui/theme.service';
import { LiquidGlassComponent } from '../liquid-glass/liquid-glass.component';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, LiquidGlassComponent],
  template: `
    <div class="user-identity-shell" *ngIf="user">
      <div class="avatar-trigger" (click)="toggleMenu()" [class.active]="isOpen">
        <img [src]="user.photoURL || '/Images/default-avatar.png'" alt="User Avatar" class="avatar-img">
        <div class="status-indicator"></div>
      </div>

      <div class="identity-popover" *ngIf="isOpen">
        <app-liquid-glass [radius]="16" [blur]="8" [strength]="2" [backgroundColor]="(isDark$ | async) ? 'rgba(20, 20, 23, 0.7)' : 'rgba(255, 255, 255, 0.7)'">
          <div class="popover-content">
            <div class="popover-header">
              <span class="user-display-name">{{ user.displayName }}</span>
              <span class="user-email">{{ user.email }}</span>
            </div>
            
            <div class="popover-actions">
              <button class="action-btn logout-btn" (click)="handleLogout()">
                <span class="material-symbols-rounded">logout</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </app-liquid-glass>
      </div>
    </div>
  `,
  styles: [`
    .user-identity-shell {
      position: fixed;
      top: 1.5rem;
      right: 2rem;
      z-index: 1000;
    }

    .avatar-trigger {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      padding: 3px;
      background: var(--glass-fill);
      border: 1px solid var(--border-color);
      cursor: pointer;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-trigger:hover, .avatar-trigger.active {
      transform: scale(1.05);
      border-color: var(--active-glow);
      box-shadow: 0 0 15px rgba(154, 205, 50, 0.2);
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .status-indicator {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 10px;
      height: 10px;
      background: #9ACD32;
      border: 2px solid var(--sidebar-bg);
      border-radius: 50%;
    }

    .identity-popover {
      position: absolute;
      top: calc(100% + 1rem);
      right: 0;
      width: 280px;
      animation: bloomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      transform-origin: top right;
      z-index: 1001;
    }

    .popover-content {
      padding: 1.25rem;
    }

    :host-context([data-theme="light"]) .identity-popover {
      /* Theme colors handled via input binding to app-liquid-glass */
    }

    .popover-header {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 1.25rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-color);
    }

    .user-display-name {
      color: var(--text-main);
      font-weight: 600;
      font-size: 0.95rem;
      letter-spacing: -0.2px;
    }

    .user-email {
      color: var(--text-dim);
      font-size: 0.8rem;
    }

    .popover-actions {
      display: flex;
      flex-direction: column;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: transparent;
      border: none;
      color: var(--text-main);
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .logout-btn:hover {
      background: rgba(255, 71, 87, 0.1);
      color: #ff4757;
    }

    .material-symbols-rounded {
      font-size: 20px;
    }

    @keyframes bloomIn {
      from { 
        opacity: 0; 
        transform: scale(0.9) translateY(-10px);
      }
      to { 
        opacity: 1; 
        transform: scale(1) translateY(0);
      }
    }
  `]
})
export class UserMenuComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly el = inject(ElementRef);
  private readonly themeService = inject(ThemeService);

  isOpen = false;
  isDark$ = this.themeService.isDark$;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isOpen && !this.el.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }

  get user() {
    return this.auth.getCurrentUser();
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  handleLogout() {
    this.auth.logout();
    this.isOpen = false;
    this.router.navigate(['/login']);
  }
}
