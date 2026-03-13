import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vault',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Bóveda de Nodos</h1>
      <p>Administrador de conocimiento local.</p>
      <div class="placeholder-card">
        <span class="material-symbols-rounded">database</span>
        <p>Próximamente: Jerarquía de Temas & Quizzes.</p>
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
export class VaultComponent {}
