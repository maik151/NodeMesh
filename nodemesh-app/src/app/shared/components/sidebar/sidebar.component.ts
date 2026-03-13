import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../../core/services/ui/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside [class.collapsed]="!isExpanded">
      <div class="sidebar-header">
        <div class="logo-container" *ngIf="isExpanded">
          <img [src]="logoSrc" alt="NodeMesh Logo" class="logo-img">
        </div>
        <button class="toggle-btn" (click)="toggle()">
          <span class="material-symbols-rounded">
            {{ isExpanded ? 'chevron_left' : 'menu' }}
          </span>
        </button>
      </div>

      <nav class="sidebar-nav">
        <!-- Bloque 1: El Flujo de Trabajo -->
        <div class="nav-group">
          <small *ngIf="isExpanded" class="group-label">FLUJO</small>
          <a routerLink="/center" routerLinkActive="active" class="nav-item">
            <span class="material-symbols-rounded">terminal</span>
            <span class="item-text" *ngIf="isExpanded">Command Center</span>
          </a>
          <a routerLink="/vault" routerLinkActive="active" class="nav-item">
            <span class="material-symbols-rounded">database</span>
            <span class="item-text" *ngIf="isExpanded">Bóveda</span>
          </a>
        </div>

        <!-- Bloque 2: Análisis -->
        <div class="nav-group">
          <small *ngIf="isExpanded" class="group-label">ANÁLISIS</small>
          <a routerLink="/stats" routerLinkActive="active" class="nav-item">
            <span class="material-symbols-rounded">analytics</span>
            <span class="item-text" *ngIf="isExpanded">Estadísticas</span>
          </a>
        </div>

        <!-- Bloque 3: Infraestructura (Push down) -->
        <div class="nav-group bottom">
          <a routerLink="/docs" routerLinkActive="active" class="nav-item">
            <span class="material-symbols-rounded">book</span>
            <span class="item-text" *ngIf="isExpanded">Documentos</span>
          </a>
          <a routerLink="/settings" routerLinkActive="active" class="nav-item">
            <span class="material-symbols-rounded">settings</span>
            <span class="item-text" *ngIf="isExpanded">Configuración</span>
          </a>
        </div>
      </nav>
    </aside>
  `,
  styles: [`
    :host {
      --sidebar-bg: var(--bg-surface, #121212);
      --active-glow: var(--primary-node, #9ACD32);
      --text-main: var(--text-base, #ffffff);
      --text-dim: var(--text-muted, rgba(255, 255, 255, 0.6));
      --border-color: rgba(255, 255, 255, 0.1);
      
      display: block;
      height: 100vh;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border-color);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease;
      width: 260px;
    }

    /* Override for Light Theme if theme variables aren't global yet */
    :host-context([data-theme="light"]) {
      --sidebar-bg: #f5f5f5;
      --text-main: #050505;
      --text-dim: rgba(0, 0, 0, 0.6);
      --border-color: rgba(0, 0, 0, 0.1);
    }

    aside.collapsed {
      width: 80px;
    }

    aside {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1rem;
      box-sizing: border-box;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      height: 50px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      overflow: hidden;
    }

    .logo-img {
      height: 48px;
      object-fit: contain;
    }

    .toggle-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      border-radius: 8px;
      padding: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    :host-context([data-theme="light"]) .toggle-btn {
      background: rgba(0, 0, 0, 0.05);
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--active-glow);
    }

    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-group.bottom {
      margin-top: auto;
      border-top: 1px solid var(--border-color);
      padding-top: 1rem;
    }

    .group-label {
      color: var(--text-dim);
      font-size: 0.7rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      margin-left: 0.5rem;
      letter-spacing: 1px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      color: var(--text-dim);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s ease;
      white-space: nowrap;
      overflow: hidden;
    }

    .nav-item:hover {
      background: rgba(154, 205, 50, 0.05);
      color: var(--text-main);
    }

    .nav-item.active {
      background: rgba(154, 205, 50, 0.1);
      color: var(--active-glow);
      font-weight: 600;
    }

    .nav-item.active .material-symbols-rounded {
      color: var(--active-glow);
    }

    .material-symbols-rounded {
      font-size: 24px;
      min-width: 24px;
    }

    .item-text {
      font-size: 0.95rem;
      font-weight: 500;
    }
  `]
})
export class SidebarComponent {
  private readonly themeService = inject(ThemeService);
  isExpanded = true;

  get logoSrc(): string {
    return this.themeService.isDark ? '/Images/nodeMesh_white.png' : '/Images/nodemesh_dark.png';
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
