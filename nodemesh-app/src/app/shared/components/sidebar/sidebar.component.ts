import { Component, inject, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../../core/services/ui/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar-wrapper">
      <div class="sidebar-header">
        <div class="logo-container" [hidden]="!isExpanded">
          <img [src]="(isDark$ | async) ? '/Images/nodeMesh_white.png' : '/Images/nodemesh_dark.png'" 
               alt="NodeMesh Logo" class="logo-img">
        </div>
        <button class="toggle-btn" (click)="toggle()" [title]="isExpanded ? 'Contraer' : 'Expandir'">
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
            <div class="item-highlight"></div>
            <span class="material-symbols-rounded">terminal</span>
            <span class="item-text" *ngIf="isExpanded">Command Center</span>
          </a>
          <a routerLink="/vault" routerLinkActive="active" class="nav-item">
            <div class="item-highlight"></div>
            <span class="material-symbols-rounded">database</span>
            <span class="item-text" *ngIf="isExpanded">Bóveda</span>
          </a>
        </div>

        <!-- Bloque 2: Análisis -->
        <div class="nav-group">
          <small *ngIf="isExpanded" class="group-label">ANÁLISIS</small>
          <a routerLink="/stats" routerLinkActive="active" class="nav-item">
            <div class="item-highlight"></div>
            <span class="material-symbols-rounded">analytics</span>
            <span class="item-text" *ngIf="isExpanded">Estadísticas</span>
          </a>
        </div>

        <!-- Bloque 3: Infraestructura (Push down) -->
        <div class="nav-group bottom">
          <a routerLink="/docs" routerLinkActive="active" class="nav-item">
            <div class="item-highlight"></div>
            <span class="material-symbols-rounded">book</span>
            <span class="item-text" *ngIf="isExpanded">Docs</span>
          </a>
          <a routerLink="/settings" routerLinkActive="active" class="nav-item">
            <div class="item-highlight"></div>
            <span class="material-symbols-rounded">settings</span>
            <span class="item-text" *ngIf="isExpanded">Configuración</span>
          </a>
        </div>
      </nav>
    </div>
  `,
  styles: [`
    :host {
      --sidebar-bg: var(--theme-surface-solid);
      --active-glow: var(--theme-brand-neon);
      --text-main: var(--theme-text);
      --text-dim: var(--theme-text-muted);
      --border-color: var(--theme-border);
      
      display: block;
      height: 100vh;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border-color);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.4s ease, border-color 0.4s ease;
      width: 260px;
      overflow: hidden;
      flex-shrink: 0;
      position: relative;
      z-index: 100;
    }

    :host-context([data-theme="light"]) {
      --sidebar-bg: #ffffff;
      --border-color: var(--theme-border);
    }

    :host.collapsed {
      width: 80px;
    }

    .sidebar-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1.5rem 1rem;
      box-sizing: border-box;
    }

    :host.collapsed .sidebar-wrapper {
      padding: 1.5rem 0.5rem;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2.5rem;
      height: 52px;
      position: relative;
      gap: 1.25rem;
      padding-right: 0.5rem;
      background: var(--sidebar-bg);
      z-index: 2;
    }

    :host.collapsed .sidebar-header {
      justify-content: center;
      padding-right: 0;
      gap: 0;
    }

    .logo-container {
      display: flex;
      align-items: center;
    }

    .logo-img {
      height: 52px;
      object-fit: contain;
    }

    .toggle-btn {
      background: transparent;
      border: none;
      color: var(--text-main);
      border-radius: 10px;
      padding: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .toggle-btn:hover {
      background: rgba(154, 205, 50, 0.1);
    }

    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-group.bottom {
      margin-top: auto;
      border-top: 1px solid var(--border-color);
      padding-top: 1.25rem;
    }

    .group-label {
      color: var(--theme-text-muted);
      font-size: 10px;
      font-weight: 900;
      margin-bottom: 0.25rem;
      margin-left: 0.75rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      opacity: 0.9;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      color: var(--text-dim);
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      position: relative;
    }

    .nav-item:hover {
      background: rgba(154, 205, 50, 0.1);
      color: var(--text-main);
    }

    :host.collapsed .nav-item {
      justify-content: center;
      padding: 0.75rem 0;
      gap: 0;
    }

    .item-highlight {
      position: absolute;
      left: 0;
      width: 3px;
      height: 60%;
      background: var(--active-glow);
      border-radius: 0 4px 4px 0;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .nav-item.active {
      background: rgba(154, 205, 50, 0.1);
      border-left: 3px solid var(--active-glow);
      color: var(--active-glow);
      font-weight: 600;
      border-radius: 0 12px 12px 0;
    }

    :host-context([data-theme="light"]) .nav-item.active {
      background: rgba(0, 0, 0, 0.05);
    }

    .item-text {
      font-size: 0.92rem;
      font-weight: 600;
    }

    .material-symbols-rounded {
      font-size: 24px;
      min-width: 24px;
    }
  `]
})
export class SidebarComponent {
  private readonly themeService = inject(ThemeService);
  
  @HostBinding('class.collapsed') get isCollapsed() { return !this.isExpanded; }
  @HostBinding('class.expanded') get isExpandedInternal() { return this.isExpanded; }

  isExpanded = true;
  isDark$ = this.themeService.isDark$;

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
