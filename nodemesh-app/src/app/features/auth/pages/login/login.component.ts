import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

    constructor(private readonly authService: AuthService) { }

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
        try {
            await this.authService.loginWithGoogle();
            console.log('Bóveda inicializada y usuario logueado exitosamente.');
            this.loginSuccess = true;
            // TODO: redirect to dashboard
        } catch (error) {
            console.error('Error durante el login con Google:', error);
        } finally {
            this.isLoading = false;
        }
    }
}
