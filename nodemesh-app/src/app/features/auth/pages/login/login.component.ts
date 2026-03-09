import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { DatabaseService } from '../../../../core/services/database.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { NodeMeshBgComponent } from '../../../../shared/components/node-mesh-bg/node-mesh-bg.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, NodeMeshBgComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
    isLoading = false;
    loginSuccess = false;

    constructor(
        private readonly authService: AuthService,
        private readonly dbService: DatabaseService,
        public readonly themeService: ThemeService,
        private readonly cdr: ChangeDetectorRef,
        private readonly router: Router
    ) { }

    get logoSrc(): string {
        return this.themeService.isDark ? '/Images/nodeMesh_white.png' : '/Images/nodemesh_dark.png';
    }

    get maikLogoSrc(): string {
        return this.themeService.isDark ? '/Images/maikdev.png' : '/Images/maikdev_black.png';
    }

    ngOnInit(): void {
        setTimeout(() => this.authService.initializeGis(), 300);
    }

    async onGoogleLogin() {
        if (this.isLoading || this.loginSuccess) return;
        this.isLoading = true;
        this.cdr.detectChanges();

        try {
            await this.authService.loginWithGoogle();
            console.log('[Login] Bóveda inicializada y usuario logueado.');
            this.loginSuccess = true;
            this.cdr.detectChanges();

            // Smart redirect: si ya tiene API Key configurada, directo al dashboard
            const existingKey = await this.dbService.getApiKey('gemini');
            if (existingKey) {
                this.router.navigate(['/simulador']);
            } else {
                this.router.navigate(['/setup']);
            }
        } catch (error) {
            console.error('[Login] Error durante el login:', error);
        } finally {
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    }
}
