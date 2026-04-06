import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FolderTheme, QuizSession } from '../../../../core/models/node.model';

@Component({
  selector: 'app-vault-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="v-sidebar">

      <!-- HEADER -->
      <div class="v-header">
        <div class="h-top">
          <div class="h-title">
            <svg class="h-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path d="M216,40H40A16,16,0,0,0,24,56V216a8,8,0,0,0,11.58,7.16L64,208.94l28.42,14.22a8,8,0,0,0,7.16,0L128,208.94l28.42,14.22a8,8,0,0,0,7.16,0L192,208.94l28.42,14.22A8,8,0,0,0,232,216V56A16,16,0,0,0,216,40Zm0,163.06-20.42-10.22a8,8,0,0,0-7.16,0L160,207.06l-28.42-14.22a8,8,0,0,0-7.16,0L96,207.06,67.58,192.84a8,8,0,0,0-7.16,0L40,203.06V56H216ZM60.42,167.16a8,8,0,0,0,10.74-3.58L76.94,152h38.12l5.78,11.58a8,8,0,1,0,14.32-7.16l-32-64a8,8,0,0,0-14.32,0l-32,64A8,8,0,0,0,60.42,167.16ZM96,113.89,107.06,136H84.94ZM136,128a8,8,0,0,1,8-8h16V104a8,8,0,0,1,16,0v16h16a8,8,0,0,1,0,16H176v16a8,8,0,0,1-16,0V136H144A8,8,0,0,1,136,128Z"/>
            </svg>
            <h1>Temas y Tests</h1>
          </div>
          <button class="icon-btn" title="Menú">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/>
            </svg>
          </button>
        </div>
        <p class="h-subtitle">Gestiona los Temas y Accede a los diferentes Tests</p>
      </div>

      <!-- SEPARATOR -->
      <div class="v-separator"></div>

      <!-- TOOLBAR -->
      <div class="v-toolbar">
        <span class="t-label">Temas</span>
        <div class="t-actions">
          <button class="icon-btn" (click)="onRefresh.emit()" title="Refrescar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path d="M88,104H40a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V76.69L62.63,62.06A95.43,95.43,0,0,1,130,33.94h.53a95.36,95.36,0,0,1,67.07,27.33,8,8,0,0,1-11.18,11.44,79.52,79.52,0,0,0-55.89-22.77h-.45A79.56,79.56,0,0,0,73.94,73.37L59.31,88H88a8,8,0,0,1,0,16Zm128,48H168a8,8,0,0,0,0,16h28.69l-14.63,14.63a79.56,79.56,0,0,1-56.13,23.43h-.45a79.52,79.52,0,0,1-55.89-22.77,8,8,0,1,0-11.18,11.44,95.36,95.36,0,0,0,67.07,27.33H126a95.43,95.43,0,0,0,67.36-28.12L208,179.31V208a8,8,0,0,0,16,0V160A8,8,0,0,0,216,152Z"/>
            </svg>
          </button>
          <button class="icon-btn" (click)="onNewTheme.emit()" title="Nuevo Tema">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path d="M216,72H131.31L104,44.69A15.86,15.86,0,0,0,92.69,40H40A16,16,0,0,0,24,56V200.62A15.4,15.4,0,0,0,39.38,216H216.89A15.13,15.13,0,0,0,232,200.89V88A16,16,0,0,0,216,72ZM92.69,56l16,16H40V56ZM216,200H40V88H216Zm-88-88a8,8,0,0,1,8,8v16h16a8,8,0,0,1,0,16H136v16a8,8,0,0,1-16,0V152H104a8,8,0,0,1,0-16h16V120A8,8,0,0,1,128,112Z"/>
            </svg>
          </button>
          <button class="icon-btn" (click)="showSearch = !showSearch" title="Buscar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- SEARCH -->
      <div class="v-search" *ngIf="showSearch">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          placeholder="Buscar tema..."
          class="search-input">
      </div>

      <!-- TREE EXPLORER -->
      <div class="v-tree scroll-custom">
        <ng-container *ngFor="let folder of filteredFolders">
          <!-- THEME ROW -->
          <div class="tree-row theme-row"
               [class.row-active]="activeThemeId === folder.folder_id"
               (click)="toggleFolder(folder.folder_id)">
            <div class="row-left">
              <svg class="chevron-svg" [class.open]="expandedFolders.has(folder.folder_id)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"/>
              </svg>
              <svg class="folder-svg" [style.color]="folder.color_tag" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                <path d="M216,72H131.31L104,44.69A15.86,15.86,0,0,0,92.69,40H40A16,16,0,0,0,24,56V200.62A15.4,15.4,0,0,0,39.38,216H216.89A15.13,15.13,0,0,0,232,200.89V88A16,16,0,0,0,216,72ZM40,56H92.69l16,16H40ZM216,200H40V88H216Z"/>
              </svg>
              <span class="row-name" [class.name-active]="activeThemeId === folder.folder_id">{{ folder.nombre_tema }}</span>
            </div>
            <div class="row-right">
              <span class="badge">[{{ (quizzesByFolder[folder.folder_id] || []).length }}]</span>
              <button class="dots-btn"
                      (click)="$event.stopPropagation(); toggleMenu(folder.folder_id)"
                      title="Opciones">
                <span>•••</span>
              </button>
              <div class="ctx-menu" *ngIf="menuOpenId === folder.folder_id" (click)="$event.stopPropagation()">
                <button class="ctx-item ctx-delete" (click)="onDeleteTheme.emit(folder); menuOpenId = null">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/>
                  </svg>
                  Eliminar
                </button>
                <button class="ctx-item ctx-edit" (click)="onEditTheme.emit(folder); menuOpenId = null">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                    <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120Zm96-96L147.31,64l24-24L216,84.68Z"/>
                  </svg>
                  Editar
                </button>
              </div>
            </div>
          </div>

          <!-- QUIZ CHILDREN -->
          <div class="children-block" *ngIf="expandedFolders.has(folder.folder_id)">
            <div class="tree-row quiz-row"
                 *ngFor="let quiz of quizzesByFolder[folder.folder_id]"
                 [class.row-active]="activeQuizId === quiz.quiz_id"
                 (click)="onSelectQuiz.emit(quiz)">
              <div class="row-left child-indent">
                <svg class="quiz-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                  <path d="M216,40H40A16,16,0,0,0,24,56V216a8,8,0,0,0,11.58,7.16L64,208.94l28.42,14.22a8,8,0,0,0,7.16,0L128,208.94l28.42,14.22a8,8,0,0,0,7.16,0L192,208.94l28.42,14.22A8,8,0,0,0,232,216V56A16,16,0,0,0,216,40Zm0,163.06-20.42-10.22a8,8,0,0,0-7.16,0L160,207.06l-28.42-14.22a8,8,0,0,0-7.16,0L96,207.06,67.58,192.84a8,8,0,0,0-7.16,0L40,203.06V56H216ZM60.42,167.16a8,8,0,0,0,10.74-3.58L76.94,152h38.12l5.78,11.58a8,8,0,1,0,14.32-7.16l-32-64a8,8,0,0,0-14.32,0l-32,64A8,8,0,0,0,60.42,167.16ZM96,113.89,107.06,136H84.94ZM136,128a8,8,0,0,1,8-8h16V104a8,8,0,0,1,16,0v16h16a8,8,0,0,1,0,16H176v16a8,8,0,0,1-16,0V136H144A8,8,0,0,1,136,128Z"/>
                </svg>
                <span class="row-name child-name">{{ quiz.titulo_quiz }}</span>
                <div class="recent-dot" *ngIf="isRecent(quiz)"></div>
              </div>
              <div class="row-right">
                <button class="dots-btn"
                        (click)="$event.stopPropagation(); toggleMenu(quiz.quiz_id)"
                        title="Opciones">
                  <span>•••</span>
                </button>
                <div class="ctx-menu" *ngIf="menuOpenId === quiz.quiz_id" (click)="$event.stopPropagation()">
                  <button class="ctx-item ctx-delete" (click)="onDeleteQuiz.emit(quiz); menuOpenId = null">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                      <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/>
                    </svg>
                    Eliminar
                  </button>
                  <button class="ctx-item ctx-edit" (click)="onEditQuiz.emit(quiz); menuOpenId = null">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                      <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120Zm96-96L147.31,64l24-24L216,84.68Z"/>
                    </svg>
                    Editar
                  </button>
                </div>
              </div>
            </div>

            <!-- EMPTY STATE -->
            <div class="empty-child" *ngIf="(quizzesByFolder[folder.folder_id] || []).length === 0">
              Sin tests vinculados
            </div>
          </div>
        </ng-container>

        <!-- GLOBAL EMPTY -->
        <div class="global-empty" *ngIf="filteredFolders.length === 0">
          <p>Sin temas registrados</p>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* ═══════════════════════════════════════ HOST */
    :host {
      display: block;
      height: 100vh;
    }

    /* ═══════════════════════════════════════ SHELL */
    .v-sidebar {
      width: 350px;
      height: 100%;
      background: var(--theme-surface-solid);
      border-right: 1px solid var(--theme-border);
      display: flex;
      flex-direction: column;
      font-family: 'JetBrains Mono', monospace;
      color: var(--theme-text);
      overflow: hidden;
    }

    /* ═══════════════════════════════════════ HEADER */
    .v-header {
      padding: 1.5rem 1rem 1.2rem 2.5rem;
    }

    .h-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.15rem;
    }

    .h-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .h-title h1 {
      font-size: 1.3rem;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.03em;
      color: var(--theme-text);
    }

    .h-icon {
      width: 28px;
      height: 28px;
      flex-shrink: 0;
      fill: var(--theme-text) !important;
    }

    .h-subtitle {
      font-size: 0.85rem;
      color: var(--theme-text);
      margin: 0;
      margin-right: 2.5rem;
      opacity: 0.85;
      line-height: 1.3;
    }

    /* ═══════════════════════════════════════ SEPARATOR */
    .v-separator {
      height: 1px;
      background: var(--theme-border);
      margin: 0;
    }

    /* ═══════════════════════════════════════ TOOLBAR */
    .v-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 1rem 0.6rem 2.5rem;
    }

    .t-label {
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--theme-text);
      opacity: 0.85;
    }

    .t-actions {
      display: flex;
      gap: 2px;
    }

    /* ═══════════════════════════════════════ ICON BUTTON (shared) */
    .icon-btn {
      background: transparent;
      border: none;
      width: 38px;
      height: 38px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s, opacity 0.15s;
      opacity: 0.55;
      color: var(--theme-text);
    }

    .icon-btn:hover {
      opacity: 1;
      background: var(--theme-border);
    }

    .icon-btn svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    /* ═══════════════════════════════════════ SEARCH */
    .v-search {
      padding: 0 1rem 0.75rem;
    }

    .search-input {
      width: 100%;
      background: var(--theme-bg);
      border: 1px solid var(--theme-border);
      padding: 0.45rem 0.7rem;
      border-radius: 6px;
      color: var(--theme-text);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.78rem;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      border-color: var(--theme-brand-neon);
      box-shadow: 0 0 0 2px rgba(159, 255, 34, 0.1);
    }

    /* ═══════════════════════════════════════ TREE */
    .v-tree {
      flex: 1;
      overflow-y: auto;
      padding: 0.25rem 0 2rem;
    }

    /* ═══════════════════════════════════════ ROWS */
    .tree-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.38rem 1rem 0.38rem 2.5rem;
      min-height: 34px;
      cursor: pointer;
      position: relative;
      transition: background 0.1s;
    }

    .tree-row:hover {
      background: var(--theme-border);
    }

    .tree-row:hover .dots-btn { opacity: 0.7; }

    .row-active {
      background: rgba(159, 255, 34, 0.08) !important;
    }

    .row-left {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex: 1;
      min-width: 0;
    }

    .child-indent {
      padding-left: 1.2rem;
    }
    
    .children-block {
      border-left: 1px solid var(--theme-border);
      margin-left: 3rem;
    }

    .row-right {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      position: relative;
      flex-shrink: 0;
    }

    /* ═══════════════════════════════════════ SVG ICONS */
    .chevron-svg {
      width: 15px;
      height: 15px;
      fill: var(--theme-text-muted);
      flex-shrink: 0;
      transform: rotate(0deg);
      transition: transform 0.2s ease;
    }

    .chevron-svg.open {
      transform: rotate(90deg);
    }

    .folder-svg {
      width: 17px;
      height: 17px;
      flex-shrink: 0;
      fill: currentColor;
    }

    .quiz-svg {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
      fill: var(--theme-text-muted);
      opacity: 0.65;
    }

    /* ═══════════════════════════════════════ TEXT */
    .row-name {
      font-size: 0.83rem;
      font-weight: 500;
      color: var(--theme-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 175px;
    }

    .name-active {
      color: var(--theme-brand-neon) !important;
      font-weight: 700;
    }

    .child-name {
      font-size: 0.8rem;
      font-weight: 400;
      color: var(--theme-text-muted);
    }

    /* ═══════════════════════════════════════ BADGE */
    .badge {
      font-size: 0.7rem;
      font-family: 'JetBrains Mono', monospace;
      color: var(--theme-text-muted);
      opacity: 0.65;
      letter-spacing: -0.5px;
      flex-shrink: 0;
    }

    /* ═══════════════════════════════════════ DOTS BUTTON */
    .dots-btn {
      background: transparent;
      border: none;
      color: var(--theme-text-muted);
      opacity: 0;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
      line-height: 1;
      letter-spacing: 1px;
      transition: background 0.15s, opacity 0.15s;
      flex-shrink: 0;
    }

    .dots-btn:hover {
      opacity: 1 !important;
      background: rgba(255, 255, 255, 0.1);
    }

    /* ═══════════════════════════════════════ CONTEXT MENU */
    .ctx-menu {
      position: absolute;
      right: 0;
      top: calc(100% + 2px);
      z-index: 200;
      background: var(--theme-surface-solid);
      border: 1px solid var(--theme-border);
      border-radius: 8px;
      padding: 4px;
      min-width: 120px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      animation: ctx-pop 0.15s ease-out;
    }

    .ctx-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      border: none;
      background: transparent;
      color: var(--theme-text-muted);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      font-weight: 500;
      cursor: pointer;
      border-radius: 5px;
      text-align: left;
      transition: background 0.15s, color 0.15s;
    }

    .ctx-item svg {
      width: 13px;
      height: 13px;
      fill: currentColor;
      flex-shrink: 0;
    }

    .ctx-item:hover {
      background: var(--theme-border);
      color: var(--theme-text);
    }

    .ctx-delete:hover {
      color: #ff6b6b;
    }

    .ctx-edit:hover {
      color: var(--theme-brand-neon);
    }

    /* ═══════════════════════════════════════ TREE LINE */
    .children-block {
      border-left: 1px solid var(--theme-border);
      margin-left: 20px;
    }

    /* ═══════════════════════════════════════ RECENT DOT */
    .recent-dot {
      width: 6px;
      height: 6px;
      background: #ff5c5c;
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* ═══════════════════════════════════════ EMPTY STATES */
    .empty-child {
      padding: 0.4rem 2.5rem;
      font-size: 0.65rem;
      color: var(--theme-text-muted);
      opacity: 0.5;
      font-style: italic;
    }

    .global-empty {
      padding: 2rem 1.5rem;
      text-align: center;
      opacity: 0.4;
      font-size: 0.75rem;
      color: var(--theme-text-muted);
    }

    /* ═══════════════════════════════════════ SCROLLBAR */
    .scroll-custom::-webkit-scrollbar { width: 4px; }
    .scroll-custom::-webkit-scrollbar-track { background: transparent; }
    .scroll-custom::-webkit-scrollbar-thumb { background: var(--theme-border); border-radius: 10px; }
    .scroll-custom::-webkit-scrollbar-thumb:hover { background: var(--theme-text-muted); }

    /* ═══════════════════════════════════════ ANIMATIONS */
    @keyframes ctx-pop {
      from { opacity: 0; transform: scale(0.92) translateY(-6px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* ═══════════════════════════════════════ LIGHT MODE */
    :host-context([data-theme="light"]) .v-sidebar {
      background: var(--theme-surface-solid);
      border-right-color: var(--theme-border);
    }

    :host-context([data-theme="light"]) .search-input {
      background: #fff;
      border-color: var(--theme-border);
      color: var(--theme-text);
    }

    :host-context([data-theme="light"]) .ctx-menu {
      background: #fff;
      border-color: var(--theme-border);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    :host-context([data-theme="light"]) .tree-row:hover {
      background: rgba(0,0,0,0.04);
    }

    :host-context([data-theme="light"]) .icon-btn:hover {
      background: rgba(0,0,0,0.06);
    }

    :host-context([data-theme="light"]) .ctx-item:hover {
      background: rgba(0,0,0,0.06);
    }

    :host-context([data-theme="light"]) .children-block {
      border-left-color: rgba(0,0,0,0.1);
    }

    :host-context([data-theme="light"]) .dots-btn:hover {
      background: rgba(0,0,0,0.06);
    }
  `]
})
export class VaultSidebarComponent {
  @Input() folders: FolderTheme[] = [];
  @Input() quizzesByFolder: { [key: string]: QuizSession[] } = {};
  @Input() activeThemeId: string | null = null;
  @Input() activeQuizId: string | null = null;

  @Output() onSelectTheme = new EventEmitter<FolderTheme>();
  @Output() onSelectQuiz = new EventEmitter<QuizSession>();
  @Output() onRefresh = new EventEmitter<void>();
  @Output() onNewTheme = new EventEmitter<void>();
  @Output() onEditTheme = new EventEmitter<FolderTheme>();
  @Output() onDeleteTheme = new EventEmitter<FolderTheme>();
  @Output() onEditQuiz = new EventEmitter<QuizSession>();
  @Output() onDeleteQuiz = new EventEmitter<QuizSession>();

  expandedFolders = new Set<string>();
  showSearch = false;
  searchTerm = '';
  menuOpenId: string | null = null;

  get filteredFolders(): FolderTheme[] {
    if (!this.searchTerm.trim()) return this.folders;
    const q = this.searchTerm.toLowerCase();
    return this.folders.filter(f => f.nombre_tema.toLowerCase().includes(q));
  }

  toggleFolder(id: string) {
    if (this.expandedFolders.has(id)) this.expandedFolders.delete(id);
    else this.expandedFolders.add(id);
    this.menuOpenId = null;
  }

  toggleMenu(id: string) {
    this.menuOpenId = this.menuOpenId === id ? null : id;
  }

  isRecent(quiz: QuizSession): boolean {
    if (!quiz.creado_en) return false;
    const diff = Date.now() - new Date(quiz.creado_en).getTime();
    return diff < (1000 * 60 * 60 * 24);
  }
}
