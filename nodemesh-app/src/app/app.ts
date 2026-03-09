import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggleComponent],
  template: `
    <router-outlet />
    <app-theme-toggle />
  `,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('nodemesh-app');
}
