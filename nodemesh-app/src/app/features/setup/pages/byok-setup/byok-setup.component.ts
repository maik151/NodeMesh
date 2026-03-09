import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { CryptoService } from '../../../../core/services/crypto.service';
import { DatabaseService } from '../../../../core/services/database.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-byok-setup',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './byok-setup.component.html',
    styleUrl: './byok-setup.component.css'
})
export class ByokSetupComponent {
    apiKey: string = '';
    isLoading: boolean = false;
    isSuccess: boolean = false;
    errorMessage: string = '';

    constructor(
        private authService: AuthService,
        private cryptoService: CryptoService,
        private dbService: DatabaseService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) { }

    async onSaveKey() {
        if (!this.apiKey.trim()) return;

        this.isLoading = true;
        this.errorMessage = '';
        this.cdr.detectChanges();

        try {
            // 1. Probar la API Key de Gemini con una petición de consulta de modelos (ligera)
            const isValid = await this.testGeminiKey(this.apiKey);

            if (!isValid) {
                throw new Error('La API Key proporcionada no es válida o está revocada.');
            }

            // 2. Obtener sesión actual para derivar la llave AES-GCM local
            const currentUser = this.authService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Sesión de usuario no encontrada. Vuelve a iniciar sesión.');
            }

            // 3. Cifrar
            const rootKey = await this.cryptoService.deriveKeyFromUid(currentUser.uid);
            const encryptedKey = await this.cryptoService.encrypt(this.apiKey, rootKey);

            // 4. Guardar en IndexedDB
            await this.dbService.saveApiKey('gemini', encryptedKey);

            // 5. Mostrar Éxito
            this.isSuccess = true;
            this.isLoading = false;
            this.cdr.detectChanges();

            // Redirigir al dashboard/simulador después de un pequeño delay visual
            setTimeout(() => {
                // En un paso futuro esto será this.router.navigate(['/simulador'])
                console.log('Setup completado. Redirigiendo...');
            }, 1500);

        } catch (error: any) {
            console.error('[ByokSetup] Error al configurar API Key:', error);
            this.errorMessage = error.message || 'Ocurrió un error al verificar la llave.';
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    }

    /**
     * Realiza un fetch a la API nativa de Gemini para comprobar que la key es válida.
     * Usamos una conexión ligera de información de un modelo específico.
     * Esto evita errores 403 globales de lista de modelos o errores 400 de payload mal armado.
     */
    private async testGeminiKey(key: string): Promise<boolean> {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash?key=${key}`;
            const response = await fetch(url);

            // Si el status es 400, 401 o 403, sabemos que la API Key falló
            if (!response.ok) {
                console.warn('[ByokSetup] Validación de llave fallida con status:', response.status);
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }
}
