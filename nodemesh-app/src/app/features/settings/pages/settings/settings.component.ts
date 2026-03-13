import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Configuración</h1>
      <p>Control central de la infraestructura NodeMesh.</p>
      <div class="placeholder-card">
        <span class="material-symbols-rounded">settings</span>
        <div class="sub-sections">
          <div class="section">
            <h3>Seguridad</h3>
            <p>API Key (BYOK) & Cifrado.</p>
          </div>
          <div class="section">
            <h3>Auditor</h3>
            <p>Personalidad de la IA.</p>
          </div>
          <div class="section">
            <h3>Datos</h3>
            <p>Backups & Exportación.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; color: #fff; }
    h1 { color: var(--active-node, #9ACD32); font-family: 'Inter', sans-serif; }
    .placeholder-card {
      background: #121212;
      border: 1px solid rgba(255,255,255,0.1);
      padding: 2rem;
      border-radius: 12px;
      margin-top: 2rem;
    }
    .material-symbols-rounded { font-size: 3rem; color: #C5E100; margin-bottom: 1rem; }
    .sub-sections { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
    .section { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
    h3 { color: #C5E100; margin-top: 0; font-size: 1rem; }
    p { font-size: 0.9rem; opacity: 0.8; }
  `]
})
export class SettingsComponent {}
