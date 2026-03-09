import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { DatabaseService } from '../../../../core/services/database.service';
import { CryptoService } from '../../../../core/services/crypto.service';
import { NodeChallenge } from '../../../../core/models/node.model';
import { IngestModalComponent } from '../../components/ingest-modal/ingest-modal.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, IngestModalComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    userName: string = '';
    nodes: NodeChallenge[] = [];
    isLoadingNodes: boolean = true;
    showIngestModal: boolean = false;

    constructor(
        private authService: AuthService,
        private dbService: DatabaseService,
        private cryptoService: CryptoService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) { }

    async ngOnInit() {
        const user = this.authService.getCurrentUser();
        if (user) {
            this.userName = user.displayName || user.email || 'Forjador';
        }
        await this.loadNodes();
    }

    async loadNodes() {
        this.isLoadingNodes = true;
        this.cdr.detectChanges();

        try {
            this.nodes = await this.dbService.getNodes();
        } catch (err) {
            console.error('[Dashboard] Error al cargar nodos:', err);
        } finally {
            this.isLoadingNodes = false;
            this.cdr.detectChanges();
        }
    }

    openIngestModal() {
        this.showIngestModal = true;
    }

    closeIngestModal() {
        this.showIngestModal = false;
    }

    onNodesIngested() {
        this.showIngestModal = false;
        this.loadNodes();
    }

    logout() {
        this.router.navigate(['/login']);
    }
}
