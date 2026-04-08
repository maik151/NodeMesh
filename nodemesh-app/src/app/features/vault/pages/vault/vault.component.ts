import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { FolderTheme, NodeChallenge, QuizSession } from '../../../../core/models/node.model';
import { Router } from '@angular/router';
import { VaultSidebarComponent } from '../../components/vault-sidebar/vault-sidebar.component';
import { QuizPreviewComponent } from '../../components/quiz-preview/quiz-preview.component';

@Component({
  selector: 'app-vault',
  standalone: true,
  imports: [CommonModule, FormsModule, VaultSidebarComponent, QuizPreviewComponent],
  template: `
    <div class="vault-shell">
      <!-- SIDEBAR EXPLORER -->
      <app-vault-sidebar
        [folders]="allFolders"
        [quizzesByFolder]="folderQuizzes"
        [activeThemeId]="selectedTheme?.folder_id || null"
        [activeQuizId]="selectedQuiz?.quiz_id || null"
        [isLoading]="isLoadingData"
        [isCollapsed]="sidebarCollapsed"
        (onCreateTheme)="createInlineTheme($event)"
        (onUpdateTheme)="updateInlineTheme($event)"
        (onRefresh)="loadData()"
        (onToggleCollapse)="sidebarCollapsed = !sidebarCollapsed"
        (onDeleteTheme)="confirmDeleteFolder($event)"
        (onSelectQuiz)="selectQuiz($event)"
        (onDeleteQuiz)="deleteQuiz($event)">
      </app-vault-sidebar>

      <!-- MAIN CONTENT AREA -->
      <main class="vault-main scroll-custom">
        <!-- Empty State -->
        <div class="workspace-centered" *ngIf="!selectedQuiz">
           <div class="empty-hero">
              <svg class="hero-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                <path d="M216,40H40A16,16,0,0,0,24,56V216a8,8,0,0,0,11.58,7.16L64,208.94l28.42,14.22a8,8,0,0,0,7.16,0L128,208.94l28.42,14.22a8,8,0,0,0,7.16,0L192,208.94l28.42,14.22A8,8,0,0,0,232,216V56A16,16,0,0,0,216,40Zm0,163.06-20.42-10.22a8,8,0,0,0-7.16,0L160,207.06l-28.42-14.22a8,8,0,0,0-7.16,0L96,207.06,67.58,192.84a8,8,0,0,0-7.16,0L40,203.06V56H216ZM60.42,167.16a8,8,0,0,0,10.74-3.58L76.94,152h38.12l5.78,11.58a8,8,0,1,0,14.32-7.16l-32-64a8,8,0,0,0-14.32,0l-32,64A8,8,0,0,0,60.42,167.16ZM96,113.89,107.06,136H84.94ZM136,128a8,8,0,0,1,8-8h16V104a8,8,0,0,1,16,0v16h16a8,8,0,0,1,0,16H176v16a8,8,0,0,1-16,0V136H144A8,8,0,0,1,136,128Z"/>
              </svg>
              <h2>Abre un Test para comenzar</h2>
              <p>Selecciona un tema o test en el explorador lateral para acceder al ecosistema. Todo tu contenido está protegido y sincronizado localmente.</p>
           </div>
        </div>

        <!-- Quiz Preview -->
        <app-quiz-preview
          *ngIf="selectedQuiz"
          [quiz]="selectedQuiz"
          [folder]="selectedFolder"
          [isSidebarCollapsed]="sidebarCollapsed"
          (onToggleSidebar)="sidebarCollapsed = !sidebarCollapsed"
          (onPlayQuiz)="playQuiz($event)"
          (onEditQuiz)="editQuiz($event)"
          (onDeleteNode)="deleteNode($event)">
        </app-quiz-preview>
      </main>
    </div>
  `,
  styles: [`
    .vault-shell {
      display: flex;
      height: 100vh;
      background: var(--theme-surface-solid);
      color: var(--theme-text);
      overflow: hidden;
    }
    .vault-main {
      flex: 1;
      background: var(--theme-bg-base);
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
      max-width: 600px;
      opacity: 0.4;
      animation: fadeIn 0.5s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .hero-icon {
      width: 180px; height: 180px;
      fill: var(--theme-text-muted);
      margin-bottom: 2rem;
    }
    .empty-hero h2 {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
      font-size: 2rem;
      color: var(--theme-text-muted);
      margin: 0;
      letter-spacing: 1px;
    }
    .empty-hero p {
      font-size: 1.1rem;
      color: var(--theme-text-muted);
      opacity: 0.8;
      margin-top: 1.5rem;
      max-width: 550px;
      line-height: 1.6;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
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

  selectedTheme: FolderTheme | null = null;
  selectedQuiz: QuizSession | null = null;
  selectedFolder: FolderTheme | null = null;

  isLoadingData = true;
  sidebarCollapsed = false;

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.isLoadingData = true;
    this.cdr.detectChanges();
    try {
      this.allFolders = await this.db.getAllFolders();
      for (const f of this.allFolders) {
        this.folderQuizzes[f.folder_id] = await this.db.getQuizzesByFolder(f.folder_id);
      }
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (err) {
      console.error('[Vault] Error loading data:', err);
    } finally {
      this.isLoadingData = false;
      this.cdr.detectChanges();
    }
  }

  async createInlineTheme(data: { nombre_tema: string, color_tag: string }) {
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

  selectQuiz(quiz: QuizSession) {
    this.selectedQuiz = quiz;
    this.selectedFolder = this.allFolders.find(f => f.folder_id === quiz.folder_id) || null;
    this.selectedTheme = this.selectedFolder;
    this.cdr.detectChanges();
  }

  async confirmDeleteFolder(folder: FolderTheme) {
    const quizzesCount = (this.folderQuizzes[folder.folder_id] || []).length;
    let msg = `¿Deseas eliminar el tema "${folder.nombre_tema}"?`;
    if (quizzesCount > 0) msg += `\nESTO BORRARÁ TAMBIÉN ${quizzesCount} TEST(S) Y TODOS SUS NODOS.`;
    if (confirm(msg)) {
      await this.db.deleteFolder(folder.folder_id);
      await this.loadData();
      if (this.selectedTheme?.folder_id === folder.folder_id) {
        this.selectedTheme = null;
        this.selectedQuiz = null;
        this.selectedFolder = null;
      }
    }
  }

  playQuiz(quiz: QuizSession) {
    this.router.navigate(['/simulator'], { queryParams: { quiz: quiz.quiz_id, folder: quiz.folder_id } });
  }

  editQuiz(quiz: QuizSession) {
    console.log('[Vault] Edit quiz:', quiz.titulo_quiz);
  }

  async deleteQuiz(quiz: QuizSession) {
    if (confirm(`¿Eliminar el test "${quiz.titulo_quiz}"?`)) {
      await this.db.deleteQuiz(quiz.quiz_id);
      if (this.selectedQuiz?.quiz_id === quiz.quiz_id) {
        this.selectedQuiz = null;
        this.selectedFolder = null;
      }
      await this.loadData();
    }
  }

  async deleteNode(node: NodeChallenge) {
    if (!node.id) return;
    if (confirm('¿Eliminar este nodo permanentemente?')) {
      await this.db.deleteNode(node.id);
      const tmp = this.selectedQuiz;
      this.selectedQuiz = null;
      this.cdr.detectChanges();
      setTimeout(() => { this.selectedQuiz = tmp; this.cdr.detectChanges(); }, 50);
    }
  }
}
