import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { CryptoService } from '../../../../core/services/storage/crypto.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { IngestionService } from '../../../../core/services/pipeline/ingestion.service';
import { ToastService } from '../../../../core/services/ui/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-shell scroll-custom">
      <header class="settings-header">
        <div class="h-titles">
          <h1>Configuración General</h1>
          <p>Gestión de infraestructura, seguridad y motores cognitivos</p>
        </div>
      </header>

      <div class="settings-grid">
        
        <!-- LEFT COL: AI Infrastructure -->
        <section class="settings-section main-card">
          <div class="s-header">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="s-icon"><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-88-96a8,8,0,0,1,8,8v64a8,8,0,0,1-16,0V120A8,8,0,0,1,120,112Zm48,0a8,8,0,0,1,8,8v64a8,8,0,0,1-16,0V120A8,8,0,0,1,168,112Z"/></svg>
            <div class="s-info">
              <h3>Infraestructura de Inteligencia</h3>
              <p>Configura las llaves de acceso para los auditores de IA</p>
            </div>
          </div>

          <div class="s-body">
            <div class="provider-bar">
              <button [class.active]="selectedProvider === 'gemini'" (click)="selectedProvider = 'gemini'">
                Google Gemini
              </button>
              <button class="disabled">
                OpenAI (Próximamente)
              </button>
              <button class="disabled">
                Anthropic (Próximamente)
              </button>
            </div>

            <div class="config-field">
              <label>API KEY (Encriptada con AES-256)</label>
              <div class="input-wrap">
                <input 
                  [type]="showKey ? 'text' : 'password'" 
                  [(ngModel)]="apiKey" 
                  placeholder="Introduzca su llave maestra..."
                  class="st-input">
                <button class="eye-btn" (click)="showKey = !showKey">
                   <svg *ngIf="!showKey" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20"><path d="M247.31,124.76c-.35-.79-8.82-19.74-27.65-38.57C194.57,61.11,162.88,48,128,48S61.43,61.11,36.34,86.19c-18.83,18.83-27.3,37.78-27.65,38.57a8,8,0,0,0,0,6.48c.35.79,8.82,19.74,27.65,38.57C61.43,194.89,93.12,208,128,208s66.57-13.11,91.66-38.19c18.83-18.83,27.3-37.78,27.65-38.57a8,8,0,0,0,0-6.48ZM128,192c-30.78,0-58.09-10.79-79.06-31.24C32.14,144.29,24,130.43,24,128c0-2.43,8.14-16.29,24.94-32.76C69.91,74.79,97.22,64,128,64s58.09,10.79,79.06,31.24c16.8,16.47,24.94,30.33,24.94,32.76,0,2.43-8.14,16.29-24.94,32.76-20.97,20.45-48.28,31.24-79.06,31.24Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/></svg>
                   <svg *ngIf="showKey" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20"><path d="M228,175a8,8,0,0,1-10.92-3.08,104,104,0,0,0-178.16,0,8,8,0,1,1-13.84-8,120,120,0,0,1,205.84,0A8,8,0,0,1,228,175Zm19.31-50.24c-.35-.79-8.82-19.74-27.65-38.57C194.57,61.11,162.88,48,128,48S61.43,61.11,36.34,86.19c-18.83,18.83-27.3,37.78-27.65,38.57a8,8,0,0,0,0,6.48c.35.79,8.82,19.74,27.65,38.57C61.43,194.89,93.12,208,128,208s66.57-13.11,91.66-38.19c18.83-18.83,27.3-37.78,27.65-38.57a8,8,0,0,0,0-6.48ZM128,192c-30.78,0-58.09-10.79-79.06-31.24C32.14,144.29,24,130.43,24,128c0-2.43,8.14-16.29,24.94-32.76C69.91,74.79,97.22,64,128,64s58.09,10.79,79.06,31.24c16.8,16.47,24.94,30.33,24.94,32.76,0,2.43-8.14,16.29-24.94,32.76-20.97,20.45-48.28,31.24-79.06,31.24Z"/></svg>
                </button>
              </div>
            </div>

            <div class="st-actions">
              <button class="st-btn-primary" (click)="saveKey()" [disabled]="!apiKey || isSaving">
                {{ isSaving ? 'Guardando...' : 'Sincronizar Llave' }}
              </button>
              <button class="st-btn-secondary" (click)="fetchModels()" [disabled]="!apiKey || isFetching">
                {{ isFetching ? 'Conectando...' : 'Obtener Modelos Disponibles' }}
              </button>
            </div>
            
            <p class="crypto-note">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="12" fill="currentColor"><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-88-96a8,8,0,0,1,8,8v64a8,8,0,0,1-16,0V120A8,8,0,0,1,120,112Zm48,0a8,8,0,0,1,8,8v64a8,8,0,0,1-16,0V120A8,8,0,0,1,168,112Z"/></svg>
              Cifrado AES-256 local mediante UID de sesión
            </p>
          </div>
        </section>

        <!-- RIGHT COL: Available Models List -->
        <section class="settings-section models-card" *ngIf="availableModels.length > 0">
           <div class="s-header">
              <h3>Modelos Disponibles</h3>
              <span class="m-count">{{ availableModels.length }}</span>
           </div>
           <div class="models-list scroll-custom">
              <div *ngFor="let m of availableModels" class="m-row">
                 <div class="m-main">
                    <span class="m-display">{{ m.displayName }}</span>
                    <span class="m-tech-id">{{ m.name.replace('models/', '') }}</span>
                 </div>
                 <div class="m-status">Activo</div>
              </div>
           </div>
        </section>

        <!-- Placeholder Sections -->
        <div class="settings-section placeholder-card">
           <h3>Ajustes de Auditoría</h3>
           <p>Próximamente: Personalidad de los auditores y rigor pedagógico.</p>
        </div>
        
        <div class="settings-section placeholder-card">
           <h3>Exportación de Datos</h3>
           <p>Próximamente: Descargar bóveda en formato binario o JSON.</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .settings-shell { padding: 3rem; background: var(--theme-bg-base); min-height: 100vh; color: #fff; font-family: 'JetBrains Mono', monospace; }
    .settings-header { margin-bottom: 3rem; }
    .settings-header h1 { font-size: 2.2rem; font-weight: 800; color: var(--theme-brand-neon); margin: 0; letter-spacing: -1px; }
    .settings-header p { opacity: 0.6; font-size: 0.95rem; margin-top: 0.5rem; }

    .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; max-width: 1200px; }
    
    .settings-section { background: rgba(18,18,22,0.6); border: 1px solid var(--theme-border); border-radius: 16px; padding: 2rem; }
    .main-card { grid-column: 1; }
    
    .s-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
    .s-icon { width: 32px; height: 32px; fill: var(--theme-brand-neon); }
    .s-info h3 { margin: 0; font-size: 1.1rem; }
    .s-info p { margin: 0.2rem 0 0; font-size: 0.8rem; opacity: 0.5; }

    .provider-bar { display: flex; gap: 0.5rem; margin-bottom: 2rem; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 10px; }
    .provider-bar button { flex: 1; padding: 0.6rem; border: none; background: transparent; color: #777; border-radius: 8px; cursor: pointer; font-size: 0.75rem; font-weight: 700; transition: 0.2s; }
    .provider-bar button.active { background: var(--theme-brand-neon); color: #000; }
    .provider-bar button.disabled { opacity: 0.3; cursor: not-allowed; }

    .config-field label { display: block; font-size: 0.65rem; font-weight: 900; color: var(--theme-text-muted); letter-spacing: 1px; margin-bottom: 0.8rem; }
    .input-wrap { position: relative; }
    .st-input { width: 100%; background: #000; border: 1px solid var(--theme-border); border-radius: 10px; padding: 1rem 3.5rem 1rem 1rem; color: #fff; font-family: inherit; font-size: 0.9rem; outline: none; transition: 0.2s; }
    .st-input:focus { border-color: var(--theme-brand-neon); }
    .eye-btn { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: #555; cursor: pointer; }
    .eye-btn:hover { color: #fff; }

    .st-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
    .st-btn-primary { flex: 1; background: var(--theme-brand-neon); color: #000; border: none; padding: 1rem; border-radius: 10px; font-weight: 800; cursor: pointer; transition: 0.2s; font-size: 0.75rem; }
    .st-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 25px rgba(159, 255, 34, 0.3); }
    .st-btn-secondary { flex: 1; background: transparent; border: 1px solid var(--theme-border); color: #fff; padding: 1rem; border-radius: 10px; cursor: pointer; transition: 0.2s; font-size: 0.75rem; font-weight: 600; }
    .st-btn-secondary:hover:not(:disabled) { background: rgba(255,255,255,0.05); }

    .crypto-note { font-size: 0.65rem; opacity: 0.3; margin-top: 2rem; display: flex; gap: 0.5rem; align-items: center; justify-content: center; }

    .models-card { background: rgba(159, 255, 34, 0.02); border-color: rgba(159, 255, 34, 0.1); }
    .models-card .s-header { justify-content: space-between; margin-bottom: 1.5rem; }
    .m-count { font-size: 0.7rem; font-weight: 900; background: var(--theme-brand-neon); color: #000; padding: 2px 10px; border-radius: 20px; }
    .models-list { max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; padding-right: 10px; }
    .m-row { padding: 1rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; display: flex; justify-content: space-between; align-items: center; border-left: 3px solid var(--theme-brand-neon); }
    .m-main { display: flex; flex-direction: column; }
    .m-display { font-size: 0.85rem; font-weight: 700; color: #fff; }
    .m-tech-id { font-size: 0.65rem; color: #777; }
    .m-status { font-size: 0.6rem; font-weight: 900; text-transform: uppercase; color: var(--theme-brand-neon); opacity: 0.8; }

    .placeholder-card { opacity: 0.4; filter: grayscale(1); cursor: not-allowed; }
    .placeholder-card h3 { font-size: 0.9rem; margin-top: 0; }
    .placeholder-card p { font-size: 0.75rem; color: #888; }

    .scroll-custom::-webkit-scrollbar { width: 6px; }
    .scroll-custom::-webkit-scrollbar-track { background: transparent; }
    .scroll-custom::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
  `]
})
export class SettingsComponent implements OnInit {
  private readonly db = inject(DatabaseService);
  private readonly cryptoService = inject(CryptoService);
  private readonly authService = inject(AuthService);
  private readonly ingestionService = inject(IngestionService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  selectedProvider = 'gemini';
  apiKey = '';
  showKey = false;
  isSaving = false;
  isFetching = false;
  availableModels: any[] = [];

  async ngOnInit() {
    await this.loadCurrentKey();
  }

  async loadCurrentKey() {
    try {
      const encrypted = await this.db.getApiKey(this.selectedProvider);
      if (encrypted) {
        const user = this.authService.getCurrentUser();
        if (user) {
          const keyMaterial = await this.cryptoService.deriveKeyFromUid(user.uid);
          this.apiKey = await this.cryptoService.decrypt(encrypted, keyMaterial);
          if (this.apiKey) this.fetchModels(false);
        }
      }
    } catch (e) {
      console.warn('[Settings] No se pudo cargar la llave:', e);
    }
  }

  async saveKey() {
    if (!this.apiKey) return;
    this.isSaving = true;
    try {
      const user = this.authService.getCurrentUser();
      if (!user) throw new Error('Usuario no identificado');
      
      const keyMaterial = await this.cryptoService.deriveKeyFromUid(user.uid);
      const encrypted = await this.cryptoService.encrypt(this.apiKey, keyMaterial);
      
      await this.db.saveApiKey(this.selectedProvider, encrypted);
      this.toast.success('Infraestructura actualizada y sincronizada.');
    } catch (e: any) {
      this.toast.error('Error de seguridad al guardar: ' + e.message);
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }

  async fetchModels(showToasts = true) {
    if (!this.apiKey) return;
    this.isFetching = true;
    try {
      const models = await this.ingestionService.getAvailableModels(this.apiKey);
      this.availableModels = models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
      if (showToasts) {
         if (this.availableModels.length === 0) {
           this.toast.warning('Llave válida, pero no se encontraron modelos.');
         } else {
           this.toast.success(`Conexión exitosa. ${this.availableModels.length} modelos sincronizados.`);
         }
      }
    } catch (e: any) {
      console.error('[Settings] Error fetching models:', e);
      if (showToasts) this.toast.error('Error de conexión con el proveedor.');
    } finally {
      this.isFetching = false;
      this.cdr.detectChanges();
    }
  }
}
