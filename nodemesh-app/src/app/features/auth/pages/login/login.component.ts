import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    constructor(private readonly authService: AuthService) { }

    async onGoogleLogin() {
        try {
            await this.authService.loginWithGoogle();
            console.log('Bóveda inicializada y usuario logueado exitosamente.');
            // En el futuro, aquí redirigiremos al dashboard de aprendizaje
        } catch (error) {
            console.error('Error durante el login con Google:', error);
        }
    }
}
