import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { DatabaseService } from '../../../../core/services/database.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
    isLoading = false;
    loginSuccess = false;

    constructor(
        private readonly authService: AuthService,
        private readonly dbService: DatabaseService,
        private readonly cdr: ChangeDetectorRef,
        private readonly router: Router
    ) { }

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
