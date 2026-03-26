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
            <h3 style="display: flex; align-items: center; gap: 0.6rem; color: rgba(255,255,255,0.85);">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M237.66,86.34l-60-60a8,8,0,0,0-11.32,0L37.11,155.57a44.77,44.77,0,0,0,63.32,63.32L212.32,107l22.21-7.4a8,8,0,0,0,3.13-13.25ZM89.11,207.57a28.77,28.77,0,0,1-40.68-40.68l28.8-28.8c8.47-2.9,21.75-4,39.07,5,10.6,5.54,20.18,8,28.56,8.73ZM205.47,92.41a8,8,0,0,0-3.13,1.93l-39.57,39.57c-8.47,2.9-21.75,4-39.07-5-10.6-5.54-20.18-8-28.56-8.73L172,43.31,217.19,88.5Z"></path></svg>
              TEST UPLOAD MODAL
            </h3>
            <button class="btn-close" (click)="showUploadModal = false">×</button>
          </header>
          
          <div class="modal-body">
            
            <div class="row">
              <div class="input-group half relative">
                <label>TEMA (FOLDER)</label>
                <input type="text" [(ngModel)]="uploadConfig.themeName" (focus)="showThemeDropdown=true" (blur)="hideThemeDropdownDelay()" (input)="filterThemes()" placeholder="Escribe o selecciona..." class="cc-input" autocomplete="off">
                <div class="combo-dropdown" *ngIf="showThemeDropdown && filteredThemes.length > 0">
                  <div class="combo-item" *ngFor="let t of filteredThemes" (click)="selectTheme(t)">
                     {{ t.nombre_tema }}
                  </div>
                </div>
              </div>

              <div class="input-group half">
                <label>TÍTULO DEL QUIZ</label>
                <input type="text" [(ngModel)]="uploadConfig.quizTitle" placeholder="Ej. Bases de microservicios" class="cc-input" autocomplete="off">
              </div>
            </div>

            <div class="kpi-banner" [class.error]="!uploadStats.isValid">
               <div class="kpi-item">
                 <span class="kpi-label">NODOS DETECTADOS</span>
                 <span class="kpi-val">{{ uploadStats.nodeCount }}</span>
               </div>
               <div class="kpi-item">
                 <span class="kpi-label">CARACTERES</span>
                 <span class="kpi-val">{{ uploadStats.charCount }}</span>
               </div>
               <div class="kpi-item">
                 <span class="kpi-label">ESTADO JSON</span>
                 <span class="kpi-val status-text">{{ uploadStats.isValid ? 'VÁLIDO' : 'INVÁLIDO' }}</span>
               </div>
            </div>
            
            <div class="error-text" *ngIf="!uploadStats.isValid && uploadStats.errorMessage">
                {{ uploadStats.errorMessage }}
            </div>

            <div class="payload-editor-container">
               <div class="editor-toolbar">
                  <span class="label-micro" style="margin: 0; padding: 0;">PAYLOAD_RAW</span>
                  <button class="btn-micro" (click)="normalizeJson()" title="Intentar reparar JSON dañado o limpiar Markdown">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M48,64a8,8,0,0,1,8-8H72V40a8,8,0,0,1,16,0V56h16a8,8,0,0,1,0,16H88V88a8,8,0,0,1-16,0V72H56A8,8,0,0,1,48,64ZM184,192h-8v-8a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16Zm56-48H224V128a8,8,0,0,0-16,0v16H192a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V160h16a8,8,0,0,0,0-16ZM219.31,80,80,219.31a16,16,0,0,1-22.62,0L36.68,198.63a16,16,0,0,1,0-22.63L176,36.69a16,16,0,0,1,22.63,0l20.68,20.68A16,16,0,0,1,219.31,80Zm-54.63,32L144,91.31l-96,96L68.68,208ZM208,68.69,187.31,48l-32,32L176,100.69Z"></path></svg>
                     NORMALIZAR
                  </button>
               </div>
               <textarea class="cc-textarea mono scroll-hide" [(ngModel)]="temporaryUploadPayload" (ngModelChange)="onPayloadInput()" placeholder="Pega aquí tu lista JSON de nodos..."></textarea>
            </div>
            
          </div>

          <footer class="modal-footer">
             <button class="btn-text-upload" [disabled]="!uploadStats.isValid || !uploadConfig.themeName || !uploadConfig.quizTitle" (click)="confirmUpload()">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0ZM93.66,77.66,120,51.31V144a8,8,0,0,0,16,0V51.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,77.66Z"></path></svg>
               Cargar Quiz
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
                  <div class="matrix-item" title="Aislar una verdad absoluta entre distractores.">
                    <span>Single Choice</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.single_choice" class="cc-input mini compiler-theme-input">
                  </div>
                  <div class="matrix-item" title="Completar la palabra saltante para memoria muscular.">
                    <span>Cloze Deletion</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.cloze_deletion" class="cc-input mini compiler-theme-input">
                  </div>
                  <div class="matrix-item" title="Entender causalidad y ciclos de vida.">
                    <span>Ordering</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.ordering" class="cc-input mini compiler-theme-input">
                  </div>
                  
                  <!-- COLUMN 2 -->
                  <div class="matrix-item" title="Refactorizar hacia eficiencia algorítmica.">
                    <span>Optimization</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.optimization" class="cc-input mini compiler-theme-input">
                  </div>
                  <div class="matrix-item" title="Transferencia de conocimiento sin jerga.">
                    <span>Feynman Synth</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.feynman_synthesis" class="cc-input mini compiler-theme-input">
                  </div>
                  <div class="matrix-item" title="Exige panorama completo; selección de un array de respuestas verdaderas.">
                    <span>Multi Choice</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.multi_choice" class="cc-input mini compiler-theme-input">
                  </div>
                  
                  <!-- COLUMN 3 -->
                  <div class="matrix-item" title="Forzar ejecución y predecir lo que imprimiría.">
                    <span>Output Predict</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.output_prediction" class="cc-input mini compiler-theme-input">
                  </div>
                  <div class="matrix-item" title="Detectar vulnerabilidades o errores ocultos.">
                    <span>Anomaly Detect</span>
                    <input type="number" min="0" [(ngModel)]="compiler.matrix.anomaly_detection" class="cc-input mini compiler-theme-input">
                  </div>
                  <div class="matrix-item" title="Trade-offs y System Design global.">
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
      font-size: 0.85rem; resize: none;
    }
    .cc-textarea:focus { outline: none; }
    .mono { font-family: 'Fira Code', monospace; line-height: 1.4; }
    
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
    charCount: 0
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
         return;
      }
      
      // Strict structural validation
      const isStructurallyValid = nodes.every(n => typeof n === 'object' && n !== null && (!Array.isArray(n)) && ('pregunta' in n || 'tipo_reto' in n || 'contexto' in n));
      
      if (!isStructurallyValid) {
         this.uploadStats.isValid = false;
         this.uploadStats.errorMessage = 'Los datos no coinciden con la estructura esperada: cada nodo debe tener un "tipo_reto" o "pregunta".';
         this.uploadStats.nodeCount = 0;
         return;
      }

      this.uploadStats.nodeCount = nodes.length;
      this.uploadStats.isValid = true;
      this.uploadStats.errorMessage = '';
    } catch (e) {
      this.uploadStats.isValid = false;
      this.uploadStats.errorMessage = 'Formato JSON Inválido. Error de parseo.';
      this.uploadStats.nodeCount = 0;
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
