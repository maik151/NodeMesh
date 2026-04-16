import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { FolderTheme, NodeChallenge, QuizSession, DifficultyLevel } from '../../../../core/models/node.model';
import { MOTOR_ICONS, TYPE_ICONS } from '../../../../shared/constants/icons.constants';
import { LEVEL_FACES } from '../../../../shared/constants/faces.constants';
import { QuizEditModalComponent } from '../quiz-edit-modal/quiz-edit-modal.component';
import { NodeEditModalComponent } from '../node-edit-modal/node-edit-modal.component';

const TIPO_MAP: Record<string, { label: string }> = {
  single_choice:    { label: 'Selección Única' },
  multi_choice:     { label: 'Selección Múltiple' },
  cloze_deletion:   { label: 'Completar Espacios' },
  output_prediction:{ label: 'Predicción de Salida' },
  ordering:         { label: 'Ordenamiento Lógico' },
  anomaly_detection:{ label: 'Detección de Anomalías' },
  optimization:     { label: 'Optimización de Código' },
  case_analysis:    { label: 'Análisis de Casos' },
  feynman_synthesis:{ label: 'Síntesis de Feynman' },
};

@Component({
  selector: 'app-quiz-preview',
  standalone: true,
  imports: [CommonModule, QuizEditModalComponent, NodeEditModalComponent],
  template: `
    <div class="qp-shell" *ngIf="quiz && folder">

      <!-- BREADCRUMB -->
      <div class="breadcrumb">
        <!-- Sidebar Toggle (Only visible when collapsed) -->
        <button 
          *ngIf="isSidebarCollapsed" 
          class="bc-toggle-btn" 
          (click)="onToggleSidebar.emit()"
          title="Mostrar Sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
            <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,152H56a8,8,0,0,0,0-16H40V120H56a8,8,0,0,0,0-16H40V88H56a8,8,0,0,0,0-16H40V56H80V200H40Zm176,48H96V56H216V200Z"></path>
          </svg>
        </button>

        <svg class="breadcrumb-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M216,72H131.31L104,44.69A15.86,15.86,0,0,0,92.69,40H40A16,16,0,0,0,24,56V200.62A15.4,15.4,0,0,0,39.38,216H216.89A15.13,15.13,0,0,0,232,200.89V88A16,16,0,0,0,216,72ZM40,56H92.69l16,16H40ZM216,200H40V88H216Z"/></svg>
        <span class="bc-folder">{{ folder.nombre_tema }}</span>
        <span class="bc-sep">›</span>
        <svg class="breadcrumb-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M216,40H40A16,16,0,0,0,24,56V216a8,8,0,0,0,11.58,7.16L64,208.94l28.42,14.22a8,8,0,0,0,7.16,0L128,208.94l28.42,14.22a8,8,0,0,0,7.16,0L192,208.94l28.42,14.22A8,8,0,0,0,232,216V56A16,16,0,0,0,216,40Zm0,163.06-20.42-10.22a8,8,0,0,0-7.16,0L160,207.06l-28.42-14.22a8,8,0,0,0-7.16,0L96,207.06,67.58,192.84a8,8,0,0,0-7.16,0L40,203.06V56H216ZM60.42,167.16a8,8,0,0,0,10.74-3.58L76.94,152h38.12l5.78,11.58a8,8,0,1,0,14.32-7.16l-32-64a8,8,0,0,0-14.32,0l-32,64A8,8,0,0,0,60.42,167.16ZM96,113.89,107.06,136H84.94ZM136,128a8,8,0,0,1,8-8h16V104a8,8,0,0,1,16,0v16h16a8,8,0,0,1,0,16H176v16a8,8,0,0,1-16,0V136H144A8,8,0,0,1,136,128Z"/></svg>
        <span class="bc-quiz">{{ quiz.titulo_quiz }}</span>
      </div>

      <!-- MAIN HEADER -->
      <div class="qp-header">
        <div class="qp-title-row">
          <svg class="title-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M216,40H40A16,16,0,0,0,24,56V216a8,8,0,0,0,11.58,7.16L64,208.94l28.42,14.22a8,8,0,0,0,7.16,0L128,208.94l28.42,14.22a8,8,0,0,0,7.16,0L192,208.94l28.42,14.22A8,8,0,0,0,232,216V56A16,16,0,0,0,216,40Zm0,163.06-20.42-10.22a8,8,0,0,0-7.16,0L160,207.06l-28.42-14.22a8,8,0,0,0-7.16,0L96,207.06,67.58,192.84a8,8,0,0,0-7.16,0L40,203.06V56H216ZM60.42,167.16a8,8,0,0,0,10.74-3.58L76.94,152h38.12l5.78,11.58a8,8,0,1,0,14.32-7.16l-32-64a8,8,0,0,0-14.32,0l-32,64A8,8,0,0,0,60.42,167.16ZM96,113.89,107.06,136H84.94ZM136,128a8,8,0,0,1,8-8h16V104a8,8,0,0,1,16,0v16h16a8,8,0,0,1,0,16H176v16a8,8,0,0,1-16,0V136H144A8,8,0,0,1,136,128Z"/></svg>
          <h1 class="qp-title">{{ quiz.titulo_quiz }}</h1>
        </div>
        <div class="qp-actions">
          <button class="btn-edit" (click)="showEditModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120Zm96-96L147.31,64l24-24L216,84.68Z"/></svg>
            Editar
          </button>
          <button class="btn-play" (click)="onPlayQuiz.emit(quiz)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48.24-94.78-64-40A8,8,0,0,0,100,88v80a8,8,0,0,0,12.24,6.78l64-40a8,8,0,0,0,0-13.56ZM116,153.57V102.43L156.91,128Z"/></svg>
            Repasar
          </button>
        </div>
      </div>

      <!-- KPI CARDS -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path [attr.d]="MOTOR_ICONS.ia"/>
            </svg>
          </div>
          <div class="kpi-value">{{ retentionPercent }}%</div>
          <div class="kpi-label">Retención</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M200,152a31.84,31.84,0,0,0-19.53,6.68l-23.11-18A31.65,31.65,0,0,0,160,128c0-.74,0-1.48-.08-2.21l13.23-4.41A32,32,0,1,0,168,104c0,.74,0,1.48.08,2.21l-13.23,4.41A32,32,0,0,0,128,96a32.59,32.59,0,0,0-5.27.44L115.89,81A32,32,0,1,0,96,88a32.59,32.59,0,0,0,5.27-.44l6.84,15.4a31.92,31.92,0,0,0-8.57,39.64L73.83,165.44a32.06,32.06,0,1,0,10.63,12l25.71-22.84a31.91,31.91,0,0,0,37.36-1.24l23.11,18A31.65,31.65,0,0,0,168,184a32,32,0,1,0,32-32Zm0-64a16,16,0,1,1-16,16A16,16,0,0,1,200,88ZM80,56A16,16,0,1,1,96,72,16,16,0,0,1,80,56ZM56,208a16,16,0,1,1,16-16A16,16,0,0,1,56,208Zm56-80a16,16,0,1,1,16,16A16,16,0,0,1,112,128Zm88,72a16,16,0,1,1,16-16A16,16,0,0,1,200,200Z"/></svg>
          </div>
          <div class="kpi-value">{{ iaNodesCount }}<span style="font-size:1rem;opacity:0.5;">/{{ nodes.length }}</span></div>
          <div class="kpi-label">Nodos IA</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88v64a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm59.16,30.45L152,176h16a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136,23.76,23.76,0,0,1,171.16,150.45Z"/></svg>
          </div>
          <div class="kpi-value">{{ lastReviewLabel }}</div>
          <div class="kpi-label">Último Repaso</div>
        </div>
      </div>

      <!-- SEPARATOR -->
      <div class="qp-separator"></div>

      <!-- INVENTORY SECTION -->
      <div class="inventory-section">
        <div class="inventory-header">
          <div class="inventory-title-row">
            <svg class="inv-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M184,40H72A56.06,56.06,0,0,0,16,96v96a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V96A56.06,56.06,0,0,0,184,40Zm40,56v8H192V56.8A40.07,40.07,0,0,1,224,96Zm-88,40H120V104h16Zm-24,16h32a8,8,0,0,0,8-8V120h24v72H80V120h24v24A8,8,0,0,0,112,152Zm40-48V96a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v8H80V56h96v48ZM64,56.8V104H32V96A40.07,40.07,0,0,1,64,56.8ZM32,120H64v72H32Zm192,72H192V120h32v72Z"/></svg>
            <h3 class="inventory-title">Inventario de Nodos [{{ nodes.length }}]</h3>
          </div>
          <div class="inventory-badges">
            <div class="badge-auditor" *ngIf="auditorPersona">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M221.69,199.77,160,96.92V40h8a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16h8V96.92L34.31,199.77A16,16,0,0,0,48,224H208a16,16,0,0,0,13.72-24.23ZM110.86,103.25A7.93,7.93,0,0,0,112,99.14V40h32V99.14a7.93,7.93,0,0,0,1.14,4.11L183.36,167c-12,2.37-29.07,1.37-51.75-10.11-15.91-8.05-31.05-12.32-45.22-12.81ZM48,208l28.54-47.58c14.25-1.74,30.31,1.85,47.82,10.72,19,9.61,35,12.88,48,12.88a69.89,69.89,0,0,0,19.55-2.7L208,208Z"/></svg>
              Auditor: {{ auditorPersona }}
            </div>
            <div class="badge-nivel" [class]="nivelClass">
              <span class="nivel-face" [innerHTML]="getNivelFaceSvg()"></span>
              Nivel: {{ quiz.dificultad_global }}
            </div>
          </div>
        </div>

        <div class="node-loading" *ngIf="isLoadingNodes">
          <svg class="spin-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M88,104H40a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V76.69L62.63,62.06A95.43,95.43,0,0,1,130,33.94h.53a95.36,95.36,0,0,1,67.07,27.33,8,8,0,0,1-11.18,11.44,79.52,79.52,0,0,0-55.89-22.77h-.45A79.56,79.56,0,0,0,73.94,73.37L59.31,88H88a8,8,0,0,1,0,16Zm128,48H168a8,8,0,0,0,0,16h28.69l-14.63,14.63a79.56,79.56,0,0,1-56.13,23.43h-.45a79.52,79.52,0,0,1-55.89-22.77,8,8,0,1,0-11.18,11.44,95.36,95.36,0,0,0,67.07,27.33H126a95.43,95.43,0,0,0,67.36-28.12L208,179.31V208a8,8,0,0,0,16,0V160A8,8,0,0,0,216,152Z"/></svg>
          <span>Cargando nodos...</span>
        </div>

        <!-- NODE TABLE -->
        <div class="node-table-wrap" *ngIf="!isLoadingNodes">
          <table class="node-table">
            <thead>
              <tr>
                <th class="col-tipo">Tipo</th>
                <th class="col-pregunta">Pregunta</th>
                <th class="col-motor">Motor</th>
                <th class="col-memoria">Memoria</th>
                <th class="col-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let node of paginatedNodes; let i = index" class="node-row" [class.row-even]="i % 2 === 0">
                <td class="col-tipo">
                  <div class="tipo-chip">
                    <svg class="tipo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                      <path [attr.d]="getSafeIcon(node.tipo_reto)"/>
                    </svg>
                    <span class="tipo-label">{{ getTipoLabel(node.tipo_reto) }}</span>
                  </div>
                </td>
                <td class="col-pregunta">
                  <span class="pregunta-text" [title]="node.pregunta">{{ truncate(node.pregunta) }}</span>
                </td>
                <td class="col-motor">
                  <div class="motor-chip" [class.motor-ia]="node.requiere_ia">
                    <svg *ngIf="node.requiere_ia" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                      <path [attr.d]="MOTOR_ICONS.ia"/>
                    </svg>
                    <svg *ngIf="!node.requiere_ia" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                      <path [attr.d]="MOTOR_ICONS.local"/>
                    </svg>
                    <span>{{ node.requiere_ia ? 'IA' : 'Local' }}</span>
                  </div>
                </td>
                <td class="col-memoria">
                  <div class="memoria-chip" [class]="getMemoriaClass(node)">
                    <span class="mem-dot"></span>
                    <span>{{ getMemoriaLabel(node) }}</span>
                  </div>
                </td>
                <td class="col-acciones">
                  <div class="action-btns">
                    <button class="action-btn delete-btn" (click)="onDeleteNode.emit(node)" title="Eliminar nodo">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/></svg>
                    </button>
                    <button class="action-btn edit-btn" (click)="selectedNode = node" title="Editar nodo">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120Zm96-96L147.31,64l24-24L216,84.68Z"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="nodes.length === 0 && !isLoadingNodes">
                <td colspan="5" class="empty-table-row">
                  Este test aún no tiene nodos cargados.
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- PAGINATION -->
          <div class="table-pagination" *ngIf="nodes.length > pageSize">
            <button class="pag-btn" [disabled]="currentPage === 0" (click)="currentPage = currentPage - 1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path></svg>
              Anterior
            </button>
            <span class="pag-info">Página {{ currentPage + 1 }} de {{ totalPages }}</span>
            <button class="pag-btn" [disabled]="isLastPage" (click)="currentPage = currentPage + 1">
              Siguiente
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- EDIT MODAL -->
      <app-quiz-edit-modal 
        *ngIf="showEditModal && quiz" 
        [quiz]="quiz" 
        (onClose)="showEditModal = false"
        (onSave)="handleUpdateQuiz($event)">
      </app-quiz-edit-modal>

      <!-- NODE EDIT MODAL -->
      <app-node-edit-modal 
        *ngIf="selectedNode" 
        [node]="selectedNode" 
        (onClose)="selectedNode = null"
        (onSave)="handleUpdateNode($event)">
      </app-node-edit-modal>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'JetBrains Mono', monospace; }

    /* SHELL */
    .qp-shell {
      padding: 2.5rem 3rem;
      height: 100%;
      animation: fadeSlideIn 0.4s cubic-bezier(0.2,0,0,1) both;
      color: var(--theme-text);
    }
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* BREADCRUMB */
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      opacity: 0.45;
      margin-bottom: 1.5rem;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    .breadcrumb-icon { width: 14px; height: 14px; fill: currentColor; }
    .bc-sep { opacity: 0.4; }
    .bc-folder, .bc-quiz { opacity: 0.9; }
    .bc-quiz { opacity: 1; color: var(--theme-text); }

    .bc-toggle-btn {
      background: transparent;
      border: none;
      padding: 4px;
      margin-right: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      cursor: pointer;
      color: var(--theme-text-muted);
      transition: all 0.2s;
    }
    .bc-toggle-btn:hover {
      background: rgba(255,255,255,0.08);
      color: var(--theme-brand-neon);
    }
    .bc-toggle-btn svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }

    /* HEADER */
    .qp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }
    .qp-title-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .title-icon {
      width: 38px; height: 38px;
      fill: var(--theme-text);
      opacity: 0.85;
      flex-shrink: 0;
    }
    .qp-title {
      font-size: 2rem;
      font-weight: 900;
      margin: 0;
      letter-spacing: -0.03em;
      color: var(--theme-text);
      line-height: 1.1;
    }
    .qp-actions {
      display: flex;
      gap: 0.75rem;
      flex-shrink: 0;
    }
    .btn-edit {
      display: flex; align-items: center; gap: 0.5rem;
      background: transparent;
      border: 1px solid var(--theme-border);
      color: var(--theme-text-secondary);
      padding: 0.6rem 1.2rem;
      border-radius: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-edit svg { width: 16px; height: 16px; fill: currentColor; }
    .btn-edit:hover { background: rgba(255,255,255,0.05); color: var(--theme-text); border-color: rgba(255,255,255,0.2); }

    .btn-play {
      display: flex; align-items: center; gap: 0.6rem;
      background: var(--theme-brand-neon);
      border: none;
      color: var(--theme-brand-btn-text, #0a1a00);
      padding: 0.6rem 1.4rem;
      border-radius: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      font-weight: 900;
      cursor: pointer;
      transition: all 0.25s;
      letter-spacing: 0.01em;
    }
    .btn-play svg { width: 18px; height: 18px; fill: currentColor; }
    .btn-play:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(159,255,34,0.35); }

    /* KPI */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 2.5rem;
    }
    .kpi-card {
      background: var(--theme-surface-elevated, rgba(255,255,255,0.03));
      border: 1px solid var(--theme-border);
      border-radius: 18px;
      padding: 1.5rem 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
      position: relative;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .kpi-card:hover { border-color: rgba(255,255,255,0.15); }
    .kpi-icon-wrap {
      width: 26px; height: 26px;
      opacity: 0.6;
      margin-bottom: 0.75rem;
      color: var(--theme-text);
    }
    .kpi-icon-wrap svg { width: 100%; height: 100%; fill: currentColor; }
    .kpi-value {
      font-size: 2.5rem;
      font-weight: 900;
      color: var(--theme-text);
      line-height: 1;
      letter-spacing: -0.04em;
    }
    .kpi-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--theme-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 0.25rem;
    }

    /* SEPARATOR */
    .qp-separator {
      border: none;
      border-top: 1px dashed var(--theme-border);
      margin-bottom: 2rem;
      opacity: 0.5;
    }

    /* INVENTORY */
    .inventory-section { }
    .inventory-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .inventory-title-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .inv-icon { width: 22px; height: 22px; fill: var(--theme-text); opacity: 0.7; }
    .inventory-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
      color: var(--theme-text);
      letter-spacing: 0.02em;
    }
    .inventory-badges {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .badge-auditor, .badge-nivel {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.35rem 0.75rem;
      border-radius: 100px;
      letter-spacing: 0.04em;
      font-family: 'JetBrains Mono', monospace;
    }
    .badge-auditor svg { width: 13px; height: 13px; fill: currentColor; }
    .badge-auditor {
      background: rgba(88, 160, 227, 0.12);
      border: 1px solid rgba(88, 160, 227, 0.3);
      color: #77bbff;
    }

    /* Nivel badges with face */
    .nivel-face { 
      width: 20px; 
      height: 20px; 
      display: flex; 
      align-items: center; 
      justify-content: center;
    }
    .nivel-face ::ng-deep svg {
      width: 100%;
      height: 100%;
    }
    .badge-nivel.nivel-aprendiz {
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ade80;
    }
    .badge-nivel.nivel-intermedio {
      background: rgba(234, 179, 8, 0.12);
      border: 1px solid rgba(234, 179, 8, 0.3);
      color: #facc15;
    }
    .badge-nivel.nivel-avanzado {
      background: rgba(249, 115, 22, 0.12);
      border: 1px solid rgba(249, 115, 22, 0.3);
      color: #fb923c;
    }
    .badge-nivel.nivel-senior {
      background: rgba(168, 85, 247, 0.12);
      border: 1px solid rgba(168, 85, 247, 0.3);
      color: #c084fc;
    }

    /* LOADING */
    .node-loading {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 2rem; justify-content: center;
      opacity: 0.5;
      font-size: 0.85rem;
    }
    .spin-icon { width: 20px; height: 20px; fill: var(--theme-brand-neon); animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    /* TABLE */
    .node-table-wrap {
      background: var(--theme-surface-elevated, rgba(255,255,255,0.02));
      border: 1px solid var(--theme-border);
      border-radius: 16px;
      overflow: hidden;
    }
    .node-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
    }
    .node-table thead tr {
      border-bottom: 1px solid var(--theme-border);
    }
    .node-table th {
      padding: 0.85rem 1rem;
      text-align: left;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--theme-text-muted);
      opacity: 0.6;
    }
    .node-row {
      border-bottom: 1px solid rgba(255,255,255,0.035);
      transition: background 0.15s;
    }
    .node-row:last-child { border-bottom: none; }
    .node-row:hover { background: rgba(255,255,255,0.025); }
    .node-row.row-even { background: rgba(255,255,255,0.01); }
    .node-table td { padding: 0.85rem 1rem; vertical-align: middle; }

    /* TIPO CHIP */
    .col-tipo { white-space: nowrap; }
    .tipo-chip {
      display: flex; align-items: center; gap: 0.6rem;
      font-weight: 700;
    }
    .tipo-icon {
      width: 20px;
      height: 20px;
      fill: var(--theme-text);
      opacity: 0.9;
      flex-shrink: 0;
    }
    .tipo-label { font-size: 0.78rem; color: var(--theme-text-secondary); white-space: nowrap; opacity: 0.9; }

    /* PREGUNTA */
    .col-pregunta { max-width: 340px; }
    .pregunta-text {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      color: var(--theme-text);
      opacity: 0.85;
      cursor: default;
      line-height: 1.4;
    }

    /* MOTOR */
    .col-motor { white-space: nowrap; }
    .motor-chip {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 800;
      background: rgba(159,255,34,0.08);
      border: 1px solid rgba(159,255,34,0.2);
      color: var(--theme-brand-neon);
    }
    .motor-chip svg { width: 13px; height: 13px; fill: currentColor; }
    .motor-ia {
      background: rgba(168,85,247,0.1);
      border-color: rgba(168,85,247,0.3);
      color: #c084fc;
    }

    /* MEMORIA */
    .col-memoria { white-space: nowrap; }
    .memoria-chip {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 800;
    }
    .mem-dot {
      width: 8px; height: 8px; border-radius: 50%;
    }
    .memoria-alta {
      background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); color: #4ade80;
    }
    .memoria-alta .mem-dot { background: #4ade80; }
    .memoria-media {
      background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.25); color: #facc15;
    }
    .memoria-media .mem-dot { background: #facc15; }
    .memoria-baja {
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #f87171;
    }
    .memoria-baja .mem-dot { background: #f87171; }

    /* ACCIONES */
    .col-acciones { white-space: nowrap; }
    .action-btns { display: flex; gap: 0.35rem; align-items: center; }
    .action-btn {
      width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 7px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .action-btn svg { width: 15px; height: 15px; }
    .delete-btn svg { fill: var(--theme-text-muted); }
    .delete-btn:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.3); }
    .delete-btn:hover svg { fill: #f87171; }
    .edit-btn svg { fill: var(--theme-text-muted); }
    .edit-btn:hover { background: rgba(159,255,34,0.08); border-color: rgba(159,255,34,0.2); }
    .edit-btn:hover svg { fill: var(--theme-brand-neon); }

    /* EMPTY */
    .empty-table-row { text-align: center; padding: 3rem; opacity: 0.35; font-style: italic; }

    /* LIGHT MODE OVERRIDES */
    :host-context([data-theme="light"]) .qp-shell { color: #1a1a2e; }
    :host-context([data-theme="light"]) .kpi-card { background: #fff; border-color: #e2e8f0; }
    :host-context([data-theme="light"]) .kpi-card:hover { border-color: #cbd5e1; }
    :host-context([data-theme="light"]) .kpi-icon-wrap svg { fill: #64748b; }
    :host-context([data-theme="light"]) .node-table-wrap { background: #fff; border-color: #e2e8f0; }
    :host-context([data-theme="light"]) .node-row:hover { background: #f8fafc; }
    :host-context([data-theme="light"]) .node-row.row-even { background: #fafafa; }
    :host-context([data-theme="light"]) .node-table thead tr { border-bottom-color: #e2e8f0; }
    :host-context([data-theme="light"]) .node-row { border-bottom-color: #f1f5f9; }
    :host-context([data-theme="light"]) .motor-chip { background: #f0fce8; border-color: #c2e5a0; color: #3a7d0a; }
    :host-context([data-theme="light"]) .motor-ia { background: #faf5ff; border-color: #d8b4fe; color: #7c3aed; }
    :host-context([data-theme="light"]) .btn-edit { border-color: #e2e8f0; color: #5a6272; }
    :host-context([data-theme="light"]) .btn-edit:hover { background: #f8fafc; color: #1a1a2e; border-color: #cbd5e1; }

    .table-pagination {
      margin-top: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
    }
    .pag-btn {
      background: var(--theme-input-bg);
      border: 1px solid var(--theme-border);
      color: var(--theme-text);
      padding: 0.4rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pag-btn:hover:not(:disabled) { background: rgba(128,128,128,0.1); border-color: var(--theme-text-muted); }
    .pag-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .pag-info { color: var(--theme-text-muted); }
  `]
})
export class QuizPreviewComponent implements OnChanges {
  protected readonly MOTOR_ICONS = MOTOR_ICONS;
  protected readonly TYPE_ICONS = TYPE_ICONS;
  private readonly db = inject(DatabaseService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly sanitizer = inject(DomSanitizer);

  @Input() quiz: QuizSession | null = null;
  @Input() folder: FolderTheme | null = null;
  @Input() isSidebarCollapsed = false;

  @Output() onPlayQuiz = new EventEmitter<QuizSession>();
  @Output() onQuizUpdated = new EventEmitter<QuizSession>();
  @Output() onDeleteNode = new EventEmitter<NodeChallenge>();
  @Output() onToggleSidebar = new EventEmitter<void>();

  nodes: NodeChallenge[] = [];
  isLoadingNodes = false;
  showEditModal = false;
  selectedNode: NodeChallenge | null = null;
  auditorPersona: string | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;

  get totalPages() {
    return Math.ceil(this.nodes.length / this.pageSize);
  }

  get paginatedNodes() {
    const start = this.currentPage * this.pageSize;
    return this.nodes.slice(start, start + this.pageSize);
  }

  get isLastPage() {
    return this.currentPage >= this.totalPages - 1;
  }

  async ngOnChanges(changes: SimpleChanges) {
    const qChange = changes['quiz'];
    if (qChange && this.quiz) {
      // Recargar siempre que el objeto cambie para asegurar que los KPIs (basados en los nodos) se actualicen
      await this.loadNodes();
    }
  }

  async loadNodes() {
    if (!this.quiz) return;
    this.isLoadingNodes = true;
    this.cdr.detectChanges();
    try {
      this.nodes = await this.db.getNodesInQuiz(this.quiz.quiz_id);
      this.auditorPersona = this.quiz.auditor_persona || null;
    } catch (e) {
      console.error('[QuizPreview] Error loading nodes:', e);
    } finally {
      this.isLoadingNodes = false;
      this.cdr.detectChanges();
    }
  }

  get iaNodesCount(): number {
    return this.nodes.filter(n => n.requiere_ia).length;
  }

  get retentionPercent(): number {
    if (!this.nodes.length) return 0;
    const now = new Date();
    
    // Fórmula Ebbinghaus: R = e^(-t/S) donde t = días desde último repaso, S = estabilidad
    // S se infiere del intervalo SM-2 asignado a cada nodo
    let totalRetention = 0;
    let countable = 0;
    
    for (const n of this.nodes) {
      if (!n.nextReviewDate) continue; // Nodo nunca repasado = 0% retención
      
      const reviewDate = new Date(n.nextReviewDate);
      const created = n.createdAt ? new Date(n.createdAt) : now;
      
      // Estabilidad (S): El intervalo SM-2 asignado al nodo
      const stability = Math.max(1, (reviewDate.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      
      // Tiempo transcurrido (t): Días desde que se calculó el review (hoy vs cuándo debería repasarse)
      const daysSinceSchedule = Math.max(0, (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      
      // R = e^(-t/S) * 100
      const retention = Math.exp(-daysSinceSchedule / stability) * 100;
      totalRetention += Math.min(100, Math.max(0, retention));
      countable++;
    }
    
    if (countable === 0) return 0;
    return Math.round(totalRetention / countable);
  }

  get lastReviewLabel(): string {
    // Usar ultimo_repaso real del quiz (guardado al finalizar sesión)
    const lastReview = this.quiz?.ultimo_repaso;
    const intentos = this.quiz?.estadisticas_globales?.intentos || 0;
    
    if (intentos === 0 || !lastReview) return 'Nunca';
    
    const reviewDate = new Date(lastReview);
    const diff = Date.now() - reviewDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    return `Hace ${days}d`;
  }

  get nivelClass(): string {
    const map: Record<string, string> = {
      'Aprendiz': 'badge-nivel nivel-aprendiz',
      'Intermedio': 'badge-nivel nivel-intermedio',
      'Avanzado': 'badge-nivel nivel-avanzado',
      'Senior': 'badge-nivel nivel-senior'
    };
    return map[this.quiz?.dificultad_global || 'Aprendiz'] || 'badge-nivel nivel-aprendiz';
  }

  getNivelFaceSvg(): SafeHtml {
    const rawSvg = LEVEL_FACES[this.quiz?.dificultad_global || 'Aprendiz'] || LEVEL_FACES['Aprendiz'];
    return this.sanitizer.bypassSecurityTrustHtml(rawSvg);
  }

  // Removiendo método obsoleto que usaba emojis

  getTipoLabel(tipo: string): string {
    if (!tipo) return 'Desconocido';
    const key = tipo.toLowerCase().trim().replace(/ /g, '_');
    if (key.includes('single')) return 'Selección Única';
    if (key.includes('multi')) return 'Selección Múltiple';
    if (key.includes('cloze')) return 'Completar Espacios';
    if (key.includes('output')) return 'Predicción de Salida';
    if (key.includes('order')) return 'Ordenamiento Lógico';
    if (key.includes('anomaly')) return 'Detección de Anomalías';
    if (key.includes('optimiz')) return 'Optimización de Código';
    if (key.includes('case')) return 'Análisis de Casos';
    if (key.includes('feynman')) return 'Síntesis de Feynman';

    return TIPO_MAP[tipo]?.label || tipo;
  }

  getSafeIcon(tipo: string): string {
    if (!tipo) return TYPE_ICONS['single_choice'];
    const key = tipo.toLowerCase().trim().replace(/ /g, '_');
    
    if (key.includes('single'))  return TYPE_ICONS['single_choice'];
    if (key.includes('multi'))   return TYPE_ICONS['multiple_choice'];
    if (key.includes('cloze'))   return TYPE_ICONS['cloze_deletion'];
    if (key.includes('output'))  return TYPE_ICONS['output_prediction'];
    if (key.includes('order'))   return TYPE_ICONS['ordering'];
    if (key.includes('anomaly')) return TYPE_ICONS['anomaly_detection'];
    if (key.includes('optimiz')) return TYPE_ICONS['optimization'];
    if (key.includes('case'))    return TYPE_ICONS['case_analysis'];
    if (key.includes('feynman')) return TYPE_ICONS['feynman_synthesis'];

    return (TYPE_ICONS as any)[key] || TYPE_ICONS['single_choice'];
  }

  getTipoIcon(tipo: string): string {
    return this.getSafeIcon(tipo);
  }

  truncate(text: string, len = 65): string {
    if (!text) return '';
    return text.length > len ? text.slice(0, len) + '...' : text;
  }

  getMemoriaClass(node: NodeChallenge): string {
    if (!node.nextReviewDate) return 'memoria-chip memoria-baja';
    const now = new Date();
    const reviewDate = new Date(node.nextReviewDate);
    const days = (reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (days > 7) return 'memoria-chip memoria-alta';
    if (days > 1) return 'memoria-chip memoria-media';
    return 'memoria-chip memoria-baja';
  }

  getMemoriaLabel(node: NodeChallenge): string {
    if (!node.nextReviewDate) return 'Baja';
    const now = new Date();
    const days = (new Date(node.nextReviewDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (days > 7) return 'Alta';
    if (days > 1) return 'Med';
    return 'Baja';
  }

  async handleUpdateQuiz(data: { title: string, difficulty: string }) {
    if (!this.quiz) return;
    
    try {
      const updatedQuiz: QuizSession = {
        ...this.quiz,
        titulo_quiz: data.title,
        dificultad_global: data.difficulty as DifficultyLevel
      };
      
      await this.db.saveQuiz(updatedQuiz);
      
      // Cerramos modal y avisamos al padre. 
      // El padre actualizará el [quiz] y ngOnChanges se encargará de refrescar la vista
      // SIN disparar loadNodes() gracias al check de ID que acabamos de poner.
      this.showEditModal = false;
      this.onQuizUpdated.emit(updatedQuiz);
      this.cdr.detectChanges();
    } catch (e) {
      console.error('[QuizPreview] Error updating quiz:', e);
    }
  }

  async handleUpdateNode(updatedNode: NodeChallenge) {
    if (!updatedNode.id) return;
    
    try {
      await this.db.saveNode(updatedNode);
      this.selectedNode = null;
      // Refrescar lista localmente
      this.nodes = this.nodes.map(n => n.id === updatedNode.id ? updatedNode : n);
      this.cdr.detectChanges();
    } catch (e) {
      console.error('[QuizPreview] Error updating node:', e);
    }
  }
}
