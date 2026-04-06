import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Force angular compiler to un-stuck
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { FolderTheme, QuizSession } from '../../../../core/models/node.model';
import { Router } from '@angular/router';
import { VaultSidebarComponent } from '../../components/vault-sidebar/vault-sidebar.component';

@Component({
  selector: 'app-vault',
  standalone: true,
  imports: [CommonModule, FormsModule, VaultSidebarComponent],
  template: `
    <div class="vault-shell">
      <!-- SIDEBAR EXPLORER -->
      <app-vault-sidebar
        [folders]="allFolders"
        [quizzesByFolder]="folderQuizzes"
        [activeThemeId]="selectedTheme?.folder_id || null"
        [isLoading]="isLoadingData"
        (onCreateTheme)="createInlineTheme($event)"
        (onUpdateTheme)="updateInlineTheme($event)"
        (onRefresh)="loadData()"
        (onDeleteTheme)="confirmDeleteFolder($event)"
        (onSelectQuiz)="playQuiz($event)"
        (onDeleteQuiz)="deleteQuiz($event)">
      </app-vault-sidebar>

      <!-- MAIN CONTENT AREA -->
      <main class="vault-main scroll-custom">
        <div class="workspace-centered" *ngIf="!isCreating && !selectedTheme">
           <div class="empty-hero">
              <span class="material-symbols-rounded">folder_zip</span>
              <h2>Bóveda de Conocimiento</h2>
              <p>Selecciona un tema en el explorador para gestionar sus tests o crea un nuevo núcleo.</p>
              <button class="btn-primary-neon" (click)="openCreator()">CREAR_NUEVO_NÚCLEO</button>
           </div>
        </div>

        <!-- FORMULARIO DE EDICIÓN/CREACIÓN -->
        <div class="workspace-content" *ngIf="isCreating">
           <header class="workspace-header">
              <h3>REGISTRAR_NUEVO_TEMA</h3>
              <button class="btn-close-ws" (click)="closeCreator()"><span class="material-symbols-rounded">close</span></button>
           </header>

           <div class="form-glass">
              <div class="input-field">
                 <label>NOMBRE_DEL_TEMA</label>
                 <input type="text" [(ngModel)]="folderForm.nombre_tema" placeholder="Ej. Lógica de Programación">
              </div>

              <div class="grid-form">
                 <div class="input-field">
                    <label>COLOR_IDENTIFICADOR</label>
                    <div class="color-picker-v2">
                       <input type="color" [(ngModel)]="folderForm.color_tag">
                       <span class="color-hex mono">{{ folderForm.color_tag }}</span>
                    </div>
                 </div>
                 <div class="input-field">
                    <label>NIVEL_REQUERIDO</label>
                    <select [(ngModel)]="folderForm.nivel">
                       <option value="Aprendiz">Aprendiz</option>
                       <option value="Iniciado">Iniciado</option>
                       <option value="Maestro">Maestro</option>
                    </select>
                 </div>
              </div>

              <div class="form-actions">
                 <button class="btn-secondary" (click)="closeCreator()">CANCELAR</button>
                 <button class="btn-primary-neon" (click)="saveFolder()" [disabled]="!folderForm.nombre_tema">
                    CREAR_NÚCLEO
                 </button>
              </div>
           </div>
        </div>

        <!-- DETALLES DEL TEMA SELECCIONADO (Opcional, si se quiere ver mas que solo el Sidebar) -->
        <!-- Por ahora mantenemos la UI limpia enfocada en el CRUD de la Bóveda -->
      </main>
    </div>
  `,
  styles: [`
    .vault-shell {
      display: flex;
      height: 100vh;
      background: #0d1117;
      color: #fff;
      overflow: hidden;
    }

    .vault-main {
      flex: 1;
      background: #010409; /* VS Code Main Area */
      position: relative;
      overflow-y: auto;
    }

    .workspace-centered {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .empty-hero {
      max-width: 400px;
      opacity: 0.6;
      animation: fadeIn 0.5s ease;
    }

    .empty-hero span { font-size: 4rem; color: var(--theme-brand-neon); margin-bottom: 1rem; }
    .empty-hero h2 { font-weight: 800; font-size: 1.5rem; margin-bottom: 0.5rem; }
    .empty-hero p { font-size: 0.85rem; line-height: 1.6; margin-bottom: 2rem; }

    .workspace-content {
      padding: 3rem;
      max-width: 800px;
      margin: 0 auto;
      animation: slideUp 0.4s ease;
    }

    .workspace-header { 
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1.5rem;
    }
    .workspace-header h3 { margin: 0; font-weight: 900; letter-spacing: 1px; color: var(--theme-brand-neon); }

    .form-glass {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.06);
      padding: 2.5rem;
      border-radius: 20px;
    }

    .input-field { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem; }
    .input-field label { font-size: 0.7rem; font-weight: 800; opacity: 0.4; letter-spacing: 1px; }
    .input-field input, .input-field select {
      background: #0d1117;
      border: 1px solid #30363d;
      padding: 1rem;
      border-radius: 10px;
      color: #fff;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
    }
    .input-field input:focus { outline: none; border-color: var(--theme-brand-neon); box-shadow: 0 0 10px rgba(159, 255, 34, 0.1); }

    .grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }

    .color-picker-v2 { display: flex; align-items: center; gap: 1rem; background: #0d1117; border: 1px solid #30363d; border-radius: 10px; padding-left: 0.75rem; }
    .color-picker-v2 input[type="color"] { width: 40px; height: 40px; border: none; background: transparent; cursor: pointer; padding: 0; }
    .color-hex { font-size: 0.8rem; opacity: 0.6; }

    .form-actions { display: flex; justify-content: flex-end; gap: 1.5rem; margin-top: 1rem; }

    .btn-primary-neon {
      background: var(--theme-brand-neon);
      color: #000;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 10px;
      font-weight: 800;
      font-family: inherit;
      cursor: pointer;
      transition: 0.2s;
    }
    .btn-primary-neon:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(159, 255, 34, 0.3); }
    .btn-primary-neon:disabled { opacity: 0.3; cursor: not-allowed; }

    .btn-secondary {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.1);
      color: #fff;
      padding: 0.8rem 2rem;
      border-radius: 10px;
      font-family: inherit;
      cursor: pointer;
      transition: 0.2s;
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.05); }

    .btn-close-ws { background: transparent; border: none; color: #fff; opacity: 0.4; cursor: pointer; }
    .btn-close-ws:hover { opacity: 1; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .scroll-custom::-webkit-scrollbar { width: 8px; }
    .scroll-custom::-webkit-scrollbar-track { background: transparent; }
    .scroll-custom::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
  `]
})
export class VaultComponent implements OnInit {
  private readonly db = inject(DatabaseService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  allFolders: FolderTheme[] = [];
  folderQuizzes: { [key: string]: QuizSession[] } = {};
  
  // Selection State
  selectedTheme: FolderTheme | null = null;
  selectedQuiz: QuizSession | null = null;

  // CRUD State
  isCreating = false;
  folderForm: Partial<FolderTheme> = this.resetForm();
  isLoadingData = true;

  async ngOnInit() {
    await this.loadData();
  }

  resetForm(): Partial<FolderTheme> {
    return {
      nombre_tema: '',
      color_tag: '#9FFF22',
      nivel: 'Aprendiz'
    };
  }

  async loadData() {
    this.isLoadingData = true;
    this.cdr.markForCheck(); // In case we use OnPush, mark for check

    this.allFolders = await this.db.getAllFolders();
    for (const f of this.allFolders) {
      this.folderQuizzes[f.folder_id] = await this.db.getQuizzesByFolder(f.folder_id);
    }
    
    // Retraso artificial para que la animación de "Sincronizando Bóveda" se aprecie
    await new Promise(resolve => setTimeout(resolve, 800));

    this.isLoadingData = false;
    this.cdr.detectChanges(); // Force angular to update after async task
  }

  openCreator() {
    this.isCreating = true;
    this.folderForm = this.resetForm();
    this.selectedTheme = null;
  }

  closeCreator() {
    this.isCreating = false;
  }

  async saveFolder() {
    const folder: FolderTheme = {
      ...this.folderForm,
      folder_id: crypto.randomUUID(),
      creado_en: new Date().toISOString()
    } as FolderTheme;

    await this.db.saveFolder(folder);
    await this.loadData();
    this.closeCreator();
  }

  async createInlineTheme(data: {nombre_tema: string, color_tag: string}) {
    const folder: FolderTheme = {
      nombre_tema: data.nombre_tema,
      color_tag: data.color_tag,
      nivel: 'Aprendiz',
      folder_id: crypto.randomUUID(),
      creado_en: new Date().toISOString()
    } as FolderTheme;

    await this.db.saveFolder(folder);
    await this.loadData();
  }

  async updateInlineTheme(folder: FolderTheme) {
    await this.db.saveFolder(folder);
    await this.loadData();
  }

  async confirmDeleteFolder(folder: FolderTheme) {
    const quizzesCount = (this.folderQuizzes[folder.folder_id] || []).length;
    let msg = `¿Deseas eliminar el tema "${folder.nombre_tema}"?`;
    if (quizzesCount > 0) msg += `\nESTO BORRARÁ TAMBIÉN ${quizzesCount} TEST(S) Y TODOS SUS NODOS.`;

    if (confirm(msg)) {
      await this.db.deleteFolder(folder.folder_id);
      await this.loadData();
      if (this.selectedTheme?.folder_id === folder.folder_id) this.selectedTheme = null;
    }
  }

  playQuiz(quiz: QuizSession) {
    this.router.navigate(['/simulator'], { queryParams: { quiz: quiz.quiz_id, folder: quiz.folder_id } });
  }

  async deleteQuiz(quiz: QuizSession) {
    if (confirm(`¿Eliminar el test "${quiz.titulo_quiz}"?`)) {
      await this.db.deleteQuiz(quiz.quiz_id);
      await this.loadData();
    }
  }
}
