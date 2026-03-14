import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { NodeChallenge, FolderTheme, QuizSession } from '../../../../core/models/node.model';

@Component({
  selector: 'app-command-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="command-center-layout">
      <header class="cc-header">
        <h1 class="cc-title">Command Center</h1>
        <p class="cc-subtitle">Gestión inteligente de nodos y flujos de aprendizaje.</p>
      </header>

      <div class="bento-grid">
        <!-- Card 1: Ingesta de Preguntas -->
        <div class="bento-card main-action" (click)="triggerInjection()">
          <div class="card-glow"></div>
          <div class="card-content">
            <div class="icon-wrap">
              <span class="material-symbols-rounded">database_upload</span>
            </div>
            <div class="text-wrap">
              <h3>Ingresar Preguntas</h3>
              <p>Inyecta el Payload Maestro de la IA directamente en tu bóveda local.</p>
            </div>
          </div>
          <div class="card-footer">
            <span class="status-tag">Listo para Ingesta</span>
          </div>
        </div>

        <!-- Card 2: Estadísticas Rápidas -->
        <div class="bento-card stats-card">
          <div class="card-content">
            <span class="material-symbols-rounded">trending_up</span>
            <div class="stat-value">85%</div>
            <div class="stat-label">Retención Promedio</div>
          </div>
        </div>

        <!-- Card 3: Próxima Sesión -->
        <div class="bento-card session-card">
          <div class="card-content">
            <span class="material-symbols-rounded">event_upcoming</span>
            <h3>Sesión Pendiente</h3>
            <p>Arquitectura Web (5 nodos)</p>
          </div>
        </div>

        <!-- Card 4: Estado del Sistema -->
        <div class="bento-card system-card">
          <div class="card-content">
            <div class="status-dot online"></div>
            <span>Base de Datos: {{ dbName || 'Conectando...' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .command-center-layout {
      padding: 2.5rem;
      max-width: 1200px;
      margin: 0 auto;
      color: #fff;
    }

    .cc-header {
      margin-bottom: 3rem;
    }

    .cc-title {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #9FFF22 0%, #C5E100 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
      letter-spacing: -1px;
    }

    .cc-subtitle {
     color: rgba(255, 255, 255, 0.4);
     font-size: 1.1rem;
    }

    .bento-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 200px);
      gap: 1.5rem;
    }

    .bento-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 24px;
      position: relative;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: default;
    }

    .bento-card:hover {
      transform: translateY(-5px);
      border-color: rgba(159, 255, 34, 0.2);
      background: rgba(255, 255, 255, 0.05);
    }

    .main-action {
      grid-column: span 2;
      grid-row: span 2;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 2rem;
      background: radial-gradient(circle at top right, rgba(159, 255, 34, 0.08), transparent);
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%;
    }

    .icon-wrap {
      width: 64px;
      height: 64px;
      background: rgba(159, 255, 34, 0.1);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-wrap .material-symbols-rounded {
      font-size: 32px;
      color: #9FFF22;
    }

    .text-wrap h3 {
      font-size: 1.8rem;
      margin-bottom: 0.75rem;
      color: #fff;
    }

    .text-wrap p {
      color: rgba(255, 255, 255, 0.5);
      line-height: 1.6;
    }

    .card-footer {
      margin-top: auto;
    }

    .status-tag {
      background: rgba(159, 255, 34, 0.15);
      color: #9FFF22;
      padding: 0.5rem 1rem;
      border-radius: 100px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .stats-card {
      grid-column: span 1;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 800;
      color: #fff;
    }

    .stat-label {
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.9rem;
    }

    .session-card {
      grid-column: span 1;
      grid-row: span 1;
      padding: 1.5rem;
    }

    .system-card {
      grid-column: span 2;
      padding: 1.25rem 2rem;
      display: flex;
      align-items: center;
    }

    .system-card .card-content {
      flex-direction: row;
      align-items: center;
      gap: 1rem;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-dot.online {
      background: #9FFF22;
      box-shadow: 0 0 10px #9FFF22;
    }

    .material-symbols-rounded {
      color: rgba(255, 255, 255, 0.6);
    }
  `]
})
export class CommandCenterComponent {
  private readonly db = inject(DatabaseService);

  get dbName() {
    return this.db.name;
  }

  async triggerInjection() {
    const payloadStr = prompt('Pega aquí el Payload Maestro (JSON) para inyectar:');
    if (!payloadStr) return;

    try {
      const payload = JSON.parse(payloadStr);
      
      const tema = payload.tema || null;
      const quiz = payload.quiz || null;
      const nodes = Array.isArray(payload) ? payload : (payload.nodos || []);
      
      if (nodes.length === 0 && !tema && !quiz) {
        alert('No se encontró información válida en el payload.');
        return;
      }

      if (tema) {
        await this.db.saveFolder(tema);
      }

      if (quiz) {
        await this.db.saveQuiz(quiz);
      }

      if (nodes.length > 0) {
        await this.db.db.table('nodes').bulkAdd(nodes.map((n: any) => ({
          ...n,
          folder_id: n.folder_id || tema?.folder_id || quiz?.folder_id,
          quiz_id: n.quiz_id || quiz?.quiz_id,
          nextReviewDate: new Date()
        })));
      }

      alert(`¡Éxito! Se ha inyectado la información en la base de datos.`);
    } catch (err: any) {
      console.error('Error al inyectar JSON:', err);
      alert('Error crítico al procesar el JSON. Revisa la consola.');
    }
  }
}
