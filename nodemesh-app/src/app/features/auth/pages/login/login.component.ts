import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    isLoading = false;

    constructor(private readonly authService: AuthService) { }

    async onGoogleLogin() {
        if (this.isLoading) return;
        this.isLoading = true;
        try {
            await this.authService.loginWithGoogle();
            console.log('Bóveda inicializada y usuario logueado exitosamente.');
        } catch (error) {
            console.error('Error durante el login con Google:', error);
        } finally {
            this.isLoading = false;
        }
    }
}
