import { Component, inject, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DifficultyLevel, ChallengeType, FolderTheme } from '../../../../core/models/node.model';
import { PromptConfigV2, buildPromptV2, AuditorPersona, OutputLanguage } from '../../../../core/services/pipeline/prompt-templates.constants';
import { ThemeService } from '../../../../core/services/ui/theme.service';
import { LiquidGlassComponent } from '../../../../shared/components/liquid-glass/liquid-glass.component';
import { NAV_ICONS } from '../../../../shared/constants/icons.constants';
import { Router } from '@angular/router';
import { DatabaseService } from '../../../../core/services/storage/database.service';
@Component({
  selector: 'app-command-center',
  standalone: true,
  imports: [CommonModule, FormsModule, LiquidGlassComponent],
  template: `
    <div class="command-center-container">
      <header class="cc-header">
        <div class="header-left">
          <h1 class="cc-title">Command Center</h1>
          <div class="header-meta">
            <p class="cc-subtitle">Orquesta tu Flujo Cognitivo</p>
            <div class="status-indicator">
              <div class="status-pill">
                <span class="dot pulse"></span>
                <span class="status-text">SYNC: LOCAL_DB</span>
              </div>
            </div>
          </div>
        </div>
        <div class="header-right">
          <!-- Espacio reservado para el menú de usuario -->
        </div>
      </header>

      <div class="cc-grid">
        <!-- PRIMARY OPS: INJECT PAYLOAD (Wide) -->
        <div class="cc-card span-8 row-2 card-ingest"
             (dragenter)="onDragEnter($event)"
             (dragover)="onDragOver($event)" 
             (dragleave)="onDragLeave($event)" 
             (drop)="onDrop($event)"
             [class.dragging]="isDragging"
             [class.ctrl-active]="isCtrlPressed">
          
          <div class="ingest-header">
            <div class="ingest-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224ZM157.66,106.34a8,8,0,0,1-11.32,11.32L136,107.31V152a8,8,0,0,1-16,0V107.31l-10.34,10.35a8,8,0,0,1-11.32-11.32l24-24a8,8,0,0,1,11.32,0Z"></path></svg>
              <span class="label-micro mb-0" style="font-size: 0.8rem; margin: 0;">SUBIR PREGUNTAS</span>
            </div>
            <button class="btn-generate-prompt" (click)="openCompilerModal()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M128,128a8,8,0,0,1-3,6.25l-40,32a8,8,0,1,1-10-12.5L107.19,128,75,102.25a8,8,0,1,1,10-12.5l40,32A8,8,0,0,1,128,128Zm48,24H136a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Zm56-96V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56ZM216,200V56H40V200H216Z"></path></svg>
              <span>Generar Prompt</span>
            </button>
          </div>

          <div class="ingest-body">
            <svg class="cloud-icon" xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 256 256"><path d="M178.34,165.66,160,147.31V208a8,8,0,0,1-16,0V147.31l-18.34,18.35a8,8,0,0,1-11.32-11.32l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32ZM160,40A88.08,88.08,0,0,0,81.29,88.68,64,64,0,1,0,72,216h40a8,8,0,0,0,0-16H72a48,48,0,0,1,0-96c1.1,0,2.2,0,3.29.12A88,88,0,0,0,72,128a8,8,0,0,0,16,0,72,72,0,1,1,100.8,66,8,8,0,0,0,3.2,15.34,7.9,7.9,0,0,0,3.2-.68A88,88,0,0,0,160,40Z"></path></svg>
            <h4 class="ingest-main-text">Usa CTRL+V para subir tus Preguntas</h4>
            <p class="ingest-sub-text">También puedes subir tu archivo .JSON</p>
            <button class="btn-explore-files" (click)="fileInput.click()">Explorar Archivos</button>
            <input type="file" #fileInput (change)="onFileSelected($event)" accept=".json" style="display: none;">
          </div>
        </div>

        <!-- ACTION: FORZAR SPRINT (Compact & Powerful) -->
        <div class="cc-card span-4 row-2">
          <app-liquid-glass [simple]="true" [radius]="20" [depth]="4" [blur]="24" [backgroundColor]="'var(--glass-fill-accent)'">
            <div class="card-inner centered gap-1">
              <div class="glow-orb"></div>
              <span class="material-symbols-rounded bolt-icon neon-text">bolt</span>
              <button class="btn-sprint-main" (click)="startInterleaving()">FORZAR_SPRINT</button>
              <div class="stress-meter">
                <div class="meter-bar" style="width: 85%"></div>
                <span class="label-micro">STRESS_LVL: MAX</span>
              </div>
            </div>
          </app-liquid-glass>
        </div>

        <!-- TRIAGE: QUEUE (Vertical) -->
        <div class="cc-card span-4 row-4">
          <app-liquid-glass [simple]="true" [radius]="20" [depth]="2" [blur]="16" [backgroundColor]="'var(--glass-fill)'">
            <div class="card-inner no-padding">
              <div class="inner-glow"></div>
              <div class="header-micro-technical">
                <span class="material-symbols-rounded size-mini">priority_high</span>
                <span class="label-micro">TRIAGE_QUEUE</span>
              </div>
              <div class="body-list scroll-hide">
                <div *ngIf="dueModules.length === 0" class="empty-state">
                  <span class="material-symbols-rounded">check_circle</span>
                  <p>SYSTEM_OPTIMIZED</p>
                </div>
                <div class="triage-item" *ngFor="let mod of dueModules" (click)="startSprint(mod.folder_id)">
                  <div class="triage-status" [class.overdue]="mod.status === 'overdue'"></div>
                  <span class="triage-name">{{ mod.nombre_tema }}</span>
                  <span class="triage-count">{{ mod.count }}</span>
                </div>
              </div>
            </div>
          </app-liquid-glass>
        </div>

        <!-- ANALYTICS: CONSISTENCY MAP (Large) -->
        <div class="cc-card span-8 row-4">
          <app-liquid-glass [simple]="true" [radius]="20" [depth]="2" [blur]="20" [backgroundColor]="'var(--glass-fill)'">
            <div class="card-inner no-padding">
              <div class="inner-glow"></div>
              <div class="header-micro-technical">
                <span class="material-symbols-rounded size-mini">analytics</span>
                <span class="label-micro">CONSISTENCY_MAP</span>
              </div>
              <div class="heatmap-container">
                <svg viewBox="0 0 740 100" class="heatmap-svg">
                  <rect *ngFor="let day of heatmapNodes; let i = index"
                        [attr.x]="(i % 52) * 14" [attr.y]="getY(i) * 14"
                        width="11" height="11" rx="2"
                        [attr.fill]="getHeatColor(day.count)"
                        class="heat-node">
                  </rect>
                </svg>
              </div>
            </div>
          </app-liquid-glass>
        </div>

        <!-- WIDGETS: STREAK & TIMER (Small Square) -->
        <div class="cc-card span-3 row-2">
          <app-liquid-glass [simple]="true" [radius]="20" [depth]="1" [blur]="20" [backgroundColor]="'var(--glass-fill)'">
            <div class="widget-square">
              <div class="inner-glow"></div>
              <div class="widget-header">
                <span class="label-micro">STREAK_SESSION</span>
                <span class="material-symbols-rounded ico-mini">local_fire_department</span>
              </div>
              <div class="widget-value neon-text">{{ streak }}</div>
            </div>
          </app-liquid-glass>
        </div>

        <div class="cc-card span-3 row-2">
          <app-liquid-glass [simple]="true" [radius]="20" [depth]="1" [blur]="20" [backgroundColor]="'var(--glass-fill)'">
            <div class="widget-square clickable" (click)="togglePomo()">
              <div class="inner-glow"></div>
              <div class="widget-header">
                <span class="label-micro">ZEN_TIMER</span>
                <span class="material-symbols-rounded ico-mini">{{ pomo.running ? 'pause' : 'play_arrow' }}</span>
              </div>
              <div class="widget-value mono">{{ pomoTime }}</div>
            </div>
          </app-liquid-glass>
        </div>

        <!-- WIDGET: MASTERY (Vertical/Accent) -->
        <div class="cc-card span-2 row-2">
          <app-liquid-glass [simple]="true" [radius]="20" [depth]="1" [blur]="15" [backgroundColor]="'var(--glass-fill)'">
            <div class="widget-mastery">
              <div class="inner-glow"></div>
              <div class="circular-progress">
                <svg viewBox="0 0 36 36" class="chart-svg">
                  <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path class="circle-fg" [attr.stroke-dasharray]="masteryRatio + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
                <div class="perc-text">{{ masteryRatio | number:'1.0-0' }}%</div>
              </div>
              <span class="label-micro mt-1">MASTERY</span>
            </div>
          </app-liquid-glass>
        </div>

        <!-- FOOTER: VAULTS (Mid) -->
        <div class="cc-card span-4 row-2">
          <app-liquid-glass [simple]="true" [radius]="20" [depth]="1" [blur]="20" [backgroundColor]="'var(--glass-fill)'">
            <div class="card-inner">
              <div class="inner-glow"></div>
              <div class="label-micro mb-1">VAULTS_CACHE</div>
              <div class="vault-tokens">
                <div class="vault-token" *ngFor="let v of recentVaults">
                  <span class="material-symbols-rounded">folder</span>
                  <span>{{ v.nombre_tema }}</span>
                </div>
              </div>
            </div>
          </app-liquid-glass>
        </div>

        <!-- FOOTER: FLUX (Wide) -->
        <div class="cc-card span-12 row-2">
          <app-liquid-glass [simple]="true" [radius]="20" [depth]="1" [blur]="20" [backgroundColor]="'var(--glass-fill)'">
            <div class="card-inner flex-row items-center gap-3">
              <div class="inner-glow"></div>
              <div class="label-micro no-wrap">RETENTION_FLUX</div>
              <div class="flux-viz">
                <svg class="flux-svg" viewBox="0 0 800 40" preserveAspectRatio="none">
                  <path [attr.d]="retentionPath" fill="none" stroke="var(--accent)" stroke-width="2" opacity="0.6"/>
                  <path [attr.d]="retentionPath" fill="none" stroke="var(--accent)" stroke-width="6" opacity="0.1" filter="blur(4px)"/>
                </svg>
              </div>
            </div>
          </app-liquid-glass>
        </div>
      </div>

      <!-- TEMPORAL UPLOAD MODAL (TDD) -->
      <div class="cc-modal-backdrop" *ngIf="showUploadModal">
        <div class="cc-modal card-glass shadow-bloom" style="width: 650px; max-width: 95vw;">
          <header class="modal-header">
            <h3 style="display: flex; align-items: center; gap: 0.6rem; color: var(--theme-brand-neon);">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256"><path d="M240,136v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V136a16,16,0,0,1,16-16H72a8,8,0,0,1,0,16H32v64H224V136H184a8,8,0,0,1,0-16h40A16,16,0,0,1,240,136Zm-117.66-2.34a8,8,0,0,0,11.32,0l48-48a8,8,0,0,0-11.32-11.32L136,108.69V24a8,8,0,0,0-16,0v84.69L85.66,74.34A8,8,0,0,0,74.34,85.66ZM200,168a12,12,0,1,0-12,12A12,12,0,0,0,200,168Z"></path></svg>
              Cargar Test
            </h3>
            <button class="btn-close" (click)="showUploadModal = false">×</button>
          </header>
          
          <div class="modal-body">
            
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; align-items: start; margin-bottom: 1rem;">
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div class="input-group relative" style="margin: 0;">
                  <label class="cc-label" style="font-size: 0.85rem; letter-spacing: 0;">Tema:</label>
                  <div style="position: relative;">
                    <input type="text" [(ngModel)]="uploadConfig.themeName" (focus)="showThemeDropdown=true" (blur)="hideThemeDropdownDelay()" (input)="filterThemes()" placeholder="Escribe o selecciona..." class="cc-input" style="padding-right: 2.5rem;" autocomplete="off">
                    <svg style="position: absolute; right: 0.8rem; top: 50%; transform: translateY(-50%); color: var(--theme-text-secondary); pointer-events: none;" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>
                  </div>
                  <div class="combo-dropdown" *ngIf="showThemeDropdown && filteredThemes.length > 0">
                    <div class="combo-item" *ngFor="let t of filteredThemes" (click)="selectTheme(t)">
                       {{ t.nombre_tema }}
                    </div>
                  </div>
                </div>

                <div class="input-group" style="margin: 0;">
                  <label class="cc-label" style="font-size: 0.85rem; letter-spacing: 0;">Titulo del Quiz</label>
                  <input type="text" [(ngModel)]="uploadConfig.quizTitle" placeholder="Ej. Fundamentos de Programacion Basico - Python" class="cc-input" autocomplete="off">
                </div>
              </div>

              <div style="background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.8rem; height: 100%; justify-content: center;">
                 <h4 style="margin: 0; font-size: 0.75rem; color: var(--theme-text-secondary); font-family: 'JetBrains Mono', monospace; letter-spacing: 0;">MÉTRICAS DEL PAYLOAD</h4>
              <div style="background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.8rem; height: 100%; justify-content: center;">
                 <h4 style="margin: 0; font-size: 0.75rem; color: var(--theme-text-secondary); font-family: 'JetBrains Mono', monospace; letter-spacing: 0;">MÉTRICAS DEL PAYLOAD</h4>
                 <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.8rem; opacity: 0.8;" title="Nodos Extraídos (Total)">Nodos JSON:</span>
                    <span style="font-size: 1.1rem; font-weight: 800; font-family: 'Fira Code', monospace; transition: color 0.3s;" 
                          [style.color]="uploadStats.nodeCount && uploadStats.nodeCount === compiler.totalPreguntas ? 'var(--theme-brand-neon)' : 'var(--theme-alert-yellow)'">
                      {{ uploadStats.nodeCount || '0' }}
                    </span>
                 </div>
                 <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.8rem; opacity: 0.8;" title="Diversidad Cognitiva">Tipos de Retos:</span>
                    <span style="font-size: 1rem; font-weight: 800; font-family: 'Fira Code', monospace; color: var(--theme-brand-neon);">{{ uploadStats.uniqueTypes || '0' }}</span>
                 </div>
                 <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.8rem; opacity: 0.8;" title="Alertas de Esquema (Zod)">Errores Zod:</span>
                    <span style="font-size: 1rem; font-weight: 800; font-family: 'Fira Code', monospace; transition: color 0.3s;" 
                          [style.color]="uploadStats.schemaErrors === 0 ? 'var(--theme-text-secondary)' : '#ff4444'">
                      {{ uploadStats.schemaErrors || '0' }}
                    </span>
                 </div>
                 <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.8rem; opacity: 0.8;">Caracteres totales:</span>
                    <span style="font-size: 1rem; font-weight: 800; font-family: 'Fira Code', monospace; color: var(--theme-text-secondary);">{{ uploadStats.charCount || '0' }}</span>
                 </div>
              </div>
            </div>

            <div class="input-group" style="margin-bottom: 0;">
               <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.5rem;">
                 <label class="cc-label" style="margin: 0; font-size: 0.85rem; letter-spacing: 0;">JSON:</label>
                 <div style="display: flex; gap: 0.5rem;">
                   <button class="btn-micro btn-json-tool" (click)="normalizeJson()" *ngIf="temporaryUploadPayload" title="Evaluar y reparar estructura JSON">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M197.58,129.06,146,110l-19-51.62a15.92,15.92,0,0,0-29.88,0L78,110l-51.62,19a15.92,15.92,0,0,0,0,29.88L78,178l19,51.62a15.92,15.92,0,0,0,29.88,0L146,178l51.62-19a15.92,15.92,0,0,0,0-29.88ZM137,164.22a8,8,0,0,0-4.74,4.74L112,223.85,91.78,169A8,8,0,0,0,87,164.22L32.15,144,87,123.78A8,8,0,0,0,91.78,119L112,64.15,132.22,119a8,8,0,0,0,4.74,4.74L191.85,144ZM144,40a8,8,0,0,1,8-8h16V16a8,8,0,0,1,16,0V32h16a8,8,0,0,1,0,16H184V64a8,8,0,0,1-16,0V48H152A8,8,0,0,1,144,40ZM248,88a8,8,0,0,1-8,8h-8v8a8,8,0,0,1-16,0V96h-8a8,8,0,0,1,0-16h8V72a8,8,0,0,1,16,0v8h8A8,8,0,0,1,248,88Z"></path></svg>
                      Evaluar JSON
                   </button>
                   <button class="btn-micro btn-json-tool" (click)="temporaryUploadPayload=''; onPayloadInput()" *ngIf="temporaryUploadPayload" title="Vaciar editor de payload">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M235.5,216.81c-22.56-11-35.5-34.58-35.5-64.8V134.73a15.94,15.94,0,0,0-10.09-14.87L165,110a8,8,0,0,1-4.48-10.34l21.32-53a28,28,0,0,0-16.1-37,28.14,28.14,0,0,0-35.82,16,.61.61,0,0,0,0,.12L108.9,79a8,8,0,0,1-10.37,4.49L73.11,73.14A15.89,15.89,0,0,0,55.74,76.8C34.68,98.45,24,123.75,24,152a111.45,111.45,0,0,0,31.18,77.53A8,8,0,0,0,61,232H232a8,8,0,0,0,3.5-15.19ZM67.14,88l25.41,10.3a24,24,0,0,0,31.23-13.45l21-53c2.56-6.11,9.47-9.27,15.43-7a12,12,0,0,1,6.88,15.92L145.69,93.76a24,24,0,0,0,13.43,31.14L184,134.73V152c0,.33,0,.66,0,1L55.77,101.71A108.84,108.84,0,0,1,67.14,88Zm48,128a87.53,87.53,0,0,1-24.34-42,8,8,0,0,0-15.49,4,105.16,105.16,0,0,0,18.36,38H64.44A95.54,95.54,0,0,1,40,152a85.9,85.9,0,0,1,7.73-36.29l137.8,55.12c3,18,10.56,33.48,21.89,45.16Z"></path></svg>
                      Limpiar
                   </button>
                   <button class="btn-micro btn-json-tool" (click)="formatPastedJson()" *ngIf="temporaryUploadPayload" title="Formatear indentación">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M201.54,54.46A104,104,0,0,0,54.46,201.54,104,104,0,0,0,201.54,54.46ZM190.23,65.78a88.18,88.18,0,0,1,11,13.48L167.55,119,139.63,40.78A87.34,87.34,0,0,1,190.23,65.78ZM155.59,133l-18.16,21.37-27.59-5L100.41,123l18.16-21.37,27.59,5ZM65.77,65.78a87.34,87.34,0,0,1,56.66-25.59l17.51,49L58.3,74.32A88,88,0,0,1,65.77,65.78ZM46.65,161.54a88.41,88.41,0,0,1,2.53-72.62l51.21,9.35Zm19.12,28.68a88.18,88.18,0,0,1-11-13.48L88.45,137l27.92,78.18A87.34,87.34,0,0,1,65.77,190.22Zm124.46,0a87.34,87.34,0,0,1-56.66,25.59l-17.51-49,81.64,14.91A88,88,0,0,1,190.23,190.22Zm-34.62-32.49,53.74-63.27a88.41,88.41,0,0,1-2.53,72.62Z"></path></svg>
                      Formatear
                   </button>
                 </div>
               </div>
               
               <div class="status-pill-validation" [ngClass]="{'esperando': !temporaryUploadPayload, 'success': uploadStats.isValid && temporaryUploadPayload, 'error': !uploadStats.isValid && temporaryUploadPayload }">
                 <span *ngIf="!temporaryUploadPayload" style="display: flex; align-items: center; gap: 0.4rem;">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M184,24H72A16,16,0,0,0,56,40V76a16.07,16.07,0,0,0,6.4,12.8L114.67,128,62.4,167.2A16.07,16.07,0,0,0,56,180v36a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V180.36a16.09,16.09,0,0,0-6.35-12.77L141.27,128l52.38-39.6A16.05,16.05,0,0,0,200,75.64V40A16,16,0,0,0,184,24Zm0,16V56H72V40Zm0,176H72V180l56-42,56,42.35Zm-56-98L72,76V72H184v3.64Z"></path></svg>
                     Esperando Payload...
                 </span>
                 <span *ngIf="uploadStats.isValid && temporaryUploadPayload" style="display: flex; align-items: center; gap: 0.4rem;">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg>
                     Schema Zod validado. {{ uploadStats.nodeCount }} Preguntas listas.
                 </span>
                 <span *ngIf="!uploadStats.isValid && temporaryUploadPayload" style="display: flex; align-items: center; gap: 0.4rem;">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg>
                     Error de Esquema: {{ uploadStats.errorMessage || 'Estructura Inválida' }}
                 </span>
               </div>

               <div class="payload-editor-container" style="position: relative; height: 260px; margin-top: 0.5rem; border-radius: 8px;">
                 <div class="code-editor-backdrop" [innerHTML]="highlightedPayload"></div>
                 <textarea class="cc-textarea code-editor-front" spellcheck="false" [(ngModel)]="temporaryUploadPayload" (ngModelChange)="onPayloadInput()" (scroll)="syncEditorScroll($event)" placeholder="(JSON ya pegado aqui)"></textarea>
               </div>
            </div>
          </div>

          <footer class="modal-footer" style="justify-content: space-between; margin-top: 2rem;">
             <button class="btn-micro" style="padding: 0.6rem 1.2rem; font-size: 0.9rem;" (click)="showUploadModal = false">
               Cancelar
             </button>
             <button class="btn-text-upload" [disabled]="!uploadStats.isValid || !uploadConfig.themeName || !uploadConfig.quizTitle" (click)="confirmUpload()">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0ZM93.66,77.66,120,51.31V144a8,8,0,0,0,16,0V51.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,77.66Z"></path></svg>
               Inyectar a la Bóveda
             </button>
          </footer>
        </div>
      </div>

      <div class="cc-modal-backdrop" *ngIf="showCompiler">
        <div class="cc-modal compiler-modal card-glass shadow-bloom" style="width: 95%; max-width: 1300px; max-height: 90vh; overflow-y: auto; background: #131313; border-color: rgba(255,255,255,0.05);">
          
          <header class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 1.5rem;">
            <h3 style="color: var(--theme-brand-neon); display: flex; align-items: center; gap: 0.8rem; font-size: 1.6rem; font-weight: 900; letter-spacing: -1px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 256 256"><path d="M128,128a8,8,0,0,1-3,6.25l-40,32a8,8,0,1,1-10-12.5L107.19,128,75,102.25a8,8,0,1,1,10-12.5l40,32A8,8,0,0,1,128,128Zm48,24H136a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Zm56-96V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56ZM216,200V56H40V200H216Z"></path></svg>
              Compilador de PROMPT
            </h3>
            <button class="btn-close" (click)="showCompiler = false">×</button>
          </header>
          
          <div class="modal-body compiler-layout">
            
            <!-- COLUMNA IZQUIERDA (Controles) -->
            <div class="compiler-controls" style="display: flex; flex-direction: column; gap: 1.2rem;">
              
              <div class="input-group">
                  <label class="cc-label">Tema Central (Objetivo):</label>
                  <input type="text" [(ngModel)]="compiler.tema" placeholder="Ej. Arquitectura Frontend React" class="cc-input compiler-theme-input" style="font-family: 'JetBrains Mono', monospace; border-radius: 8px;">
              </div>
              
              <div class="row-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="input-group">
                  <label class="cc-label" title="El nivel definirá la complejidad teórica y práctica exigida por la IA a la hora de resolver el Quiz.">Nivel de Complejidad:</label>
                  <div class="custom-select-wrapper" [class.active-wrapper]="showNivelSelect" (click)="$event.stopPropagation(); showNivelSelect = !showNivelSelect; showAuditorSelect = false; showIdiomaSelect = false">
                    <div class="cc-select select-trigger compiler-theme-input" [class.active]="showNivelSelect">
                      <span>{{ getNivelLabel() }}</span>
                      <svg class="select-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm37.66-85.66a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L120,148.69V88a8,8,0,0,1,16,0v60.69l18.34-18.35A8,8,0,0,1,165.66,130.34Z"></path></svg>
                    </div>
                    <div class="select-dropdown" *ngIf="showNivelSelect">
                      <div class="select-option" *ngFor="let opt of niveles" (click)="$event.stopPropagation(); compiler.nivel = opt.value; showNivelSelect = false">
                        <span class="opt-label">{{ opt.label }}</span>
                        <span class="opt-desc">{{ opt.desc }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="input-group">
                  <label class="cc-label">Número de Preguntas:</label>
                  <input type="number" [(ngModel)]="compiler.totalPreguntas" min="1" max="100" class="cc-input compiler-theme-input" style="text-align: center; border-radius: 8px; font-weight: bold;">
                </div>
              </div>

              <div class="row-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="input-group">
                  <label class="cc-label" title="Define cómo va a redactar la IA las explicaciones y las pistas.">Personalidad del Auditor:</label>
                  <div class="custom-select-wrapper" [class.active-wrapper]="showAuditorSelect" (click)="$event.stopPropagation(); showAuditorSelect = !showAuditorSelect; showNivelSelect = false; showIdiomaSelect = false">
                    <div class="cc-select select-trigger compiler-theme-input" [class.active]="showAuditorSelect">
                      <span>{{ getAuditorLabel() }}</span>
                      <svg class="select-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm37.66-85.66a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L120,148.69V88a8,8,0,0,1,16,0v60.69l18.34-18.35A8,8,0,0,1,165.66,130.34Z"></path></svg>
                    </div>
                    <div class="select-dropdown" *ngIf="showAuditorSelect">
                      <div class="select-option" *ngFor="let opt of auditores" (click)="$event.stopPropagation(); compiler.auditor = opt.value; showAuditorSelect = false">
                        <span class="opt-label">{{ opt.label }}</span>
                        <span class="opt-desc">{{ opt.desc }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="input-group">
                  <label class="cc-label">Idioma Salida:</label>
                  <div class="custom-select-wrapper" [class.active-wrapper]="showIdiomaSelect" (click)="$event.stopPropagation(); showIdiomaSelect = !showIdiomaSelect; showNivelSelect = false; showAuditorSelect = false">
                    <div class="cc-select select-trigger compiler-theme-input" [class.active]="showIdiomaSelect">
                      <span>{{ getIdiomaLabel() }}</span>
                      <svg class="select-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm37.66-85.66a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L120,148.69V88a8,8,0,0,1,16,0v60.69l18.34-18.35A8,8,0,0,1,165.66,130.34Z"></path></svg>
                    </div>
                    <div class="select-dropdown" *ngIf="showIdiomaSelect">
                      <div class="select-option" *ngFor="let opt of idiomas" (click)="$event.stopPropagation(); compiler.idioma = opt.value; showIdiomaSelect = false">
                        <span class="opt-label">{{ opt.label }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- MATRIZ DE PREGUNTAS -->
              <div class="matrix-container" style="background: transparent; border-radius: 12px; display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <label class="cc-label" style="margin: 0; display: flex; align-items: center; gap: 0.4rem;">Matriz de Preguntas:</label>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="label-micro" style="margin-right: 0.5rem; opacity: 0.8;" [style.color]="matrixSum === compiler.totalPreguntas ? 'var(--theme-brand-neon)' : '#ff4444'">
                      {{ matrixSum }} / {{ compiler.totalPreguntas }}
                    </span>
                    <button class="btn-text-upload magic-btn" (click)="distribuirAzar()" style="padding: 0.3rem 0.6rem; font-size: 0.7rem; border-radius: 6px; background: rgba(255,255,255,0.05); color: var(--theme-text-secondary); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 0.4rem;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M48,64a8,8,0,0,1,8-8H72V40a8,8,0,0,1,16,0V56h16a8,8,0,0,1,0,16H88V88a8,8,0,0,1-16,0V72H56A8,8,0,0,1,48,64ZM184,192h-8v-8a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16Zm56-48H224V128a8,8,0,0,0-16,0v16H192a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V160h16a8,8,0,0,0,0-16ZM219.31,80,80,219.31a16,16,0,0,1-22.62,0L36.68,198.63a16,16,0,0,1,0-22.63L176,36.69a16,16,0,0,1,22.63,0l20.68,20.68A16,16,0,0,1,219.31,80Zm-54.63,32L144,91.31l-96,96L68.68,208ZM208,68.69,187.31,48l-32,32L176,100.69Z"></path></svg> Distribuir al Azar
                    </button>
                  </div>
                </div>
                
                <div class="matrix-grid-v2" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem;">
                  <!-- COLUMN 1 -->
                  <div class="matrix-item" title="Preguntas de opción múltiple que sirven para evaluar conceptualización con una sola respuesta correcta.">
                    <span>Single Choice</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.single_choice" class="cc-input mini compiler-theme-input">
                  </div>
                  <div class="matrix-item" title="Preguntas de completar espacios en blanco que sirven para obligar al usuario a recordar sintaxis exacta.">
                    <span>Cloze Deletion</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.cloze_deletion" class="cc-input mini compiler-theme-input">
                  </div>
                  <div class="matrix-item" title="Preguntas de ordenamiento que sirven para evaluar si conoces los pasos exactos o ciclos de vida de un proceso.">
                    <span>Ordering</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.ordering" class="cc-input mini compiler-theme-input">
                  </div>
                  
                  <!-- COLUMN 2 -->
                  <div class="matrix-item" title="Preguntas de optimización que sirven para darle al usuario código lento y forzarlo a pensar en cómo hacerlo más eficiente.">
                    <span>Optimization</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.optimization" class="cc-input mini compiler-theme-input">
                  </div>
                  <div class="matrix-item" title="Preguntas abiertas de explicación (Feynman) que sirven para ver si puede explicarse un tema técnico complejo con palabras simples.">
                    <span>Feynman Synth</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.feynman_synthesis" class="cc-input mini compiler-theme-input">
                  </div>
                  <div class="matrix-item" title="Preguntas de selección donde varias respuestas son correctas y sirven para evaluar el conocimiento completo del tema.">
                    <span>Multi Choice</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.multi_choice" class="cc-input mini compiler-theme-input">
                  </div>
                  
                  <!-- COLUMN 3 -->
                  <div class="matrix-item" title="Preguntas de análisis que sirven para dar un bloque de código y exigir que te digan exactamente qué imprimirá la consola.">
                    <span>Output Predict</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.output_prediction" class="cc-input mini compiler-theme-input">
                  </div>
                  <div class="matrix-item" title="Preguntas de trampa que sirven para dar código que compila bien pero tiene bugs lógicos escondidos que deben encontrarse.">
                    <span>Anomaly Detect</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.anomaly_detection" class="cc-input mini compiler-theme-input">
                  </div>
                  <div class="matrix-item" title="Preguntas de diseño de sistemas que sirven para poner problemas empresariales y preguntar qué arquitectura se usaría para mitigarlo.">
                    <span>Case Analysis</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.case_analysis" class="cc-input mini compiler-theme-input">
                  </div>
                </div>
              </div>
              
              <!-- TAGS EXTRA -->
              <div class="input-group" style="margin-top: 0.5rem;">
                <div style="display: flex; flex-direction: column;">
                  <label class="cc-label">Tags Extra</label>
                  <label class="label-micro" style="text-transform: none; opacity: 0.5;">(Escribe etiquetas extra para mejorar la calidad del quiz)</label>
                </div>
                <textarea [(ngModel)]="compiler.tagsExtra" placeholder="Ej. Específicamente céntrate en temas de Hooks y contextos concurrentes..." class="cc-textarea scroll-hide compiler-theme-input" style="min-height: 80px; border-radius: 8px; font-size: 0.8rem; padding: 0.8rem; margin-top: 0.5rem;"></textarea>
                <div style="display: flex; justify-content: flex-end; margin-top: 0.3rem; font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--theme-text-secondary); opacity: 0.8;">
                  {{ compiler.tagsExtra.length || 0 }} caracteres
                </div>
              </div>

              <!-- TOGGLES INFERIORES -->
              <div class="toggles-container" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 0.5rem;">
                <div class="switch-group" style="display: flex; align-items: center; justify-content: space-between;">
                  <label title="Inyecta un comando en el prompt para obligar a la IA a leer documentación enviada (RAG)." style="margin: 0; font-size: 0.85rem; max-width: 80%;">¿Vas a generar preguntas en base a uno o varios Documentos (PDF, WORD, EXCEL)?</label>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="compiler.adjuntarDocs">
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="switch-group" style="display: flex; align-items: center; justify-content: space-between;">
                  <label title="Añade el campo dinámico 'pista_opcional' en cada Nodo para gamificación." style="margin: 0; font-size: 0.85rem; max-width: 80%;">¿Incluir Pistas en las preguntas?</label>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="compiler.incluirPistas">
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="switch-group" style="display: flex; align-items: center; justify-content: space-between;">
                  <label title="Previene que la IA use identificadores markdown 'json' alrededor de la respuesta. Útil en flujos automatizados crudos." style="margin: 0; font-size: 0.85rem; max-width: 80%;">¿Forzar JSON RAW (Sin envoltura de llaves de markdown)?</label>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="compiler.forzarJsonRaw">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>

            </div>

            <!-- COLUMNA DERECHA (Preview) -->
            <div class="compiler-preview" style="display: flex; flex-direction: column; gap: 0.5rem; height: 100%;">
              <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 0.5rem;">
                <button class="btn-text-upload copier-btn" (click)="copyPromptBtn()" [disabled]="!isCompilerValid || isCopied" style="background: transparent; border: none; color: var(--theme-text-secondary); display: flex; align-items: center; justify-content: center; gap: 0.4rem; font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; font-weight: 600; padding: 0.4rem 0.8rem; border-radius: 6px; transition: color 0.3s ease; width: 100px;">
                  <ng-container *ngIf="!isCopied">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path></svg>
                    Copiar
                  </ng-container>
                  <ng-container *ngIf="isCopied">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#9ACD32" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path></svg>
                    <span style="color: #9ACD32;">Copiado</span>
                  </ng-container>
                </button>
              </div>
              <div style="flex: 1; border: 1px solid var(--theme-border); border-radius: 12px; padding: 0.5rem; background: var(--theme-surface-solid); position: relative;">
                <textarea readonly class="cc-textarea mono scroll-hide compiler-preview-text" [style.opacity]="isCompilerValid ? 1 : 0.4" [value]="livePromptPreview"></textarea>
                <div *ngIf="isCopied" style="position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); background: var(--theme-brand-neon); color: #000; padding: 0.6rem 1.2rem; border-radius: 100px; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 0.8rem; box-shadow: 0 4px 20px rgba(154,205,50,0.4); z-index: 100; animation: slideUpToast 0.3s ease-out;">
                  ✅ Prompt copiado al portapapeles
                </div>
              </div>
              <div style="display: flex; justify-content: flex-end; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--theme-text-secondary); opacity: 0.8;">
                {{ livePromptPreview.length | number }} caracteres
              </div>
            </div>

          </div>
        </div>
      </div>

      <div class="injection-toast" *ngIf="injectionStatus !== 'idle'" [class]="injectionStatus">
        <span class="material-symbols-rounded">{{ injectionStatus === 'success' ? 'check_circle' : 'error' }}</span>
        {{ injectionMsg }}
      </div>
    </div>
  `,
  styles: [`
    :host { 
      --accent: var(--theme-brand-accent); 
      --accent-glow: var(--theme-brand-neon-alt);
      --glass-fill: rgba(17, 20, 17, 0.4);
      --glass-fill-accent: rgba(154, 205, 50, 0.12);
      --glass-border: var(--theme-border);
      display: block;
      min-height: 100vh;
      background: radial-gradient(circle at top right, var(--theme-surface-solid), var(--theme-bg));
      color: var(--theme-text);
      transition: background 0.4s ease, color 0.4s ease;
    }

    :host-context([data-theme="light"]) {
      --glass-fill: rgba(255, 255, 255, 0.15);
      --glass-fill-accent: rgba(154, 205, 50, 0.08);
    }
    
    .command-center-container {
      padding: 3rem 2.5rem 1.5rem;
      max-width: 1600px;
      margin: 0;
      color: var(--theme-text);
      font-family: 'Inter', sans-serif;
    }

    /* HEADER */
    .cc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2.5rem;
      position: relative;
    }
    .cc-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 3.5rem;
      font-weight: 800;
      letter-spacing: -2px;
      margin: 0;
      line-height: 1;
      background: linear-gradient(180deg, var(--theme-text) 0%, var(--theme-text-secondary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    :host-context([data-theme="light"]) .cc-title {
      background: none;
      -webkit-background-clip: initial;
      -webkit-text-fill-color: initial;
      color: var(--theme-text);
    }
    .header-meta {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-top: 0.5rem;
    }
    .cc-subtitle {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.95rem;
      font-weight: 400;
      letter-spacing: 1px;
      opacity: 0.5;
      margin: 0;
      color: var(--theme-text);
    }
    :host-context([data-theme="light"]) .cc-subtitle {
      opacity: 0.8;
      font-weight: 800;
    }
    .status-indicator { display: flex; align-items: center; }
    .status-pill {
      background: var(--theme-border);
      padding: 0.35rem 0.8rem;
      border-radius: 100px;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-family: 'Fira Code', monospace;
      font-size: 0.65rem;
      font-weight: 800;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.02);
      color: var(--theme-text);
    }
    .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); }

    /* BENTO GRID 12-COLUMN - TIGHTER */
    .cc-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      grid-auto-rows: minmax(60px, auto);
      gap: 12px;
    }
    .span-12 { grid-column: span 12; }
    .span-8 { grid-column: span 8; }
    .span-4 { grid-column: span 4; }
    .span-3 { grid-column: span 3; }
    .span-2 { grid-column: span 2; }
    .row-4 { grid-row: span 4; }
    .row-2 { grid-row: span 2; }

    .cc-card { 
      position: relative; 
      border-radius: 20px; 
      overflow: hidden; 
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px -10px var(--theme-shadow-soft);
      border: 1px solid var(--theme-border);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s, border-color 0.3s;
      background: var(--theme-surface-solid);
    }
    :host-context([data-theme="light"]) .cc-card {
      border: 1px solid rgba(0, 0, 0, 0.18); /* Solidified for maximum clarity */
      box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.05);
    }
    
    .matrix-item {
      display: flex; justify-content: space-between; align-items: center;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 0.4rem 0.6rem; border-radius: 8px;
    }
    .matrix-item span { font-size: 0.7rem; color: var(--theme-text-secondary); font-family: 'JetBrains Mono', monospace; width: 60%; display: block; line-height: 1.1; }
    .matrix-item .cc-input.mini { width: 35px; height: 26px; padding: 0; text-align: center; font-size: 0.8rem; background: rgba(0,0,0,0.5); border: none; color: #fff; }

    .cc-card:hover { 
      transform: translateY(-4px); 
      box-shadow: 0 20px 40px -15px var(--theme-shadow-soft);
      border-color: var(--theme-brand-neon);
    }
    app-liquid-glass { width: 100%; height: 100%; display: block; }

    /* CARD INTERNALS */
    .card-inner { height: 100%; padding: 1.25rem; position: relative; z-index: 2; overflow: hidden; }
    .card-inner.no-padding { padding: 0; }
    .inner-glow {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%);
      pointer-events: none; z-index: 1;
    }
    :host-context([data-theme="light"]) .inner-glow {
      display: none;
    }

    .flex-row { display: flex; }
    .items-center { align-items: center; }
    .space-between { justify-content: space-between; }
    .centered { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .gap-1 { gap: 0.75rem; }
    .gap-3 { gap: 1.5rem; }
    .no-wrap { white-space: nowrap; }

    /* --- INGEST CARD --- */
    .cc-card.card-ingest {
      border: 2px dashed rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.02);
      padding: 1.25rem 2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: none;
    }
    :host-context([data-theme="light"]) .cc-card.card-ingest {
      border: 2px dashed rgba(0, 0, 0, 0.15);
      background: rgba(0, 0, 0, 0.02);
    }
    
    .cc-card.card-ingest:hover {
      border-color: var(--theme-brand-neon);
    }
    .cc-card.card-ingest.dragging, .cc-card.card-ingest.ctrl-active {
      border-color: var(--theme-brand-neon);
      background: rgba(154, 205, 50, 0.05);
      box-shadow: inset 0 0 15px rgba(154, 205, 50, 0.1);
    }

    .ingest-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .ingest-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--theme-text-secondary);
    }
    .ingest-title svg { opacity: 0.7; }
    
    .btn-generate-prompt {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: transparent;
      border: 1px solid var(--theme-border);
      color: var(--theme-text-secondary);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      padding: 0.4rem 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-generate-prompt:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--theme-text);
      border-color: rgba(255, 255, 255, 0.2);
    }
    :host-context([data-theme="light"]) .btn-generate-prompt:hover {
      background: rgba(0, 0, 0, 0.05);
      border-color: rgba(0, 0, 0, 0.2);
    }

    .ingest-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .cloud-icon {
      color: var(--theme-text-secondary);
      margin-bottom: 0.5rem;
      transition: all 0.3s;
    }
    .card-ingest.dragging .cloud-icon, .card-ingest.ctrl-active .cloud-icon {
      color: var(--theme-brand-neon);
      transform: scale(1.1);
    }
    .ingest-main-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--theme-text-secondary);
      margin: 0;
    }
    .ingest-sub-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 400;
      color: var(--theme-text-secondary);
      margin: 0 0 1rem 0;
    }
    .btn-explore-files {
      background: var(--theme-brand-neon);
      color: #000;
      border: none;
      border-radius: 12px;
      padding: 0.5rem 1.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(154, 205, 50, 0.2);
      transition: all 0.2s;
    }
    .btn-explore-files:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(154, 205, 50, 0.4);
    }
    :host-context([data-theme="light"]) .btn-explore-files {
      background: #6eaf0b;
      color: #fff;
    }
    :host-context([data-theme="light"]) .btn-explore-files:hover {
      background: #5c9309;
      box-shadow: 0 6px 20px rgba(110, 175, 11, 0.4);
    }

    /* SPRINT SECTION */
    .glow-orb {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 140px; height: 140px;
      background: radial-gradient(circle, rgba(154, 205, 50, 0.1) 0%, transparent 70%);
      filter: blur(30px); z-index: -1;
    }
    .bolt-icon { font-size: 3rem; opacity: 0.8; }
    .btn-sprint-main {
      background: var(--accent); color: #000; border: none;
      padding: 0.75rem 1.75rem; border-radius: 12px;
      font-size: 0.8rem; font-weight: 950; cursor: pointer;
      box-shadow: 0 4px 15px rgba(154, 205, 50, 0.3);
      transition: all 0.2s;
    }
    .btn-sprint-main:hover { transform: scale(1.05); box-shadow: 0 8px 25px rgba(154, 205, 50, 0.4); }
    .stress-meter { width: 120px; }
    .meter-bar { height: 2px; background: rgba(255,255,255,0.05); border-radius: 10px; position: relative; overflow: hidden; margin-bottom: 0.3rem; }
    .meter-bar::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 85%; background: var(--accent); opacity: 0.4; }

    /* TRIAGE QUEUE */
    .header-micro-technical {
      padding: 1.15rem 1.25rem;
      display: flex; align-items: center; gap: 0.6rem;
      background: var(--theme-surface);
      border-bottom: 2px solid var(--theme-border);
    }
    .header-micro-technical .label-micro, .header-micro-technical .material-symbols-rounded { opacity: 0.6; }
    .body-list { padding: 0.4rem 0; height: 100%; position: relative; z-index: 2; }
    .triage-item {
      padding: 0.65rem 1.25rem;
      display: flex; align-items: center; gap: 0.9rem;
      cursor: pointer; transition: background 0.2s;
    }
    .triage-item:hover { background: rgba(255,255,255,0.02); }
    .triage-status { width: 6px; height: 6px; border-radius: 50%; background: #2a2a2a; }
    .triage-status.overdue { background: #ff4444; box-shadow: 0 0 6px #ff4444; }
    .triage-name { font-size: 0.72rem; font-weight: 800; flex: 1; color: var(--theme-text); opacity: 0.95; }
    .triage-count { font-family: 'Fira Code', monospace; font-size: 0.68rem; font-weight: 950; color: var(--theme-brand-neon); opacity: 0.8; }
    .empty-state { 
      height: 160px; display: flex; flex-direction: column; align-items: center; justify-content: center; 
      opacity: 0.6; color: var(--theme-text); 
    }
    :host-context([data-theme="light"]) .empty-state {
      opacity: 0.8;
      font-weight: 600;
    }
    .empty-state span { font-size: 2rem; margin-bottom: 0.4rem; }
    .empty-state p { font-size: 0.6rem; font-weight: 950; letter-spacing: 2px; }

    /* HEATMAP */
    .heatmap-container { padding: 1.25rem; display: flex; align-items: center; justify-content: center; height: calc(100% - 40px); position: relative; z-index: 2; }
    .heatmap-svg { width: 100%; max-width: 740px; }
    .heat-node { cursor: pointer; transition: transform 0.2s; }
    .heat-node:hover { transform: scale(1.15); }

    /* WIDGETS */
    .widget-square { height: 100%; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 2; }
    .widget-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .widget-value { font-size: 2rem; font-weight: 950; letter-spacing: -1px; color: var(--theme-text); }
    .widget-value.mono { font-family: 'Fira Code', monospace; font-size: 1.6rem; }
    .widget-mastery { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; z-index: 2; }
    .circular-progress { position: relative; width: 70px; height: 70px; }
    .chart-svg { transform: rotate(-90deg); }
    .circle-bg { fill: none; stroke: var(--theme-border); stroke-width: 2.5; }
    .circle-fg { fill: none; stroke: var(--theme-brand-neon); stroke-width: 2.5; stroke-linecap: round; transition: stroke-dasharray 1s ease-out; }
    .perc-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 950; font-family: 'Fira Code', monospace; color: var(--theme-text); }

    /* VAULTS & FLUX */
    .vault-tokens { display: flex; flex-wrap: wrap; gap: 0.4rem; position: relative; z-index: 2; }
    .vault-token {
      background: var(--theme-border);
      border: 1px solid var(--theme-border);
      padding: 0.38rem 0.7rem; border-radius: 8px;
      display: flex; align-items: center; gap: 0.4rem;
      font-size: 0.68rem; font-weight: 900; color: var(--theme-text-secondary);
    }
    .vault-token span:first-child { font-size: 0.8rem; opacity: 0.4; }
    .flux-viz { flex: 1; height: 35px; padding-top: 4px; position: relative; z-index: 2; }
    .flux-svg { width: 100%; height: 100%; }

    /* MISC & UTILS */
    .label-micro { font-size: 0.75rem; font-weight: 950; letter-spacing: 2px; opacity: 0.8; color: var(--theme-text); text-transform: uppercase; font-family: 'Fira Code', monospace; transition: opacity 0.3s; }
    .ico-mini { font-size: 1.25rem; opacity: 0.8; color: var(--theme-text); transition: opacity 0.3s; }
    .size-mini { font-size: 0.85rem; }
    kbd { background: var(--theme-surface-solid); border-radius: 4px; padding: 0.1rem 0.25rem; border: 1px solid var(--theme-border); font-family: inherit; font-size: 0.6rem; color: var(--theme-text-secondary); }
    .neon-text { color: var(--accent); text-shadow: 0 0 10px rgba(154, 205, 50, 0.2); }
    .clickable { cursor: pointer; }
    .mb-1 { margin-bottom: 0.5rem; }
    .mt-1 { margin-top: 0.4rem; }

    :host-context([data-theme="light"]) .label-micro,
    :host-context([data-theme="light"]) .ico-mini,
    :host-context([data-theme="light"]) .triage-name,
    :host-context([data-theme="light"]) .vault-token,
    :host-context([data-theme="light"]) .status-pill {
      font-weight: 950;
      opacity: 1;
    }

    /* MODAL UI */
    .cc-input, .cc-select {
      width: 100%; padding: 0.45rem 0.7rem; background: var(--theme-input-bg); border: 1px solid var(--theme-border);
      border-radius: 6px; color: var(--theme-text); font-family: 'Inter', sans-serif; font-size: 0.8rem;
    }
    .cc-input:focus, .cc-select:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 15px rgba(154, 205, 50, 0.1); }
    .modal-body label { font-size: 0.55rem; font-weight: 950; opacity: 0.6; letter-spacing: 1px; margin-bottom: 0.4rem; display: block; color: var(--theme-text); }
    .input-group { margin-bottom: 1.25rem; }
    
    /* MODALS SYSTEM BASE */
    .cc-modal-backdrop {
      position: fixed; inset: 0; 
      background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
    }
    :host-context([data-theme="light"]) .cc-modal-backdrop {
      background: rgba(255, 255, 255, 0.5);
    }
    
    .cc-modal {
      background: var(--theme-surface-solid);
      border: 1px solid var(--theme-border);
      border-radius: 20px;
      padding: 2rem;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      position: relative;
    }
    :host-context([data-theme="light"]) .cc-modal {
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .modal-header h3 { margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; font-weight: 800; color: var(--theme-text); letter-spacing: -0.5px; }
    .btn-close { 
      position: absolute; top: 1.5rem; right: 1.5rem;
      background: transparent; border: none; font-size: 1.8rem; color: var(--theme-text-secondary); 
      cursor: pointer; transition: all 0.2s ease; line-height: 0;
      width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding-bottom: 4px;
    }
    .btn-close:hover { background: rgba(255, 255, 255, 0.1); color: #ff4444; }
    :host-context([data-theme="light"]) .btn-close:hover { background: rgba(0, 0, 0, 0.08); }
    
    .modal-footer { margin-top: 1.5rem; display: flex; justify-content: flex-end; }
    
    .btn-text-upload {
      background: var(--theme-brand-neon); 
      border: 1px solid rgba(0,0,0,0.1); 
      color: #111;
      border-radius: 12px;
      padding: 0.8rem 1.5rem;
      font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 1rem; 
      cursor: pointer; transition: all 0.2s ease; letter-spacing: -0.5px;
      display: flex; align-items: center; justify-content: center; gap: 0.6rem;
    }
    .btn-text-upload:disabled { 
      background: rgba(255,255,255,0.05); border: 1px solid var(--theme-border);
      color: var(--theme-text-secondary); opacity: 0.5; cursor: not-allowed; 
    }
    .btn-text-upload:not(:disabled):hover { 
      background: #7cb342; /* A nicer, richer green on hover */
      transform: translateY(-2px); 
      box-shadow: 0 4px 15px rgba(154, 205, 50, 0.4);
    }
    
    :host-context([data-theme="light"]) .btn-text-upload {
      background: #6eaf0b; color: #fff; border: none;
    }
    :host-context([data-theme="light"]) .btn-text-upload:disabled {
      background: rgba(0,0,0,0.05); color: rgba(0,0,0,0.4); border: 1px solid rgba(0,0,0,0.1);
    }
    :host-context([data-theme="light"]) .btn-text-upload:not(:disabled):hover {
      background: #5c9309; box-shadow: 0 4px 15px rgba(110, 175, 11, 0.4); color: #fff;
    }
    
    /* MODAL UPLOAD UX */
    .combo-dropdown {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0;
      background: var(--theme-surface-solid); border: 1px solid var(--theme-border);
      border-radius: 8px; z-index: 10; max-height: 150px; overflow-y: auto;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .combo-item {
      padding: 0.6rem 1rem; font-size: 0.8rem; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--theme-text);
    }
    .combo-item:last-child { border-bottom: none; }
    .combo-item:hover { background: rgba(154, 205, 50, 0.1); color: var(--theme-brand-neon); }
    .relative { position: relative; }

    .kpi-banner { 
      display: flex; justify-content: space-around; background: rgba(154, 205, 50, 0.05); 
      border: 1px solid rgba(154, 205, 50, 0.2); border-radius: 12px; padding: 0.8rem 1.5rem; margin-bottom: 1rem;
    }
    .kpi-banner.error { background: rgba(255, 68, 68, 0.05); border-color: rgba(255, 68, 68, 0.2); }
    .kpi-item { display: flex; flex-direction: column; align-items: center; }
    .kpi-label { font-size: 0.65rem; font-family: 'Fira Code', monospace; opacity: 0.6; margin-bottom: 0.2rem; color: var(--theme-text); text-transform: uppercase; }
    .kpi-val { font-size: 1.2rem; font-weight: 900; font-family: 'JetBrains Mono', monospace;  color: var(--theme-text); }
    .kpi-banner.error .kpi-val.status-text { color: #ff4444; }
    .kpi-banner:not(.error) .kpi-val.status-text { color: var(--theme-brand-neon); }

    .payload-editor-container {
      background: rgba(0,0,0,0.2); border: 1px solid var(--theme-border); border-radius: 12px; overflow: hidden;
    }
    :host-context([data-theme="light"]) .payload-editor-container {
      background: rgba(0,0,0,0.02);
    }
    .editor-toolbar {
      display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 1rem;
      border-bottom: 1px solid var(--theme-border); background: rgba(255,255,255,0.02);
    }
    :host-context([data-theme="light"]) .editor-toolbar {
      background: rgba(0,0,0,0.02);
    }
    .btn-micro {
      background: transparent; border: 1px solid var(--theme-border); color: var(--theme-text-secondary);
      border-radius: 6px; padding: 0.2rem 0.6rem; font-size: 0.65rem; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; font-family: 'JetBrains Mono', monospace;
    }
    .btn-micro:hover { background: rgba(154, 205, 50, 0.1); color: var(--theme-brand-neon); border-color: var(--theme-brand-neon); }
    .cc-textarea {
      width: 100%; height: 180px; padding: 1rem; background: transparent; border: none; color: var(--theme-text);
      font-size: 0.85rem; resize: none; margin: 0;
    }
    .cc-textarea:focus { outline: none; }
    .mono { font-family: 'Fira Code', monospace; line-height: 1.4; }
    
    .code-editor-backdrop { position: absolute; inset: 0; padding: 1rem; color: #d4d4d4; white-space: pre-wrap; font-family: 'Fira Code', monospace; font-size: 0.85rem; line-height: 1.4; overflow-y: hidden; overflow-x: hidden; pointer-events: none; word-wrap: normal; word-break: break-all; margin: 0; text-rendering: optimizeLegibility; }
    .code-editor-front { position: absolute; inset: 0; padding: 1rem; color: transparent !important; background: transparent !important; caret-color: #fff; font-family: 'Fira Code', monospace; font-size: 0.85rem; line-height: 1.4; border: none; outline: none; resize: none; word-wrap: normal; word-break: break-all; margin: 0; }
    :host-context([data-theme="light"]) .code-editor-front { caret-color: #000; }
    :host-context([data-theme="light"]) .code-editor-backdrop { color: #333; }

    .status-pill-validation { display: inline-flex; align-items: center; font-size: 0.7rem; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
    .status-pill-validation.esperando { background: rgba(255, 204, 0, 0.1); color: #ffcc00; border: 1px solid rgba(255,204,0,0.2); }
    .status-pill-validation.success { background: rgba(110, 175, 11, 0.1); color: var(--theme-brand-neon); border: 1px solid rgba(110,175,11,0.2); }
    .status-pill-validation.error { background: rgba(255, 68, 68, 0.1); color: #ff4444; border: 1px solid rgba(255,68,68,0.2); }
    :host-context([data-theme="light"]) .status-pill-validation.esperando { background: #fff8e1; color: #f57f17; border-color: #ffe082; }
    :host-context([data-theme="light"]) .status-pill-validation.success { background: #f1f8e9; color: #5c9309; border-color: #c5e1a5; }
    :host-context([data-theme="light"]) .status-pill-validation.error { background: #ffebee; color: #b71c1c; border-color: #ef9a9a; }

    .btn-json-tool {
      color: var(--theme-brand-neon) !important; border-color: rgba(110,175,11,0.3) !important; background: transparent !important; cursor: pointer; transition: all 0.2s ease;
    }
    .btn-json-tool:hover {
      background: rgba(110,175,11,0.1) !important; color: #a4c866 !important; border-color: var(--theme-brand-neon) !important;
      box-shadow: 0 0 10px rgba(110,175,11, 0.2); transform: translateY(-1px);
    }
    
    .error-text { color: #ff4444; font-size: 0.75rem; text-align: center; margin-bottom: 1rem; font-weight: 600; }
    
    .row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .input-group.half { flex: 1; min-width: 200px; }

    /* V2 COMPILER UI & TOGGLES */
    .compiler-modal .cc-label {
      display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;
      font-weight: 800; color: var(--theme-text); margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 1px; opacity: 1;
    }
    
    .compiler-modal { padding: 3rem; box-sizing: border-box; overflow-x: hidden; background: #131313; border-color: rgba(255,255,255,0.05); }
    :host-context([data-theme="light"]) .compiler-modal { background: var(--theme-surface-solid) !important; border-color: var(--theme-border) !important; }
    
    .compiler-preview-text {
      width: 100%; height: 100%; min-height: 400px; resize: none; font-size: 0.75rem; background: transparent; border: none; color: #a1a1aa; transition: opacity 0.5s ease;
    }
    :host-context([data-theme="light"]) .compiler-preview-text { color: var(--theme-text) !important; }
    
    .compiler-theme-input { background: var(--glass-fill); border: 1px solid var(--theme-border); color: var(--theme-text); }
    :host-context([data-theme="light"]) .compiler-theme-input { background: rgba(0,0,0,0.02) !important; color: var(--theme-text) !important; border: 1px solid rgba(0,0,0,0.1) !important; }
    
    .compiler-matrix { border: 1px solid var(--theme-border); }
    :host-context([data-theme="light"]) .compiler-matrix { border-color: rgba(0,0,0,0.1) !important; }

    .compiler-layout { display: grid; grid-template-columns: 1.15fr 1fr; gap: 3rem; }
    @media (max-width: 1024px) {
      .compiler-layout { grid-template-columns: 1fr; }
      .compiler-modal { padding: 1.5rem; }
    }
    
    .custom-select-wrapper { position: relative; width: 100%; user-select: none; z-index: 10; }
    .custom-select-wrapper.active-wrapper { z-index: 1000; }
    .select-trigger { display: flex; align-items: center; justify-content: space-between; padding: 0.45rem 0.7rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 600; }
    .select-trigger:hover, .select-trigger.active { border-color: var(--theme-brand-neon); }
    .select-dropdown { position: absolute; top: calc(100% + 5px); left: 0; width: 100%; background: #1a1a1e; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; z-index: 1000; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
    :host-context([data-theme="light"]) .select-dropdown { background: #fff; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .select-option { padding: 0.8rem 1rem; display: flex; flex-direction: column; gap: 0.3rem; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s; }
    :host-context([data-theme="light"]) .select-option { border-bottom: 1px solid rgba(0,0,0,0.05); }
    .select-option:last-child { border-bottom: none; }
    .select-option:hover { background: rgba(154, 205, 50, 0.15); }
    .opt-label { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--theme-text); font-size: 0.9rem; }
    .opt-desc { font-family: 'Open Sans', 'Inter', sans-serif; font-size: 0.75rem; color: var(--theme-text-secondary); opacity: 0.9; }

    .select-arrow { color: var(--theme-text); opacity: 0.95; width: 24px; height: 24px; transition: transform 0.2s; }
    .select-trigger.active .select-arrow { transform: rotate(180deg); filter: drop-shadow(0 0 5px var(--theme-brand-neon)); }
    :host-context([data-theme="light"]) .select-arrow { color: var(--theme-text) !important; opacity: 0.8 !important; }
    
    .magic-btn:hover { background: rgba(154, 205, 50, 0.15) !important; color: var(--theme-brand-neon) !important; border-color: var(--theme-brand-neon) !important; box-shadow: 0 0 15px rgba(154, 205, 50, 0.3); }

    .copier-btn:not(:disabled):hover { color: #fff !important; transform: none !important; background: transparent !important; box-shadow: none !important; border: none !important; }
    :host-context([data-theme="light"]) .copier-btn:not(:disabled):hover { color: var(--theme-brand-neon) !important; }

    /* ANIMATED TOGGLES */
    .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; margin: 0; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
    .toggle-switch .slider {
      position: absolute; cursor: pointer; inset: 0;
      background-color: rgba(255, 255, 255, 0.1); 
      transition: background-color .3s cubic-bezier(0.4, 0.0, 0.2, 1), border-color .3s ease;
      border-radius: 34px; border: 1px solid rgba(255,255,255,0.05);
    }
    .toggle-switch .slider:before {
      position: absolute; content: ""; height: 18px; width: 18px;
      left: 2px; bottom: 2px; background-color: #f4f4f5;
      transition: transform .3s cubic-bezier(0.4, 0.0, 0.2, 1), background-color .3s ease;
      border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .toggle-switch input:checked + .slider { background-color: var(--theme-brand-neon); border-color: var(--theme-brand-neon); box-shadow: 0 0 10px rgba(110, 175, 11, 0.2); }
    .toggle-switch input:checked + .slider:before { transform: translateX(20px); background-color: #ffffff; }
    :host-context([data-theme="light"]) .toggle-switch .slider { background-color: rgba(0, 0, 0, 0.15); border-color: rgba(0,0,0,0.05); }
    :host-context([data-theme="light"]) .toggle-switch .slider:before { background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }

    @keyframes pulse { 0% { opacity: 0.2; transform: scale(0.95); } 50% { opacity: 0.6; transform: scale(1.05); } 100% { opacity: 0.2; transform: scale(0.95); } }
  `]

})
export class CommandCenterComponent implements OnInit {
  private readonly db = inject(DatabaseService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly cdr = inject(ChangeDetectorRef);
  isDark$ = this.themeService.isDark$;
  icons = NAV_ICONS;

  // Dashboard Data
  dueModules: any[] = [];
  recentVaults: any[] = [];
  heatmapNodes: any[] = [];
  streak: number = 0;
  apiCallsToday: number = 14; // Mock
  masteryRatio: number = 0;
  retentionPath: string = '';
  sparklinePath: string = '';

  showNivelSelect = false;
  showAuditorSelect = false;
  showIdiomaSelect = false;

  niveles: { value: any, label: string, desc: string }[] = [
    { value: 'Aprendiz', label: 'Junior', desc: 'Preguntas de retención teórica directa y conceptos básicos.' },
    { value: 'Intermedio', label: 'Medium', desc: 'Preguntas de aplicación de conceptos en contextos medianos y casos de uso.' },
    { value: 'Senior', label: 'Senior', desc: 'Preguntas de diseño de sistemas, arquitectura profunda y performance.' }
  ];
  auditores: { value: any, label: string, desc: string }[] = [
    { value: 'Socrático', label: 'Socrático', desc: 'Te guía a la respuesta con pistas lógicas deductivas y analogías.' },
    { value: 'Implacable', label: 'Implacable', desc: 'Estilo revisión de código en GitHub, directo y al grano. Evalúa rudo.' },
    { value: 'Académico', label: 'Académico', desc: 'Cita documentación oficial, RFCs y principios computacionales rigurosos.' }
  ];
  idiomas: { value: any, label: string, desc: string }[] = [
    { value: 'Español', label: 'Español', desc: 'El prompt output será generado en Castellano/Español.' },
    { value: 'Inglés', label: 'English', desc: 'Generates the rigorous structured prompt internally in English.' }
  ];

  getNivelLabel() { return this.niveles.find(n => n.value === this.compiler.nivel)?.label || 'Seleccionar...'; }
  getAuditorLabel() { return this.auditores.find(a => a.value === this.compiler.auditor)?.label || 'Seleccionar...'; }
  getIdiomaLabel() { return this.idiomas.find(i => i.value === this.compiler.idioma)?.label || 'Seleccionar...'; }

  @HostListener('document:click', ['$event'])
  closeSelectDropdowns(e: Event) {
    const target = e.target as HTMLElement;
    if (!target.closest('.custom-select-wrapper')) {
      this.showNivelSelect = false;
      this.showAuditorSelect = false;
      this.showIdiomaSelect = false;
    }
  }

  // Pomodoro
  pomoTime: string = '25:00';
  pomo = { seconds: 1500, running: false, interval: null as any };

  // UI State
  isDragging = false;
  isCtrlPressed = false;
  showUploadModal = false;
  temporaryUploadPayload = '';
  
  availableThemes: FolderTheme[] = [];
  filteredThemes: FolderTheme[] = [];
  showThemeDropdown = false;
  
  uploadConfig = {
    themeName: '',
    themeId: '',
    quizTitle: ''
  };

  uploadStats = {
    nodeCount: 0,
    isValid: false,
    errorMessage: '',
    charCount: 0,
    uniqueTypes: 0,
    schemaErrors: 0
  };
  
  showCompiler = false;
  isCopied = false;
  injectionStatus: 'idle' | 'success' | 'error' = 'idle';
  injectionMsg = '';

  compiler: PromptConfigV2 = {
    tema: '',
    nivel: 'Intermedio',
    totalPreguntas: 50,
    auditor: 'Socrático',
    idioma: 'Español',
    tagsExtra: '',
    adjuntarDocs: false,
    incluirPistas: false,
    forzarJsonRaw: false,
    matrix: {
      single_choice: 10,
      cloze_deletion: 10,
      ordering: 10,
      optimization: 5,
      feynman_synthesis: 5,
      multi_choice: 2,
      output_prediction: 4,
      anomaly_detection: 2,
      case_analysis: 2
    }
  };

  distribuirAzar() {
    // Zero out matrix
    const keys = Object.keys(this.compiler.matrix) as (keyof typeof this.compiler.matrix)[];
    keys.forEach(k => this.compiler.matrix[k] = 0);
    
    let remaining = this.compiler.totalPreguntas;
    while(remaining > 0) {
      const idx = Math.floor(Math.random() * keys.length);
      this.compiler.matrix[keys[idx]]++;
      remaining--;
    }
  }

  get matrixSum(): number {
    return Object.values(this.compiler.matrix).reduce((a, b) => a + (b || 0), 0);
  }

  get isCompilerValid(): boolean {
    return this.compiler.tema.trim().length > 0 && this.matrixSum === this.compiler.totalPreguntas;
  }

  get livePromptPreview(): string {
    return this.isCompilerValid 
      ? buildPromptV2(this.compiler) 
      : '⚠️ ERROR DE VALIDACIÓN: La suma de preguntas en la matriz debe cuadrar matemáticamente con el Total de Preguntas, y el Tema no puede estar vacío.\\n\\nAjusta los valores para visualizar el prompt en vivo.';
  }

  async ngOnInit() {
    await this.refreshAllData();
    this.generateMockHeatmap();
    this.generateRetentionPath();
    this.generateSparkline();
  }

  async refreshAllData() {
    this.dueModules = await this.db.getDueNodesSummary();
    this.recentVaults = await this.db.getRecentFolders(3);
    const activity = await this.db.getDailyActivity(365);
    this.masteryRatio = await this.db.getMasteryRatio();
    
    // Calcular racha
    let currentStreak = 0;
    const sortedActivity = [...activity].reverse();
    for (const day of sortedActivity) {
      if (day.count > 0) currentStreak++;
      else if (day.date === new Date().toISOString().split('T')[0]) continue;
      else break;
    }
    this.streak = currentStreak;
  }

  getY(i: number): number {
    return Math.floor(i / 52);
  }

  generateMockHeatmap() {
    // 52 semanas * 7 días = 364 días
    this.heatmapNodes = Array.from({ length: 364 }, (_, i) => ({
      date: `Day ${i}`,
      count: Math.floor(Math.random() * 20)
    }));
  }

  getHeatColor(count: number): string {
    const isDark = !document.body.classList.contains('light-theme') && document.body.getAttribute('data-theme') !== 'light';
    if (count === 0) return isDark ? '#111411' : '#e9ecef';
    if (count < 5) return 'rgba(159, 255, 34, 0.2)';
    if (count < 15) return 'rgba(159, 255, 34, 0.5)';
    return '#9FFF22';
  }

  generateRetentionPath() {
    // Simulación suave de curva
    let p = 'M 0 150';
    for (let x = 0; x <= 600; x += 10) {
      const y = 50 + 80 * Math.exp(-x / 200) + Math.sin(x/50)*5;
      p += ` L ${x} ${150 - y}`;
    }
    p += ' L 600 150 Z';
    this.retentionPath = p;
  }

  generateSparkline() {
    let p = 'M 0 25';
    for (let x = 0; x <= 100; x += 10) {
      const y = 10 + Math.random() * 15;
      p += ` L ${x} ${30 - y}`;
    }
    this.sparklinePath = p;
  }

  togglePomo() {
    this.pomo.running = !this.pomo.running;
    if (this.pomo.running) {
       this.pomo.interval = setInterval(() => {
         if (this.pomo.seconds > 0) {
           this.pomo.seconds--;
           const m = Math.floor(this.pomo.seconds / 60);
           const s = this.pomo.seconds % 60;
           this.pomoTime = `${m}:${s.toString().padStart(2, '0')}`;
         } else {
           this.togglePomo();
         }
       }, 1000);
    } else {
      clearInterval(this.pomo.interval);
    }
  }

  async openCompilerModal() {
    this.showCompiler = true;
  }

  copyPromptBtn() {
    if (!this.isCompilerValid || this.isCopied) return;
    const finalPrompt = buildPromptV2(this.compiler);
    navigator.clipboard.writeText(finalPrompt).then(() => {
      this.isCopied = true;
      this.cdr.detectChanges(); // Force angular lifecycle to update the checkmark immediately
      setTimeout(() => { 
        this.isCopied = false; 
        this.cdr.detectChanges(); 
      }, 2500);
    }).catch(err => {
      console.error('Failed to copy to clipboard', err);
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Control' || e.metaKey || e.ctrlKey) {
      this.isCtrlPressed = true;
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent) {
    if (e.key === 'Control' || (!e.ctrlKey && !e.metaKey)) {
      this.isCtrlPressed = false;
    }
  }

  @HostListener('window:paste', ['$event'])
  onPaste(e: ClipboardEvent) {
    if (this.showUploadModal) return; // Prevent overwriting if user is typing inside the modal
    const text = e.clipboardData?.getData('text');
    if (text) {
      this.isCtrlPressed = false; // Release hover safely
      this.openUploadModal(text);
    }
  }

  onDragEnter(e: DragEvent) { e.preventDefault(); this.isDragging = true; }
  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging = true; }
  onDragLeave(e: DragEvent) { this.isDragging = false; }
  async onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file && file.name.endsWith('.json')) {
      const text = await file.text();
      this.openUploadModal(text);
    }
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.json')) {
      const text = await file.text();
      this.openUploadModal(text);
    }
    event.target.value = ''; // Reset input
  }

  async openUploadModal(text: string) {
    this.temporaryUploadPayload = text;
    this.uploadConfig = { themeName: '', themeId: '', quizTitle: '' };
    this.showUploadModal = true;
    
    // Load themes from DB
    this.availableThemes = await this.db.getRecentFolders(100);
    this.filteredThemes = [...this.availableThemes];
    
    this.analyzePayload();
  }

  hideThemeDropdownDelay() {
    setTimeout(() => this.showThemeDropdown = false, 200);
  }

  filterThemes() {
    this.showThemeDropdown = true;
    const q = this.uploadConfig.themeName.toLowerCase();
    this.filteredThemes = this.availableThemes.filter(t => t.nombre_tema.toLowerCase().includes(q));
    
    // Check if exact match to set ID or clear it
    const exact = this.availableThemes.find(t => t.nombre_tema.toLowerCase() === q);
    this.uploadConfig.themeId = exact ? exact.folder_id : '';
  }

  selectTheme(t: FolderTheme) {
    this.uploadConfig.themeName = t.nombre_tema;
    this.uploadConfig.themeId = t.folder_id;
    this.showThemeDropdown = false;
  }

  onPayloadInput() {
    this.analyzePayload();
  }

  syncEditorScroll(e: Event) {
    const front = e.target as HTMLElement;
    const back = front.previousElementSibling as HTMLElement;
    if (back && back.classList.contains('code-editor-backdrop')) {
      back.scrollTop = front.scrollTop;
      back.scrollLeft = front.scrollLeft;
    }
  }

  get highlightedPayload() {
    if (!this.temporaryUploadPayload) return '';
    let html = this.temporaryUploadPayload.replace(/[<>&]/g, (c: string) => {
       const m: any = { '<': '&lt;', '>': '&gt;', '&': '&amp;' };
       return m[c];
    });
    // Syntax Highlight Colors (VS Code style)
    html = html.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
      let color = '#b5cea8';
      let fontStyle = 'normal';
      if (/^"/.test(match)) {
          if (/:$/.test(match)) { color = '#9cdcfe'; fontStyle = 'normal'; }
          else { color = '#ce9178'; fontStyle = 'normal'; }
      } else if (/true|false/.test(match)) { color = '#569cd6'; fontStyle = 'normal'; }
      else if (/null/.test(match)) { color = '#c586c0'; fontStyle = 'italic'; }
      return `<span style="color: ${color}; font-style: ${fontStyle};">${match}</span>`;
    });
    return html;
  }

  analyzePayload() {
    this.uploadStats.charCount = this.temporaryUploadPayload.length;
    
    // XSS and strict check based on RF.md / RNF.md
    const maliciousPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|on\w+\s*=/gi;
    if (maliciousPattern.test(this.temporaryUploadPayload)) {
        this.uploadStats.isValid = false;
        this.uploadStats.errorMessage = 'ALERTA SEGURIDAD: Payload bloqueado por contener código malicioso (XSS).';
        this.uploadStats.nodeCount = 0;
        return;
    }

    if (!this.temporaryUploadPayload.trim()) {
      this.uploadStats.isValid = false;
      this.uploadStats.errorMessage = 'El payload está vacío.';
      this.uploadStats.nodeCount = 0;
      return;
    }

    try {
      const parsed = JSON.parse(this.temporaryUploadPayload);
      const nodes = Array.isArray(parsed) ? parsed : (parsed.nodos || parsed.nodes || []);
      
      if (!Array.isArray(nodes) || nodes.length === 0) {
         this.uploadStats.isValid = false;
         this.uploadStats.errorMessage = 'Estructura inválida. No se detectó un arreglo de nodos.';
         this.uploadStats.nodeCount = 0;
         this.uploadStats.schemaErrors = 0;
         this.uploadStats.uniqueTypes = 0;
         return;
      }
      
      // Strict structural validation
      let errors = 0;
      const types = new Set<string>();
      
      nodes.forEach((n: any) => {
         if (typeof n !== 'object' || n === null || Array.isArray(n)) {
            errors++;
            return;
         }
         
         // Zod-like check
         if (!('pregunta' in n || 'tipo_reto' in n || 'contexto' in n)) errors++;
         if (n.tipo_reto) types.add(n.tipo_reto);
      });
      
      this.uploadStats.uniqueTypes = types.size;
      this.uploadStats.schemaErrors = errors;

      if (errors > 0 || types.size === 0) {
         this.uploadStats.isValid = false;
         this.uploadStats.errorMessage = `Se detectaron ${errors} nodos con errores críticos de Schema (llaves omitidas o incompletas).`;
         this.uploadStats.nodeCount = nodes.length;
         return;
      }

      this.uploadStats.nodeCount = nodes.length;
      this.uploadStats.isValid = true;
      this.uploadStats.errorMessage = '';
    } catch (e) {
      this.uploadStats.isValid = false;
      this.uploadStats.errorMessage = 'Formato JSON Inválido. Error de parseo.';
      this.uploadStats.nodeCount = 0;
      this.uploadStats.schemaErrors = 0;
      this.uploadStats.uniqueTypes = 0;
    }
  }

  formatPastedJson() {
    try {
      if (!this.temporaryUploadPayload.trim()) return;
      const parsed = JSON.parse(this.temporaryUploadPayload);
      this.temporaryUploadPayload = JSON.stringify(parsed, null, 2);
      this.onPayloadInput(); // Re-trigger validation
    } catch(e) {
      // If invalid, try to use the normalizer first
      this.normalizeJson();
      try {
         const parsed = JSON.parse(this.temporaryUploadPayload);
         this.temporaryUploadPayload = JSON.stringify(parsed, null, 2);
         this.onPayloadInput();
      } catch(e2) {
         // Silently ignore if formatting still fails
      }
    }
  }

  normalizeJson() {
    try {
      let text = this.temporaryUploadPayload.trim();
      
      // Intentar extraer solo el bloque JSON (de { a } o de [ a ])
      const firstBrace = text.indexOf('{');
      const firstBracket = text.indexOf('[');
      const lastBrace = text.lastIndexOf('}');
      const lastBracket = text.lastIndexOf(']');
      
      let firstCharIndex = -1;
      let lastCharIndex = -1;

      if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
         firstCharIndex = firstBrace;
         lastCharIndex = lastBrace;
      } else if (firstBracket !== -1) {
         firstCharIndex = firstBracket;
         lastCharIndex = lastBracket;
      }

      if (firstCharIndex !== -1 && lastCharIndex !== -1 && lastCharIndex > firstCharIndex) {
         text = text.substring(firstCharIndex, lastCharIndex + 1);
      }

      // 1. Reemplazar comas sueltas antes de cerrar llaves/corchetes
      text = text.replace(/,(?=\s*[}\]])/g, '');
      
      // 2. Intentar reemplazar comillas simples por dobles (riesgoso si hay texto con apostrofes, pero util si el JSON usa apostrofes para claves/valores)
      // Lo dejaremos fuera por ahora y forzaremos agregar comillas a CLAVES de objeto sin comillas
      text = text.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

      // Comprobar si funciona
      JSON.parse(text);
      this.temporaryUploadPayload = text;
      this.analyzePayload();
      
      // Sobreescribir feedback si fue exitoso (analyzePayload lo resetea a vacío)
      if (this.uploadStats.isValid) {
        this.uploadStats.errorMessage = '';
      }
    } catch {
      this.uploadStats.errorMessage = 'Normalización fallida. El JSON necesita revisión manual.';
    }
  }

  async confirmUpload() {
    if (!this.uploadStats.isValid) return;
    
    let fId = this.uploadConfig.themeId;
    if (!fId) {
       fId = crypto.randomUUID();
       // Save new folder
       await this.db.saveFolder({
          folder_id: fId,
          nombre_tema: this.uploadConfig.themeName,
          color_tag: '#9ACD32', // default neon theme
          creado_en: new Date().toISOString()
       });
    }

    try {
      const parsed = JSON.parse(this.temporaryUploadPayload);
      const nodesRaw = Array.isArray(parsed) ? parsed : (parsed.nodos || parsed.nodes);
      
      const quizId = crypto.randomUUID();
      
      // Inject IDs and Dates correctly
      const nodesToSave = nodesRaw.map((n: any) => ({
         ...n,
         id_temp: n.id_temp || crypto.randomUUID(),
         folder_id: fId,
         quiz_id: quizId,
         nextReviewDate: new Date(),
         createdAt: new Date()
      }));

      await this.db.saveNodes(nodesToSave);
      
      this.showUploadModal = false;
      this.injectionStatus = 'success';
      this.injectionMsg = `¡${nodesToSave.length} Nodos cargados al sistema!`;
      this.refreshAllData();
      
      // Hide toast
      setTimeout(() => this.injectionStatus = 'idle', 4000);
      
    } catch (e) {
      this.uploadStats.errorMessage = 'Error fatal al guardar los nodos en IndexedDB.';
      this.uploadStats.isValid = false;
    }
  }

  async processInjection(jsonStr: string) {
    try {
      const payload = JSON.parse(jsonStr);
      const nodes = Array.isArray(payload) ? payload : (payload.nodos || []);
      if (nodes.length > 0) {
        await this.db.saveNodes(nodes.map((n: any) => ({ ...n, nextReviewDate: new Date() })));
        this.injectionStatus = 'success';
        this.injectionMsg = `¡${nodes.length} Nodos Inyectados!`;
        this.refreshAllData();
      }
    } catch (e) {
      this.injectionStatus = 'error';
      this.injectionMsg = 'Formato JSON Inválido';
    }
    setTimeout(() => this.injectionStatus = 'idle', 3000);
  }

  startSprint(folderId: string) {
    this.router.navigate(['/simulator'], { queryParams: { folder: folderId } });
  }

  startInterleaving() {
    this.router.navigate(['/simulator'], { queryParams: { interleaving: 'true' } });
  }
}
