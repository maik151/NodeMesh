import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="app-container" [class.authenticated]="auth.isAuthenticated()">
      <app-sidebar *ngIf="showSidebar()"></app-sidebar>
      
      <main class="content-area">
        <router-outlet />
      </main>
    </div>
  `,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('nodemesh-app');
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  showSidebar(): boolean {
    const isAuth = this.auth.isAuthenticated();
    const url = this.router.url;
    return isAuth && url !== '/setup' && url !== '/login';
  }
}
