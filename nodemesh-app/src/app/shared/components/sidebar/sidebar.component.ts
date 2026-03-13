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
            <span class="item-text" *ngIf="isExpanded">Documentos</span>
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
      --sidebar-bg: #141417; /* Elevated Obsidian for Dark Mode */
      --active-glow: var(--primary-node);
      --text-main: var(--text-base);
      --text-dim: var(--text-muted);
      --border-color: #202025; /* Subtle Dark Divider */
      --glass-fill: rgba(255, 255, 255, 0.03);
      
      display: block;
      height: 100vh;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border-color);
      transition: 
        width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
        background-color 0.4s ease,
        border-color 0.4s ease;
      width: 260px;
      overflow: hidden;
      flex-shrink: 0;
      position: relative;
      z-index: 100;
    }

    :host-context([data-theme="light"]) {
      --sidebar-bg: #f8f9fa; /* Elegant off-white for Light Mode */
      --glass-fill: rgba(0, 0, 0, 0.03);
      --border-color: #e9ecef; /* Subtle Light Divider */
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
      transition: padding 0.4s ease;
    }

    :host.collapsed .sidebar-wrapper {
      padding: 1.5rem 0.5rem; /* More breathing room for icons when collapsed */
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2.5rem;
      height: 52px; /* Increased header height for larger logo */
      position: relative;
      gap: 1.25rem; /* Balanced gap */
      padding-right: 0.5rem;
    }

    :host.collapsed .sidebar-header {
      justify-content: center;
      padding-right: 0;
      gap: 0;
    }

    .logo-container {
      display: flex;
      align-items: center;
      animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .logo-img {
      height: 52px; /* Restored larger size */
      object-fit: contain;
    }

    .toggle-btn {
      background: transparent;
      backdrop-filter: none;
      border: none;
      color: var(--text-main);
      border-radius: 10px; /* Slightly tighter radius */
      padding: 6px; /* Reduced button footprint */
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: none;
    }

    :host.collapsed .toggle-btn {
      background: rgba(154, 205, 50, 0.05); /* Greenish tint for collapsed state */
      border: 1px solid rgba(154, 205, 50, 0.2);
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .toggle-btn:hover {
      background: rgba(154, 205, 50, 0.05);
      border: 1px solid rgba(154, 205, 50, 0.2);
    }

    .toggle-btn:hover .material-symbols-rounded {
      animation: nudgeLeft 0.6s infinite ease-in-out;
    }

    :host.collapsed .toggle-btn:hover .material-symbols-rounded {
      animation: nudgeRight 0.6s infinite ease-in-out;
    }

    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.25rem; /* Tighter navigation grouping */
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
      color: var(--text-dim);
      font-size: 0.6rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
      margin-left: 0.75rem;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      animation: slideIn 0.4s ease forwards;
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
      background: rgba(154, 205, 50, 0.05);
      color: var(--text-main);
      padding-left: 1.15rem;
    }

    :host.collapsed .nav-item {
      justify-content: center;
      padding: 0.75rem 0;
      gap: 0;
    }

    :host.collapsed .nav-item:hover {
      padding-left: 0;
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
      background: linear-gradient(90deg, rgba(154, 205, 50, 0.1) 0%, transparent 100%);
      color: var(--active-glow);
      font-weight: 600;
    }

    .nav-item.active .item-highlight {
      opacity: 1;
    }

    .item-text {
      font-size: 0.9rem;
      animation: slideFade 0.3s ease forwards;
    }

    .material-symbols-rounded {
      font-size: 20px;
      min-width: 20px;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 200, 'opsz' 24;
      transition: transform 0.3s ease;
    }

    .nav-item .material-symbols-rounded {
      font-size: 24px;
      min-width: 24px;
    }

    .nav-item:hover .material-symbols-rounded {
      animation: tiltShake 0.4s ease-in-out;
    }

    .nav-item.active .material-symbols-rounded {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 200, 'opsz' 24;
      animation: pulseGlow 2s infinite ease-in-out;
    }

    @keyframes tiltShake {
      0% { transform: rotate(0deg); }
      25% { transform: rotate(-8deg) scale(1.1); }
      50% { transform: rotate(8deg) scale(1.1); }
      75% { transform: rotate(-4deg) scale(1.1); }
      100% { transform: rotate(0deg) scale(1.1); }
    }

    @keyframes pulseGlow {
      0%, 100% { filter: drop-shadow(0 0 2px var(--active-glow)); transform: scale(1); }
      50% { filter: drop-shadow(0 0 8px var(--active-glow)); transform: scale(1.05); }
    }

    @keyframes nudgeLeft {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(-4px); }
    }

    @keyframes nudgeRight {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(4px); }
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
  isDark$ = this.themeService.isDark$;

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
