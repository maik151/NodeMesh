import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { CryptoService } from '../../../../core/services/storage/crypto.service';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { ThemeService } from '../../../../core/services/ui/theme.service';
import { NodeMeshBgComponent } from '../../../../shared/components/node-mesh-bg/node-mesh-bg.component';
import { LiquidGlassComponent } from '../../../../shared/components/liquid-glass/liquid-glass.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-byok-setup',
    standalone: true,
    imports: [CommonModule, FormsModule, NodeMeshBgComponent, LiquidGlassComponent],
    templateUrl: './byok-setup.component.html',
    styleUrl: './byok-setup.component.css'
})
export class ByokSetupComponent {
    apiKey: string = '';
    showApiKey: boolean = false;
    isInputFocused: boolean = false;

    isTestLoading: boolean = false;
    apiTestedSuccessfully: boolean = false;

    isSaveLoading: boolean = false;
    isSaveSuccess: boolean = false;

    errorMessage: string = '';

    constructor(
        private authService: AuthService,
        private cryptoService: CryptoService,
        private dbService: DatabaseService,
        public themeService: ThemeService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) { }

    get logoSrc(): string {
        return this.themeService.isDark ? '/Images/nodeMesh_white.png' : '/Images/nodemesh_dark.png';
    }

    get maikLogoSrc(): string {
        return this.themeService.isDark ? '/Images/maikdev.png' : '/Images/maikdev_black.png';
    }

    get isLightMode(): boolean {
        return !this.themeService.isDark;
    }

    async onTestKey() {
        if (!this.apiKey.trim()) return;

        this.isTestLoading = true;
        this.errorMessage = '';
        this.apiTestedSuccessfully = false;
        this.cdr.detectChanges();

        try {
            const isValid = await this.testGeminiKey(this.apiKey);

            if (!isValid) {
                throw new Error('La API Key proporcionada no es válida o está revocada.');
            }

            this.apiTestedSuccessfully = true;
        } catch (error: any) {
            console.error('[ByokSetup] Error al testear API Key:', error);
            this.errorMessage = error.message || 'Ocurrió un error al verificar la llave.';
        } finally {
            this.isTestLoading = false;
            this.cdr.detectChanges();
        }
    }

    async onSaveKey() {
        if (!this.apiTestedSuccessfully || !this.apiKey.trim()) return;

        this.isSaveLoading = true;
        this.errorMessage = '';
        this.cdr.detectChanges();

        try {
            // 1. Obtener sesión actual para derivar la llave AES-GCM local
            const currentUser = this.authService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Sesión de usuario no encontrada. Vuelve a iniciar sesión.');
            }

            // 2. Cifrar
            const rootKey = await this.cryptoService.deriveKeyFromUid(currentUser.uid);
            const encryptedKey = await this.cryptoService.encrypt(this.apiKey, rootKey);

            // 3. Guardar en IndexedDB
            await this.dbService.saveApiKey('gemini', encryptedKey);

            // 4. Mostrar Éxito
            this.isSaveSuccess = true;
            this.isSaveLoading = false;
            this.cdr.detectChanges();

            // Redirigir al dashboard/simulador después de un pequeño delay visual
            setTimeout(() => {
                this.router.navigate(['/simulador']);
            }, 1500);

        } catch (error: any) {
            console.error('[ByokSetup] Error al guardar API Key:', error);
            this.errorMessage = error.message || 'Ocurrió un error al encriptar y guardar la llave.';
            this.isSaveLoading = false;
            this.cdr.detectChanges();
        }
    }

    onSkipSetup() {
        this.router.navigate(['/simulador']);
    }

    goBack() {
        this.router.navigate(['/login']);
    }

    toggleApiKeyVisibility() {
        this.showApiKey = !this.showApiKey;
    }

    /**
     * Realiza un fetch a la API nativa de Gemini para comprobar que la key es válida.
     * Hacemos un prompt mínimo (Explain AI in a few words) a gemma-3-27b-it
     * para asegurar la validez real de la clave (evita 404s/403s de listado de modelos).
     */
    private async testGeminiKey(key: string): Promise<boolean> {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${key}`;
            const payload = {
                contents: [{ parts: [{ text: "Explain how AI works in a few words" }] }]
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

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
