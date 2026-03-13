import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-command-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Command Center</h1>
      <p>Bienvenido al embudo principal de NodeMesh.</p>
      <div class="placeholder-card">
        <span class="material-symbols-rounded">terminal</span>
        <p>Próximamente: Compilador de Prompts & Action Blocks.</p>
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
      text-align: center;
    }
    .material-symbols-rounded { font-size: 3rem; color: #C5E100; }
  `]
})
export class CommandCenterComponent {}
