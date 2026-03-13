import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ThemeToggleComponent, SidebarComponent],
  template: `
    <div class="app-container" [class.authenticated]="auth.isAuthenticated()">
      <app-sidebar *ngIf="auth.isAuthenticated()"></app-sidebar>
      
      <main class="content-area">
        <router-outlet />
        <app-theme-toggle />
      </main>
    </div>
  `,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('nodemesh-app');
  protected readonly auth = inject(AuthService);
}
