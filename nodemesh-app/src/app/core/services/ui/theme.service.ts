import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly STORAGE_KEY = 'nodemesh_theme';
    private themeSubject = new BehaviorSubject<'dark' | 'light'>('dark');
    
    constructor() {
        this.loadTheme();
    }

    get theme$(): Observable<'dark' | 'light'> {
        return this.themeSubject.asObservable();
    }

    get isDark$(): Observable<boolean> {
        return this.themeSubject.pipe(map(t => t === 'dark'));
    }

    get theme(): 'dark' | 'light' {
        return this.themeSubject.value;
    }

    get isDark(): boolean {
        return this.themeSubject.value === 'dark';
    }

    toggle(): void {
        const next = this.themeSubject.value === 'dark' ? 'light' : 'dark';
        this.themeSubject.next(next);
        this.applyTheme();
        this.saveTheme();
    }

    setTheme(theme: 'light' | 'dark'): void {
        this.themeSubject.next(theme);
        this.applyTheme();
        this.saveTheme();
    }

    private loadTheme(): void {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
            this.themeSubject.next(saved as 'dark' | 'light');
        }
        this.applyTheme();
    }

    private applyTheme(): void {
        document.documentElement.dataset['theme'] = this.themeSubject.value;
    }

    private saveTheme(): void {
        localStorage.setItem(this.STORAGE_KEY, this.themeSubject.value);
    }
}
