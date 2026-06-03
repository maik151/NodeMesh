import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { AuthService } from './core/services/auth/auth.service';
import { PomodoroWidgetComponent } from './shared/components/pomodoro-widget/pomodoro-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NotificationComponent, PomodoroWidgetComponent],
  template: `
    <div class="app-container" [class.authenticated]="auth.isAuthenticated()">
      <app-sidebar *ngIf="showSidebar()"></app-sidebar>
      <app-notification />
      
      <main class="content-area">
        <router-outlet />
      </main>
      <app-pomodoro-widget></app-pomodoro-widget>
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
