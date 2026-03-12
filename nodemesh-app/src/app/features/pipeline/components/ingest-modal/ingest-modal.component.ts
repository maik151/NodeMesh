import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngestionService } from '../../../../core/services/pipeline/ingestion.service';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { CryptoService } from '../../../../core/services/storage/crypto.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NodeChallenge } from '../../../../core/models/node.model';

@Component({
    selector: 'app-ingest-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ingest-modal.component.html',
    styleUrl: './ingest-modal.component.css'
})
export class IngestModalComponent {
    @Output() nodesIngested = new EventEmitter<void>();
    @Output() closeModal = new EventEmitter<void>();

    activeTab: 'text' | 'pdf' = 'text';
    topicName: string = '';
    rawText: string = '';
    selectedFile: File | null = null;
    selectedFileName: string = '';

    isProcessing: boolean = false;
    isSuccess: boolean = false;
    errorMessage: string = '';
    generatedCount: number = 0;

    readonly MAX_CHARS = 15000;

    constructor(
        private ingestionService: IngestionService,
        private dbService: DatabaseService,
        private cryptoService: CryptoService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    get charCount(): number {
        return this.rawText.length;
    }

    get isOverLimit(): boolean {
        return this.charCount > this.MAX_CHARS;
    }

    get canSubmit(): boolean {
        const hasContent = this.activeTab === 'text'
            ? this.rawText.trim().length > 0 && !this.isOverLimit
            : this.selectedFile !== null;
        return hasContent && this.topicName.trim().length > 0 && !this.isProcessing;
    }

    selectTab(tab: 'text' | 'pdf') {
        this.activeTab = tab;
        this.errorMessage = '';
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            this.selectedFileName = this.selectedFile.name;
            this.errorMessage = '';
        }
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0];
            if (file.type === 'application/pdf') {
                this.selectedFile = file;
                this.selectedFileName = file.name;
                this.errorMessage = '';
            } else {
                this.errorMessage = 'Solo se aceptan archivos PDF.';
            }
            this.cdr.detectChanges();
        }
    }

    async onForge() {
        if (!this.canSubmit) return;

        this.isProcessing = true;
        this.errorMessage = '';
        this.cdr.detectChanges();

        try {
            let text = this.rawText;

            // Si estamos en tab PDF, extraer texto primero
            if (this.activeTab === 'pdf' && this.selectedFile) {
                text = await this.ingestionService.extractTextFromPdf(this.selectedFile);
                if (!text.trim()) {
                    throw new Error('No se pudo extraer texto del PDF. Verifica que no sea un documento escaneado.');
                }
            }

            // Obtener la API Key descifrada
            const user = this.authService.getCurrentUser();
            if (!user) throw new Error('Sesión no encontrada.');

            const encryptedKey = await this.dbService.getApiKey('gemini');
            if (!encryptedKey) throw new Error('API Key no configurada. Regresa a /setup.');

            const rootKey = await this.cryptoService.deriveKeyFromUid(user.uid);
            const apiKey = await this.cryptoService.decrypt(encryptedKey, rootKey);

            // Generar nodos con la IA
            const nodes = await this.ingestionService.generateNodes(text, apiKey, this.topicName);

            // Guardar en IndexedDB
            await this.dbService.saveNodes(nodes);

            this.generatedCount = nodes.length;
            this.isSuccess = true;
            this.cdr.detectChanges();

            setTimeout(() => {
                this.nodesIngested.emit();
            }, 1500);

        } catch (error: any) {
            console.error('[IngestModal] Error:', error);
            this.errorMessage = error.message || 'Error inesperado durante la ingesta.';
        } finally {
            this.isProcessing = false;
            this.cdr.detectChanges();
        }
    }

    onClose() {
        this.closeModal.emit();
    }
}
