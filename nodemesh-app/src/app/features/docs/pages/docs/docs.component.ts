import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Documentación</h1>
      <p>El manual técnico de la NodeMesh Forge.</p>
      <div class="placeholder-card">
        <span class="material-symbols-rounded">book</span>
        <p>Próximamente: Guía de Prompts & Tipos de Retos.</p>
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
export class DocsComponent {}
