import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly STORAGE_KEY = 'nodemesh_theme';
    private currentTheme: 'dark' | 'light' = 'dark';

    constructor() {
        this.loadTheme();
    }

    get theme(): 'dark' | 'light' {
        return this.currentTheme;
    }

    get isDark(): boolean {
        return this.currentTheme === 'dark';
    }

    toggle(): void {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        this.saveTheme();
    }

    private loadTheme(): void {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
            this.currentTheme = saved;
        }
        this.applyTheme();
    }

    private applyTheme(): void {
        document.documentElement.dataset['theme'] = this.currentTheme;
    }

    private saveTheme(): void {
        localStorage.setItem(this.STORAGE_KEY, this.currentTheme);
    }
}
