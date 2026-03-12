import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/ui/theme.service';

@Component({
    selector: 'app-theme-toggle',
    standalone: true,
    imports: [CommonModule],
    template: `
        <button class="theme-toggle" 
                (click)="onToggle()" 
                [title]="themeService.isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
            <!-- Sun icon (shown in dark mode) -->
            <svg *ngIf="themeService.isDark" class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <!-- Moon icon (shown in light mode) -->
            <svg *ngIf="!themeService.isDark" class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
        </button>
    `,
    styles: [`
        .theme-toggle {
            position: fixed;
            bottom: 1.25rem;
            right: 1.25rem;
            z-index: 9999;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: 1px solid var(--toggle-border, rgba(255, 255, 255, 0.1));
            background: var(--toggle-bg, rgba(18, 18, 18, 0.7));
            backdrop-filter: blur(8px);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .theme-toggle:hover {
            transform: scale(1.1);
            border-color: var(--toggle-hover-border, rgba(159, 255, 34, 0.4));
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .theme-toggle:active {
            transform: scale(0.95);
        }

        .toggle-icon {
            width: 18px;
            height: 18px;
            color: var(--toggle-icon-color, #e0e0e0);
            transition: color 0.3s ease;
        }

        :host-context([data-theme="light"]) .theme-toggle {
            background: rgba(255, 255, 255, 0.85);
            border-color: rgba(0, 0, 0, 0.1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        :host-context([data-theme="light"]) .toggle-icon {
            color: #333;
        }

        :host-context([data-theme="light"]) .theme-toggle:hover {
            border-color: rgba(100, 100, 200, 0.4);
        }
    `]
})
export class ThemeToggleComponent {

    constructor(public themeService: ThemeService) { }

    onToggle() {
        this.themeService.toggle();
    }
}
