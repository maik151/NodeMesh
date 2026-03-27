import { Component, EventEmitter, Input, Output, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { FolderTheme } from '../../../../core/models/node.model';

@Component({
  selector: 'app-test-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cc-modal-backdrop" (click)="onCancel.emit()">
      <div class="cc-modal card-glass shadow-bloom" (click)="$event.stopPropagation()" style="width: 90%; max-width: 630px;">
        
        <header class="modal-header">
          <h3 style="color: var(--theme-brand-neon); display: flex; align-items: center; gap: 0.8rem; font-size: 1.5rem; font-weight: 800;">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M240,136v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V136a16,16,0,0,1,16-16H72a8,8,0,0,1,0,16H32v64H224V136H184a8,8,0,0,1,0-16h40A16,16,0,0,1,240,136Zm-117.66-2.34a8,8,0,0,0,11.32,0l48-48a8,8,0,0,0-11.32-11.32L136,108.69V24a8,8,0,0,0-16,0v84.69L85.66,74.34A8,8,0,0,0,74.34,85.66ZM200,168a12,12,0,1,0-12,12A12,12,0,0,0,200,168Z"></path></svg>
            Cargar Test
          </h3>
          <button class="btn-close" (click)="onCancel.emit()" title="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
          </button>
        </header>

        <div class="modal-body" style="padding-top: 0.5rem;">
          <div class="row-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div class="input-group" style="position: relative;">
              <label class="cc-label">Tema:</label>
              <div style="position: relative; display: flex; align-items: center;">
                 <input type="text" [(ngModel)]="uploadConfig.themeName" (input)="filterThemes()" (focus)="showThemeDropdown = true" (blur)="hideThemeDropdownDelay()" placeholder="Nombre del Tema / Carpeta..." class="cc-input" style="width: 100%; border-radius: 8px; padding-right: 3.5rem;">
                 <svg style="position: absolute; right: 16px; opacity: 0.6; color: var(--theme-brand-neon);" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              
              <div class="theme-dropdown card-glass shadow-bloom" *ngIf="showThemeDropdown && filteredThemes.length > 0">
                 <div class="theme-option" *ngFor="let theme of filteredThemes" (click)="selectTheme(theme)">
                    <span class="theme-dot" [style.background]="theme.color_tag"></span>
                    <span class="theme-name">{{ theme.nombre_tema }}</span>
                 </div>
              </div>
            </div>

            <div class="input-group">
              <label class="cc-label">Título del Quiz:</label>
              <input type="text" [(ngModel)]="uploadConfig.quizTitle" placeholder="Nombre descriptivo de esta sesión..." class="cc-input" style="width: 100%; border-radius: 8px;">
            </div>
          </div>

          <div class="metrics-track" style="display: flex; gap: 1rem; margin-bottom: 1.25rem; padding: 0.85rem 1.25rem; background: rgba(159, 255, 34, 0.04); border-radius: 16px; border: 1px solid rgba(159, 255, 34, 0.1); backdrop-filter: blur(5px);">
            <div class="metric-item">
              <span class="m-label">Nodos JSON</span>
              <span class="m-value">{{ uploadStats.nodeCount }}</span>
            </div>
            <div class="m-divider"></div>
            <div class="metric-item">
              <span class="m-label">Retos</span>
              <span class="m-value">{{ uploadStats.uniqueTypes }}</span>
            </div>
            <div class="m-divider"></div>
            <div class="metric-item">
              <span class="m-label">Esquema</span>
              <span class="m-value" [style.color]="uploadStats.schemaErrors > 0 ? '#ff4b4b' : 'var(--theme-brand-neon)'">{{ uploadStats.schemaErrors }}</span>
            </div>
            <div class="m-divider"></div>
            <div class="metric-item">
              <span class="m-label">Bytes</span>
              <span class="m-value">{{ (uploadStats.charCount / 1024).toFixed(1) }}k</span>
            </div>
          </div>

          <div class="input-group" style="margin-top: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.5rem;">
               <label class="cc-label" style="margin: 0; font-size: 0.95rem; opacity: 0.9; text-transform: none; letter-spacing: 0;">JSON :</label>
               
               <div class="status-pill waiting" *ngIf="!payload.trim()">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M200,80V48a16,16,0,0,0-16-16H72A16,16,0,0,0,56,48V80a16,16,0,0,0,6.06,12.53L113.17,128,62.06,163.47A16,16,0,0,0,56,176v32a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V176a16,16,0,0,0-6.06-12.53L142.83,128l51.11-35.47A16,16,0,0,0,200,80ZM72,48H184V80H72ZM184,208H72V176l56-38.61,55.61,38.61h0.39Z"></path></svg>
                 Esperando Payload
               </div>

               <div class="status-pill success" *ngIf="payload.trim() && uploadStats.isValid">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M232.49,80.49l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,1,1,11.32-11.32L96,188.69,221.17,63.51a8,8,0,0,1,11.32,11.32Z"></path></svg>
                 Válido
               </div>

               <div class="status-pill error" *ngIf="payload.trim() && !uploadStats.isValid">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M236.8,188.09,149.35,36.22a16,16,0,0,0-26.7,0L35.2,188.09a16,16,0,0,0,13.35,23.91H223.45a16,16,0,0,0,13.35-23.91ZM128,176a12,12,0,1,1,12-12A12,12,0,0,1,128,176Zm8-40a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z"></path></svg>
                  Errores Detectados
               </div>

               <div style="flex: 1;"></div>

               <div style="display: flex; gap: 0.4rem;">
                   <button class="btn-micro-pill" (click)="formatPastedJson()" title="Evaluar JSON">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M229.5,113,166.06,89.94,143,26.5a16,16,0,0,0-30,0L89.94,89.94,26.5,113a16,16,0,0,0,0,30l63.44,23.07L113,229.5a16,16,0,0,0,30,0l23.07-63.44L229.5,143a16,16,0,0,0,0-30ZM157.08,152.3a8,8,0,0,0-4.78,4.78L128,223.9l-24.3-66.82a8,8,0,0,0-4.78-4.78L32.1,128l66.82-24.3a8,8,0,0,0,4.78-4.78L128,32.1l24.3,66.82a8,8,0,0,0,4.78,4.78L128,32.1l24.3,66.82a8,8,0,0,0,4.78,4.78L223.9,128Z"></path></svg>
                     Evaluar
                   </button>
                   <button class="btn-micro-pill" (click)="payload = ''" title="Limpiar">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M225,80.4,183.6,39a24,24,0,0,0-33.94,0L31,157.66a24,24,0,0,0,0,33.94l30.06,30.06A8,8,0,0,0,66.74,224H216a8,8,0,0,0,0-16h-84.7L225,114.34A24,24,0,0,0,225,80.4ZM108.68,208H70.05L42.33,180.28a8,8,0,0,1,0-11.31L96,115.31,148.69,168Zm105-105L160,156.69,107.31,104,161,50.34a8,8,0,0,1,11.32,0l41.38,41.38a8,8,0,0,1,0,11.31Z"></path></svg>
                     Limpiar
                   </button>
               </div>
            </div>
            
            <div class="error-box-critical" *ngIf="payload.trim() && !uploadStats.isValid">
                <div class="error-box-header">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-120a16,16,0,1,1-16-16A16,16,0,0,1,144,96Zm-8,32v48a8,8,0,0,1-16,0V128a8,8,0,0,1,16,0Z"></path></svg>
                  DETALLES TÉCNICOS DEL ERROR
                </div>
                <div class="error-box-content">{{ uploadStats.errorMessage || 'Error de estructura desconocido' }}</div>
            </div>

            <div class="payload-editor-container" style="position: relative; height: 160px; margin-top: 0.5rem; border-radius: 8px;">
               <div class="code-editor-backdrop" [innerHTML]="highlightedPayload"></div>
               <textarea class="cc-textarea code-editor-front" spellcheck="false" [(ngModel)]="payload" (ngModelChange)="onPayloadInput()" (scroll)="syncEditorScroll($event)" placeholder="(JSON ya pegado aqui)"></textarea>
            </div>
          </div>
        </div>

        <footer class="modal-footer" style="justify-content: flex-end; margin-top: 1.25rem;">
          <button class="btn-text-upload" [disabled]="!uploadStats.isValid || !uploadConfig.themeName || !uploadConfig.quizTitle" (click)="confirmUpload()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0ZM93.66,77.66,120,51.31V144a8,8,0,0,0,16,0V51.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,77.66Z"></path></svg>
            Inyectar a la Bóveda
          </button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .cc-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; animation: fadeIn 0.3s ease; }
    .cc-modal { background: #0a0a0a; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 1.5rem 1.75rem; position: relative; animation: slideUp 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.2); font-size: 12px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.07); padding-bottom: 1rem; }
    .btn-close {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.5);
      width: 32px; height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .btn-close:hover { background: rgba(255,68,68,0.15); border-color: rgba(255,68,68,0.4); color: #ff6b6b; }
    .cc-label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 800; color: var(--theme-text-secondary); margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 1px; }
    .cc-input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: var(--theme-text); padding: 0.6rem 0.8rem; font-family: inherit; font-size: 0.85rem; transition: all 0.2s; box-sizing: border-box; }
    .cc-input:focus { outline: none; border-color: var(--theme-brand-neon); background: rgba(159, 255, 34, 0.05); }
    .theme-dropdown { position: absolute; top: calc(100% + 5px); left: 0; width: 100%; z-index: 50; max-height: 200px; overflow-y: auto; background: #151515; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 0.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .theme-option { display: flex; align-items: center; gap: 0.8rem; padding: 0.6rem 0.8rem; border-radius: 8px; cursor: pointer; transition: 0.2s; }
    .theme-option:hover { background: rgba(255,255,255,0.05); }
    .theme-dot { width: 10px; height: 10px; border-radius: 50%; }
    .theme-name { font-size: 0.85rem; font-weight: 600; color: var(--theme-text); }
    .payload-editor-container { position: relative; background: #000; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; overflow: hidden; }
    .code-editor-backdrop, .code-editor-front { position: absolute; inset: 0; padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; tab-size: 2; border: none; resize: none; width: 100%; height: 100%; box-sizing: border-box; }
    .code-editor-front { background: transparent; color: transparent; caret-color: var(--theme-brand-neon); outline: none; z-index: 2; }
    .code-editor-backdrop { color: #888; z-index: 1; pointer-events: none; overflow-y: auto; }
    .btn-micro { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: var(--theme-text-secondary); padding: 0.4rem 0.8rem; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .btn-micro:hover { background: rgba(255,255,255,0.1); color: var(--theme-text); }
    
    .btn-action-micro {
      background: rgba(30, 30, 30, 0.6);
      border: 1px solid rgba(159, 255, 34, 0.2);
      color: var(--theme-brand-neon);
      padding: 0.45rem 0.75rem;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }
    .btn-action-micro:hover {
      background: rgba(159, 255, 34, 0.1);
      border-color: var(--theme-brand-neon);
      transform: translateY(-1px);
    }

    .metrics-track {
      font-family: 'JetBrains Mono', monospace;
      display: flex;
      align-items: center;
    }
    .metric-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .m-label { font-size: 0.65rem; color: var(--theme-brand-neon); opacity: 0.6; text-transform: uppercase; margin-bottom: 2px; font-weight: 700; }
    .m-value { font-size: 1.1rem; font-weight: 800; color: var(--theme-brand-neon); }
    .m-divider { width: 1px; height: 24px; background: rgba(159, 255, 34, 0.15); }

    .btn-micro-pill {
      background: rgba(30,30,30,0.4);
      border: 1px solid rgba(255,255,255,0.08);
      color: var(--theme-text-secondary);
      padding: 0.35rem 0.8rem;
      border-radius: 100px;
      font-size: 0.7rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }
    .btn-micro-pill:hover {
      border-color: var(--theme-brand-neon);
      color: var(--theme-brand-neon);
      background: rgba(159, 255, 34, 0.05);
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.68rem;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-pill.waiting { background: rgba(90, 95, 0, 0.4); color: #e5ff00; border: 1px solid rgba(229, 255, 0, 0.2); }
    .status-pill.success { background: rgba(26, 77, 0, 0.4); color: #9fff22; border: 1px solid rgba(159, 255, 34, 0.2); }
    .status-pill.error { background: rgba(77, 0, 0, 0.4); color: #ff6b6b; border: 1px solid rgba(255, 107, 107, 0.2); }

    .error-box-critical {
      background: rgba(255, 68, 68, 0.08);
      border: 1px solid rgba(255, 68, 68, 0.2);
      border-left: 4px solid #ff4b4b;
      padding: 0.8rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
    }
    .error-box-header {
      color: #ff8e8e;
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.4rem;
    }
    .error-box-content {
      color: #fca5a5;
      font-size: 0.85rem;
      font-family: 'JetBrains Mono', monospace;
      line-height: 1.4;
    }
    
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
      40%, 60% { transform: translate3d(4px, 0, 0); }
    }

    :host-context([data-theme="light"]) .error-box-critical { background: #fff5f5; border-color: #fca5a5; }
    :host-context([data-theme="light"]) .error-box-header { color: #b91c1c; }
    :host-context([data-theme="light"]) .error-box-content { color: #7f1d1d; }

    :host-context([data-theme="light"]) .metrics-track { background: rgba(0,0,0,0.03) !important; border-color: rgba(0,0,0,0.1) !important; }
    :host-context([data-theme="light"]) .m-label, 
    :host-context([data-theme="light"]) .m-value { color: #3a7d0a; }
    :host-context([data-theme="light"]) .m-divider { background: rgba(0,0,0,0.1); }
    :host-context([data-theme="light"]) .status-pill.waiting { background: #fdfde6; color: #858a00; border: 1px solid #e5e8a0; }
    :host-context([data-theme="light"]) .status-pill.success { background: #f0fce8; color: #3a7d0a; border: 1px solid #c2e5a0; }
    :host-context([data-theme="light"]) .status-pill.error { background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; }
    :host-context([data-theme="light"]) .error-detail-banner { background: #fff5f5; color: #b91c1c; border-color: #fca5a5; }
    :host-context([data-theme="light"]) .btn-micro-pill { background: #fff; border-color: #ddd; color: #555; }
    :host-context([data-theme="light"]) .btn-micro-pill:hover { border-color: #3a7d0a; color: #3a7d0a; }

    .btn-text-upload { background: var(--theme-brand-neon); color: var(--theme-brand-btn-text); border: none; padding: 0.7rem 1.25rem; border-radius: 12px; font-weight: 900; font-size: 0.9rem; display: flex; align-items: center; gap: 0.6rem; cursor: pointer; transition: 0.3s; margin-left: auto; }
    .btn-text-upload:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 0 20px rgba(159, 255, 34, 0.4); }
    .btn-text-upload:disabled { opacity: 0.3; cursor: not-allowed; filter: grayscale(1); }
    .modal-footer { display: flex; align-items: center; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

    /* ===== LIGHT MODE ===== */
    :host-context([data-theme="light"]) .cc-modal-backdrop { background: rgba(100,100,120,0.45); }
    :host-context([data-theme="light"]) .cc-modal { background: #f4f5f7; border-color: #d1d5db; }
    :host-context([data-theme="light"]) .modal-header { border-bottom-color: #d1d5db; }
    :host-context([data-theme="light"]) .cc-label { color: #5a6272; }
    :host-context([data-theme="light"]) .cc-input { background: #ffffff; border-color: #d1d5db; color: #1a1a2e; }
    :host-context([data-theme="light"]) .cc-input:focus { border-color: #3a7d0a; background: #f0fce8; }
    :host-context([data-theme="light"]) .theme-dropdown { background: #fff; border-color: #d1d5db; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    :host-context([data-theme="light"]) .theme-option:hover { background: #f0fce8; }
    :host-context([data-theme="light"]) .theme-name { color: #1a1a2e; }
    :host-context([data-theme="light"]) .upload-metrics-bar { background: rgba(0,0,0,0.03) !important; border-color: rgba(0,0,0,0.15) !important; }
    :host-context([data-theme="light"]) .payload-editor-container { background: #f8f8f8; border-color: #d1d5db; }
    :host-context([data-theme="light"]) .code-editor-backdrop { color: #555; }
    :host-context([data-theme="light"]) .code-editor-front { caret-color: #3a7d0a; }
    :host-context([data-theme="light"]) .btn-micro { background: #ffffff; border-color: #d1d5db; color: #5a6272; }
    :host-context([data-theme="light"]) .btn-micro:hover { background: #f0fce8; color: #3a7d0a; }
    :host-context([data-theme="light"]) .btn-close { color: #5a6272; background: #ffffff; border-color: #d1d5db; }
    :host-context([data-theme="light"]) .btn-close:hover { background: rgba(220,53,69,0.1); border-color: rgba(220,53,69,0.3); color: #dc3545; }
  `]
})
export class TestUploadComponent implements OnInit {
  private readonly db = inject(DatabaseService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() payload = '';
  @Output() onCancel = new EventEmitter<void>();
  @Output() onUploadSuccess = new EventEmitter<string>();

  uploadConfig = { themeName: '', themeId: '', quizTitle: '' };
  uploadStats = { nodeCount: 0, isValid: false, errorMessage: '', charCount: 0, uniqueTypes: 0, schemaErrors: 0 };
  
  availableThemes: FolderTheme[] = [];
  filteredThemes: FolderTheme[] = [];
  showThemeDropdown = false;

  async ngOnInit() {
    this.availableThemes = await this.db.getRecentFolders(100);
    this.filteredThemes = [...this.availableThemes];
    if (this.payload) this.analyzePayload();
  }

  onPayloadInput() { this.analyzePayload(); }

  analyzePayload() {
    this.uploadStats.isValid = false;
    this.uploadStats.errorMessage = '';
    this.uploadStats.charCount = this.payload.length;
    
    if (!this.payload.trim()) {
      this.uploadStats.errorMessage = 'El payload está vacío.';
      return;
    }

    try {
      const parsed = JSON.parse(this.payload);
      
      // 1. EXTRAER METADATA (Auto-fill)
      const meta = parsed.metadata || {};
      const folder = parsed.folder || {};
      const isSigned = meta.signature === 'nodemesh-v1';

      if (meta.titulo_quiz && !this.uploadConfig.quizTitle) {
        this.uploadConfig.quizTitle = meta.titulo_quiz;
      }
      if (folder.nombre_tema && !this.uploadConfig.themeName) {
         this.uploadConfig.themeName = folder.nombre_tema;
         this.uploadConfig.themeId = folder.folder_id || '';
      }

      // 2. VALIDACIÓN XSS (Permitir snippets técnicos en payloads firmados)
      if (!isSigned) {
        const HighRiskXSS = /<script\b[^>]*>([\s\S]*?)<\/script>|javascript:|onerror\s*=|onload\s*=/gi;
        if (HighRiskXSS.test(this.payload)) {
            this.uploadStats.errorMessage = 'ALERTA SEGURIDAD: XSS Detectado.';
            return;
        }
      }

      // 3. DETECTAR NODOS
      const nodes = Array.isArray(parsed) ? parsed : (parsed.nodos || parsed.nodes || []);
      if (!Array.isArray(nodes) || nodes.length === 0) {
         this.uploadStats.isValid = false;
         this.uploadStats.errorMessage = 'No se detectó un flujo de nodos válido.';
         return;
      }
      
      let nodeErrors: string[] = [];
      const types = new Set<string>();
      
      nodes.forEach((n: any, idx: number) => {
         if (typeof n !== 'object' || n === null) { nodeErrors.push(`Nodo[${idx}]: No es objeto`); return; }
         const hasContent = !!(n.pregunta || n.contexto || n.pregunta_cloze || n.pregunta_ordering);
         const hasAnswer = !!(n.respuesta_esperada || n.respuesta_correcta || n.opciones || n.matriz_correcta);
         if (!hasContent) nodeErrors.push(`Nodo[${idx}]: Falta pregunta/contexto`);
         else if (!hasAnswer) nodeErrors.push(`Nodo[${idx}]: Falta respuesta/opciones`);
         if (n.tipo_reto) types.add(n.tipo_reto);
      });
      
      this.uploadStats.uniqueTypes = types.size;
      this.uploadStats.schemaErrors = nodeErrors.length;
      this.uploadStats.nodeCount = nodes.length;

      if (nodeErrors.length > 0) {
         this.uploadStats.isValid = nodeErrors.length < nodes.length; // Permitir carga parcial solo si hay mayoría válida
         this.uploadStats.errorMessage = `${nodeErrors.length} errores: ${nodeErrors[0]}${nodeErrors.length > 1 ? '...' : ''}`;
         if (nodeErrors.length === nodes.length) return;
      }

      this.uploadStats.isValid = true;
      this.cdr.detectChanges();

    } catch (e: any) {
      this.uploadStats.isValid = false;
      const msg = e.message || '';
      const lineMatch = msg.match(/at position (\d+)/);
      if (lineMatch) {
        const pos = parseInt(lineMatch[1], 10);
        const line = this.payload.substring(0, pos).split('\n').length;
        this.uploadStats.errorMessage = `Error de sintaxis near line ${line}: ${msg}`;
      } else {
        this.uploadStats.errorMessage = `JSON Inválido: ${msg}`;
      }
    }
  }

  get highlightedPayload(): string {
     if (!this.payload) return '';
     return this.payload
       .replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
         let color = '#ce9178';
         if (match.endsWith(':')) color = '#9cdcfe';
         else if (/true|false/.test(match)) color = '#569cd6';
         else if (/null/.test(match)) color = '#c586c0';
         return `<span style="color: ${color};">${match}</span>`;
       });
  }

  syncEditorScroll(e: Event) {
    const front = e.target as HTMLElement;
    const back = front.previousElementSibling as HTMLElement;
    if (back) back.scrollTop = front.scrollTop;
  }

  filterThemes() {
    this.showThemeDropdown = true;
    const q = this.uploadConfig.themeName.toLowerCase();
    this.filteredThemes = this.availableThemes.filter(t => t.nombre_tema.toLowerCase().includes(q));
  }

  hideThemeDropdownDelay() { setTimeout(() => this.showThemeDropdown = false, 200); }

  selectTheme(theme: any) {
    this.uploadConfig.themeName = theme.nombre_tema;
    this.uploadConfig.themeId = theme.folder_id;
    this.showThemeDropdown = false;
  }

  formatPastedJson() {
    this.normalizeJson();
    try {
      const parsed = JSON.parse(this.payload);
      this.payload = JSON.stringify(parsed, null, 2);
      this.analyzePayload(); // Re-analizar después de formatear
    } catch {}
    this.cdr.detectChanges();
  }

  normalizeJson() {
    try {
      let text = this.payload.trim();
      if (!text) return;

      // Si ya es JSON válido, no tocar nada
      try { JSON.parse(text); return; } catch {}

      const firstBrace = text.indexOf('{');
      const firstBracket = text.indexOf('[');
      const lastBrace = text.lastIndexOf('}');
      const lastBracket = text.lastIndexOf(']');
      let firstCharIndex = -1;
      let lastCharIndex = -1;
      
      if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) { firstCharIndex = firstBrace; lastCharIndex = lastBrace; }
      else if (firstBracket !== -1) { firstCharIndex = firstBracket; lastCharIndex = lastBracket; }
      
      if (firstCharIndex !== -1 && lastCharIndex !== -1 && lastCharIndex > firstCharIndex) { 
        text = text.substring(firstCharIndex, lastCharIndex + 1); 
      }
      
      text = text.replace(/,(?=\s*[}\]])/g, '');
      text = text.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
      
      JSON.parse(text);
      this.payload = text;
      this.analyzePayload();
    } catch {
      // Si la normalización falla, dejamos el payload como está para que analyzePayload reporte el error de sintaxis original
    }
  }

  async confirmUpload() {
    if (!this.uploadStats.isValid) return;
    const parsed = JSON.parse(this.payload);
    const folder = parsed.folder || {};
    
    let fId = this.uploadConfig.themeId || folder.folder_id;
    if (!fId) {
       fId = crypto.randomUUID();
       await this.db.saveFolder({ 
         folder_id: fId, 
         nombre_tema: this.uploadConfig.themeName, 
         color_tag: folder.color_tag || '#9ACD32', 
         creado_en: new Date().toISOString() 
       });
    } else {
       const existing = await this.db.getNodesBySource(fId); // Fallback probe to see if folder exists effectively
       await this.db.saveFolder({ 
         folder_id: fId, 
         nombre_tema: this.uploadConfig.themeName, 
         color_tag: folder.color_tag || '#9ACD32', 
         creado_en: new Date().toISOString() 
       });
    }

    const nodesRaw = Array.isArray(parsed) ? parsed : (parsed.nodos || parsed.nodes);
    const quizId = parsed.metadata?.quiz_id || crypto.randomUUID();

    const nodesToSave = nodesRaw.map((n: any) => ({ 
      ...n, 
      id_temp: n.id_temp || crypto.randomUUID(), 
      folder_id: fId, 
      quiz_id: quizId,
      nextReviewDate: new Date(), 
      createdAt: new Date() 
    }));

    await this.db.saveNodes(nodesToSave);
    this.onUploadSuccess.emit(`¡${nodesToSave.length} Nodos inyectados con éxito!`);
  }
}
