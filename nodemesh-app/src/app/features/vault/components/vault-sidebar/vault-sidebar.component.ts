import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FolderTheme, QuizSession } from '../../../../core/models/node.model';

@Component({
  selector: 'app-vault-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="v-sidebar" [class.collapsed]="isCollapsed">

      <!-- HEADER -->
      <div class="v-header">
        <div class="h-top">
          <div class="h-title">
            <svg class="h-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path d="M216,40H40A16,16,0,0,0,24,56V216a8,8,0,0,0,11.58,7.16L64,208.94l28.42,14.22a8,8,0,0,0,7.16,0L128,208.94l28.42,14.22a8,8,0,0,0,7.16,0L192,208.94l28.42,14.22A8,8,0,0,0,232,216V56A16,16,0,0,0,216,40Zm0,163.06-20.42-10.22a8,8,0,0,0-7.16,0L160,207.06l-28.42-14.22a8,8,0,0,0-7.16,0L96,207.06,67.58,192.84a8,8,0,0,0-7.16,0L40,203.06V56H216ZM60.42,167.16a8,8,0,0,0,10.74-3.58L76.94,152h38.12l5.78,11.58a8,8,0,1,0,14.32-7.16l-32-64a8,8,0,0,0-14.32,0l-32,64A8,8,0,0,0,60.42,167.16ZM96,113.89,107.06,136H84.94ZM136,128a8,8,0,0,1,8-8h16V104a8,8,0,0,1,16,0v16h16a8,8,0,0,1,0,16H176v16a8,8,0,0,1-16,0V136H144A8,8,0,0,1,136,128Z"/>
            </svg>
            <h1>Temas y Tests</h1>
          </div>
          <button class="icon-btn" title="Menú" (click)="onToggleCollapse.emit()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,152H56a8,8,0,0,0,0-16H40V120H56a8,8,0,0,0,0-16H40V88H56a8,8,0,0,0,0-16H40V56H80V200H40Zm176,48H96V56H216V200Z"></path>
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
          <button class="icon-btn" (click)="onRefresh.emit()" title="Refrescar" [disabled]="isLoading">
             <svg [class.spinning]="isLoading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path d="M88,104H40a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V76.69L62.63,62.06A95.43,95.43,0,0,1,130,33.94h.53a95.36,95.36,0,0,1,67.07,27.33,8,8,0,0,1-11.18,11.44,79.52,79.52,0,0,0-55.89-22.77h-.45A79.56,79.56,0,0,0,73.94,73.37L59.31,88H88a8,8,0,0,1,0,16Zm128,48H168a8,8,0,0,0,0,16h28.69l-14.63,14.63a79.56,79.56,0,0,1-56.13,23.43h-.45a79.52,79.52,0,0,1-55.89-22.77,8,8,0,1,0-11.18,11.44,95.36,95.36,0,0,0,67.07,27.33H126a95.43,95.43,0,0,0,67.36-28.12L208,179.31V208a8,8,0,0,0,16,0V160A8,8,0,0,0,216,152Z"/>
            </svg>
          </button>
          <button class="icon-btn" (click)="startCreatingTheme()" title="Nuevo Tema">
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
        <!-- Opcional: estado de carga general sobre el sidebar -->
        <div class="global-loading" *ngIf="isLoading && !isCollapsed">
          <svg class="loading-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
             <path d="M88,104H40a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V76.69L62.63,62.06A95.43,95.43,0,0,1,130,33.94h.53a95.36,95.36,0,0,1,67.07,27.33,8,8,0,0,1-11.18,11.44,79.52,79.52,0,0,0-55.89-22.77h-.45A79.56,79.56,0,0,0,73.94,73.37L59.31,88H88a8,8,0,0,1,0,16Zm128,48H168a8,8,0,0,0,0,16h28.69l-14.63,14.63a79.56,79.56,0,0,1-56.13,23.43h-.45a79.52,79.52,0,0,1-55.89-22.77,8,8,0,1,0-11.18,11.44,95.36,95.36,0,0,0,67.07,27.33H126a95.43,95.43,0,0,0,67.36-28.12L208,179.31V208a8,8,0,0,0,16,0V160A8,8,0,0,0,216,152Z"/>
          </svg>
          <p>Sincronizando la bóveda</p>
        </div>

        <ng-container *ngIf="!isLoading">
          <!-- INLINE CREATE ROW -->
          <div class="tree-row inline-create-row" *ngIf="isCreatingTheme">
          <div class="row-left">
            <svg class="chevron-svg" style="opacity:0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"></svg>
            <svg class="folder-svg" [style.color]="newThemeColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path d="M216,72H131.31L104,44.69A15.86,15.86,0,0,0,92.69,40H40A16,16,0,0,0,24,56V200.62A15.4,15.4,0,0,0,39.38,216H216.89A15.13,15.13,0,0,0,232,200.89V88A16,16,0,0,0,216,72ZM40,56H92.69l16,16H40ZM216,200H40V88H216Z"/>
            </svg>
            <input type="text" [(ngModel)]="newThemeName" placeholder="Nuevo tema...." class="inline-input" (keydown.enter)="confirmCreatingTheme()" (keydown.escape)="cancelCreatingTheme()" #themeInput autofocus>
          </div>
          <div class="row-right action-icons">
            <div class="swatch-picker-wrap">
              <button class="inline-btn brush-btn" (click)="toggleSwatchPicker('create')" title="Elegir Color">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="inline-icon picker-icon"><path d="M224,67.3a35.79,35.79,0,0,0-11.26-25.66c-14-13.28-36.72-12.78-50.62,1.13L142.8,62.2a24,24,0,0,0-33.14.77l-9,9a16,16,0,0,0,0,22.64l2,2.06-51,51a39.75,39.75,0,0,0-10.53,38l-8,18.41A13.65,13.65,0,0,0,36,219.29a15.9,15.9,0,0,0,17.71,3.36L71.24,215a39.9,39.9,0,0,0,37.05-10.75l51-51,2.06,2.06a16,16,0,0,0,22.62,0l9-9a24,24,0,0,0,.74-33.18l19.75-19.87A35.75,35.75,0,0,0,224,67.3ZM97,193a24,24,0,0,1-24,6,8,8,0,0,0-5.55.31l-18.1,7.9L57,189.41a8,8,0,0,0,.25-5.75,24,24,0,0,1,.1-15.69H122Zm41-41H70.07l44-44,33.94,34Zm64.18-70-25.37,25.52a8,8,0,0,0,0,11.31l4.89,4.88a8,8,0,0,1,0,11.32l-9,9L112,83.26l9-9a8,8,0,0,1,11.31,0l4.89,4.89a8,8,0,0,0,5.65,2.34h0a8,8,0,0,0,5.66-2.36l24.94-25.09c7.81-7.82,20.5-8.18,28.29-.81a20,20,0,0,1,.39,28.7Z"></path></svg>
              </button>
              
              <div class="swatch-popover card-glass" *ngIf="showSwatchPicker === 'create'">
                <div class="palette-grid">
                  <div *ngFor="let color of COLOR_PALETTE" 
                       class="swatch-item" 
                       [style.background]="color"
                       [class.swatch-active]="newThemeColor === color"
                       (click)="selectColor(color, 'create')">
                  </div>
                </div>
              </div>
            </div>
            <button class="inline-btn confirm-btn" (click)="confirmCreatingTheme()" title="Guardar"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="inline-icon"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg></button>
            <button class="inline-btn cancel-btn" (click)="cancelCreatingTheme()" title="Cancelar"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="inline-icon"><path d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg></button>
          </div>
        </div>

        <ng-container *ngFor="let folder of filteredFolders">
          
          <!-- INLINE EDIT ROW -->
          <div class="tree-row inline-create-row" *ngIf="editingThemeId === folder.folder_id">
            <div class="row-left">
              <svg class="chevron-svg" style="opacity:0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"></svg>
              <svg class="folder-svg" [style.color]="editThemeColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                <path d="M216,72H131.31L104,44.69A15.86,15.86,0,0,0,92.69,40H40A16,16,0,0,0,24,56V200.62A15.4,15.4,0,0,0,39.38,216H216.89A15.13,15.13,0,0,0,232,200.89V88A16,16,0,0,0,216,72ZM40,56H92.69l16,16H40ZM216,200H40V88H216Z"/>
              </svg>
              <input type="text" [(ngModel)]="editThemeName" placeholder="Editando tema...." class="inline-input" (keydown.enter)="confirmEditingTheme(folder)" (keydown.escape)="cancelEditingTheme()" autofocus>
            </div>
            <div class="row-right action-icons">
              <div class="swatch-picker-wrap">
                <button class="inline-btn brush-btn" (click)="toggleSwatchPicker('edit')" title="Elegir Color">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="inline-icon picker-icon"><path d="M224,67.3a35.79,35.79,0,0,0-11.26-25.66c-14-13.28-36.72-12.78-50.62,1.13L142.8,62.2a24,24,0,0,0-33.14.77l-9,9a16,16,0,0,0,0,22.64l2,2.06-51,51a39.75,39.75,0,0,0-10.53,38l-8,18.41A13.65,13.65,0,0,0,36,219.29a15.9,15.9,0,0,0,17.71,3.36L71.24,215a39.9,39.9,0,0,0,37.05-10.75l51-51,2.06,2.06a16,16,0,0,0,22.62,0l9-9a24,24,0,0,0,.74-33.18l19.75-19.87A35.75,35.75,0,0,0,224,67.3ZM97,193a24,24,0,0,1-24,6,8,8,0,0,0-5.55.31l-18.1,7.9L57,189.41a8,8,0,0,0,.25-5.75,24,24,0,0,1,.1-15.69H122Zm41-41H70.07l44-44,33.94,34Zm64.18-70-25.37,25.52a8,8,0,0,0,0,11.31l4.89,4.88a8,8,0,0,1,0,11.32l-9,9L112,83.26l9-9a8,8,0,0,1,11.31,0l4.89,4.89a8,8,0,0,0,5.65,2.34h0a8,8,0,0,0,5.66-2.36l24.94-25.09c7.81-7.82,20.5-8.18,28.29-.81a20,20,0,0,1,.39,28.7Z"></path></svg>
                </button>
                
                <div class="swatch-popover card-glass animate-pop-in" *ngIf="showSwatchPicker === 'edit'">
                  <div class="palette-grid">
                    <div *ngFor="let color of COLOR_PALETTE" 
                         class="swatch-item" 
                         [style.background]="color"
                         [class.swatch-active]="editThemeColor === color"
                         (click)="selectColor(color, 'edit')">
                    </div>
                  </div>
                </div>
              </div>
              <button class="inline-btn confirm-btn" (click)="confirmEditingTheme(folder)" title="Actualizar"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="inline-icon"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg></button>
              <button class="inline-btn cancel-btn" (click)="cancelEditingTheme()" title="Cancelar"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="inline-icon"><path d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg></button>
            </div>
          </div>

          <!-- THEME ROW -->
          <div class="tree-row theme-row"
               *ngIf="editingThemeId !== folder.folder_id"
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
                <button class="ctx-item ctx-delete" (click)="onDeleteTheme.emit(folder); menuOpenId = null" title="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/>
                  </svg>
                </button>
                <button class="ctx-item ctx-edit" (click)="startEditingTheme(folder); menuOpenId = null" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                    <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120Zm96-96L147.31,64l24-24L216,84.68Z"/>
                  </svg>
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
                  <button class="ctx-item ctx-delete" (click)="onDeleteQuiz.emit(quiz); menuOpenId = null" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                      <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/>
                    </svg>
                  </button>
                  <button class="ctx-item ctx-edit" (click)="onEditQuiz.emit(quiz); menuOpenId = null" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                      <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120Zm96-96L147.31,64l24-24L216,84.68Z"/>
                    </svg>
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
        </ng-container>

        <!-- GLOBAL EMPTY -->
        <div class="global-empty" *ngIf="!isLoading && filteredFolders.length === 0">
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
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    /* ═══════════════════════════════════════ COLOR SWATCHES */
    .swatch-picker-wrap {
      position: relative;
    }

    .swatch-popover {
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      z-index: 200;
      background: var(--theme-surface-modal);
      backdrop-filter: blur(20px);
      border: 1px solid var(--theme-border);
      border-radius: 14px;
      padding: 0.8rem;
      width: 156px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
    }

    .palette-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.4rem;
    }

    .swatch-item {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28);
      border: 2px solid transparent;
      box-sizing: border-box;
    }

    .swatch-item:hover {
      transform: scale(1.3);
      z-index: 10;
    }

    .swatch-active {
      border-color: #fff;
      box-shadow: 0 0 12px rgba(255,255,255,0.4);
      transform: scale(1.15);
    }

    .animate-pop-in {
      animation: popIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28) both;
    }

    @keyframes popIn {
      from { opacity: 0; transform: translateY(-10px) scale(0.9); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .brush-btn {
      padding: 0.4rem;
      border-radius: 8px;
    }
    
    .brush-btn:hover {
      background: rgba(255,255,255,0.05);
      color: var(--theme-brand-neon);
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

    /* ═══════════════════════════════════════ INLINE CREATE UI */
    .inline-create-row {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      margin: 4px 12px;
      padding: 0.4rem 0.8rem;
    }

    .inline-input {
      background: transparent;
      border: none;
      color: var(--theme-text);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.83rem;
      outline: none;
      width: 100%;
      min-width: 100px;
    }

    .inline-input::placeholder {
      color: var(--theme-text-muted);
      opacity: 0.5;
    }

    .action-icons {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .icon-label-picker {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .icon-label-picker:hover {
      opacity: 1;
    }

    .hidden-picker {
      position: absolute;
      width: 0;
      height: 0;
      visibility: hidden;
    }

    .inline-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.6;
      color: var(--theme-text);
      transition: opacity 0.2s, color 0.2s;
    }

    .inline-btn:hover {
      opacity: 1;
    }

    .confirm-btn:hover {
      color: var(--theme-brand-neon);
    }

    .cancel-btn:hover {
      color: #ff6b6b;
    }

    .inline-icon {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }

    .picker-icon {
      width: 17px;
      height: 17px;
    }

    /* ═══════════════════════════════════════ CONTEXT MENU */
    .ctx-menu {
      position: absolute;
      right: 0;
      top: calc(100% + 2px);
      z-index: 200;
      background: var(--theme-surface-solid);
      border: 1px solid var(--theme-border);
      border-radius: 6px;
      padding: 4px;
      display: flex;
      gap: 4px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      animation: ctx-pop 0.15s ease-out;
    }

    .ctx-item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--theme-text-muted);
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.15s, color 0.15s;
    }

    .ctx-item svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
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

    /* ═══════════════════════════════════════ COLLAPSED STATE */
    .v-sidebar.collapsed {
      width: 0;
      border-right-width: 0;
      opacity: 0;
      pointer-events: none;
    }
    
    .v-sidebar.collapsed * {
      display: none;
    }

    .v-sidebar.collapsed .v-header {
      padding: 1.5rem 0;
      display: flex;
      justify-content: center;
    }

    .v-sidebar.collapsed .h-top {
      margin: 0;
      justify-content: center;
      width: 100%;
    }

    /* ═══════════════════════════════════════ LOADING */
    .global-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 1.5rem;
      opacity: 0.6;
    }
    .loading-icon {
      width: 32px;
      height: 32px;
      fill: var(--theme-brand-neon);
      margin-bottom: 1rem;
      animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    .global-loading p {
      font-size: 0.75rem;
      color: var(--theme-text-muted);
      margin: 0;
      font-weight: 800;
      letter-spacing: 1px;
    }
    .spinning {
      animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

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
export class VaultSidebarComponent implements OnInit {
  @Input() folders: FolderTheme[] = [];
  @Input() quizzesByFolder: { [key: string]: QuizSession[] } = {};
  @Input() activeThemeId: string | null = null;
  @Input() activeQuizId: string | null = null;
  @Input() isLoading = false;

  @Output() onSelectTheme = new EventEmitter<FolderTheme>();
  @Output() onSelectQuiz = new EventEmitter<QuizSession>();
  @Output() onRefresh = new EventEmitter<void>();
  @Output() onNewTheme = new EventEmitter<void>();
  @Output() onCreateTheme = new EventEmitter<{nombre_tema: string, color_tag: string}>();
  @Output() onUpdateTheme = new EventEmitter<FolderTheme>();
  @Output() onDeleteTheme = new EventEmitter<FolderTheme>();
  @Output() onEditQuiz = new EventEmitter<QuizSession>();
  @Output() onDeleteQuiz = new EventEmitter<QuizSession>();

  expandedFolders = new Set<string>();
  showSearch = false;
  searchTerm = '';
  menuOpenId: string | null = null;
  @Input() isCollapsed = false;
  @Output() onToggleCollapse = new EventEmitter<void>();

  ngOnInit() {}

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

  isCreatingTheme = false;
  newThemeName = '';
  newThemeColor = '#9FFF22';

  startCreatingTheme() {
    this.isCreatingTheme = true;
    this.newThemeName = '';
    this.newThemeColor = '#9FFF22';
  }

  cancelCreatingTheme() {
    this.isCreatingTheme = false;
  }

  confirmCreatingTheme() {
    if (this.newThemeName.trim()) {
      this.onCreateTheme.emit({
        nombre_tema: this.newThemeName.trim(),
        color_tag: this.newThemeColor
      });
      this.isCreatingTheme = false;
    }
  }

  readonly COLOR_PALETTE = [
    '#9FFF22', // Brand Neon
    '#22D3EE', // Cyan
    '#A855F7', // Purple
    '#F43F5E', // Rose
    '#EA580C', // Orange
    '#10B981', // Emerald
    '#4B105A', // Deep Purple
    '#005C6E', // Dark Teal
    '#3F9098', // Muted Teal
    '#B7D98C'  // Soft Sage
  ];

  showSwatchPicker: 'create' | 'edit' | null = null;

  toggleSwatchPicker(type: 'create' | 'edit') {
    this.showSwatchPicker = this.showSwatchPicker === type ? null : type;
  }

  selectColor(color: string, type: 'create' | 'edit') {
    if (type === 'create') this.newThemeColor = color;
    else this.editThemeColor = color;
    this.showSwatchPicker = null;
  }

  editingThemeId: string | null = null;
  editThemeName = '';
  editThemeColor = '';

  startEditingTheme(folder: FolderTheme) {
    this.editingThemeId = folder.folder_id;
    this.editThemeName = folder.nombre_tema;
    this.editThemeColor = folder.color_tag;
  }

  cancelEditingTheme() {
    this.editingThemeId = null;
  }

  confirmEditingTheme(folder: FolderTheme) {
    if (this.editThemeName.trim()) {
      this.onUpdateTheme.emit({
        ...folder,
        nombre_tema: this.editThemeName.trim(),
        color_tag: this.editThemeColor
      });
      this.editingThemeId = null;
    }
  }
}
