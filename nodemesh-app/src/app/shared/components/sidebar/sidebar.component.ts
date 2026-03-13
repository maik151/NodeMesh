import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside [class.collapsed]="!isExpanded">
      <div class="sidebar-header">
        <span class="logo-text" *ngIf="isExpanded">NodeMesh</span>
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
      --sidebar-bg: #121212;
      --active-glow: #9ACD32;
      --text-dim: rgba(255, 255, 255, 0.6);
      display: block;
      height: 100vh;
      background: var(--sidebar-bg);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      width: 260px;
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
      height: 40px;
    }

    .logo-text {
      font-weight: 700;
      color: var(--active-glow);
      font-size: 1.25rem;
      letter-spacing: -0.5px;
    }

    .toggle-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      border-radius: 8px;
      padding: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
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
      border-top: 1px solid rgba(255, 255, 255, 0.05);
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
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
    }

    .nav-item.active {
      background: rgba(154, 205, 50, 0.1);
      color: var(--active-glow);
      border-left: 3px solid var(--active-glow);
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
  isExpanded = true;
  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
