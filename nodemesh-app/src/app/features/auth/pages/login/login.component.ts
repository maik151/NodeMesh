import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

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
        private readonly cdr: ChangeDetectorRef,
        private readonly router: Router
    ) { }

    /**
     * Initialize GIS SDK as soon as the component loads and the
     * <script src="...gsi/client"> has had a chance to run.
     */
    ngOnInit(): void {
        // Brief delay to ensure the async GIS script has executed
        setTimeout(() => this.authService.initializeGis(), 300);
    }

    async onGoogleLogin() {
        if (this.isLoading || this.loginSuccess) return;
        this.isLoading = true;
        this.cdr.detectChanges(); // Trigger show spinner

        try {
            await this.authService.loginWithGoogle();
            console.log('Bóveda inicializada y usuario logueado exitosamente.');
            this.loginSuccess = true;
            this.cdr.detectChanges(); // Trigger success state immediately

            // Redirigir al setup (la ruta /setup evaluará el AuthGuard y ByokGuard correspondientemente)
            this.router.navigate(['/setup']);
        } catch (error) {
            console.error('Error durante el login con Google:', error);
        } finally {
            this.isLoading = false;
            this.cdr.detectChanges(); // Stop spinner if error occurred
        }
    }
}
