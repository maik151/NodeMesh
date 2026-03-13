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
          <img [src]="logoSrc" alt="NodeMesh Logo" class="logo-img">
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
    </div>
  `,
  styles: [`
    :host {
      --sidebar-bg: var(--bg-surface, #121212);
      --active-glow: var(--primary-node, #9ACD32);
      --text-main: var(--text-base, #ffffff);
      --text-dim: var(--text-muted, rgba(255, 255, 255, 0.6));
      --border-color: var(--glass-border, rgba(255, 255, 255, 0.1));
      
      display: block;
      height: 100vh;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border-color);
      transition: width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      width: 260px;
      overflow: hidden;
      flex-shrink: 0;
      position: relative;
      z-index: 100;
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

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2.5rem;
      height: 48px;
      position: relative;
    }

    :host.collapsed .sidebar-header {
      justify-content: center;
    }

    .logo-container {
      display: flex;
      align-items: center;
      animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .logo-img {
      height: 44px;
      object-fit: contain;
    }

    .toggle-btn {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      border-radius: 12px;
      padding: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    :host.collapsed .toggle-btn {
      background: rgba(154, 205, 50, 0.05);
      border-color: rgba(154, 205, 50, 0.2);
    }

    .toggle-btn:hover {
      background: rgba(154, 205, 50, 0.1);
      border-color: var(--active-glow);
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(154, 205, 50, 0.2);
    }

    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-group.bottom {
      margin-top: auto;
      border-top: 1px solid var(--border-color);
      padding-top: 1.5rem;
    }

    .group-label {
      color: var(--text-dim);
      font-size: 0.65rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      margin-left: 0.75rem;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      animation: slideIn 0.4s ease forwards;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 0.85rem 1rem;
      color: var(--text-dim);
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      position: relative;
    }

    .nav-item:hover {
      background: rgba(154, 205, 50, 0.05);
      color: var(--text-main);
      padding-left: 1.25rem;
    }

    .nav-item.active {
      background: linear-gradient(90deg, rgba(154, 205, 50, 0.15) 0%, rgba(154, 205, 50, 0.05) 100%);
      color: var(--active-glow);
      font-weight: 600;
      box-shadow: inset 2px 0 0 var(--active-glow);
    }

    .item-text {
      font-size: 0.95rem;
      animation: slideFade 0.3s ease forwards;
    }

    .material-symbols-rounded {
      font-size: 24px;
      min-width: 24px;
      transition: transform 0.3s ease;
    }

    .nav-item:hover .material-symbols-rounded {
      transform: scale(1.15);
    }

    @keyframes popIn {
      from { opacity: 0; transform: scale(0.9) translateX(-10px); }
      to { opacity: 1; transform: scale(1) translateX(0); }
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 0.6; transform: translateX(0); }
    }

    @keyframes slideFade {
      from { opacity: 0; transform: translateX(-5px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class SidebarComponent {
  private readonly themeService = inject(ThemeService);
  
  @HostBinding('class.collapsed') get isCollapsed() { return !this.isExpanded; }
  @HostBinding('class.expanded') get isExpandedInternal() { return this.isExpanded; }

  isExpanded = true;

  get logoSrc(): string {
    return this.themeService.isDark ? '/Images/nodeMesh_white.png' : '/Images/nodemesh_dark.png';
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
