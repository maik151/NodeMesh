import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { DatabaseService } from '../../../../core/services/storage/database.service';
import { CryptoService } from '../../../../core/services/storage/crypto.service';
import { NodeChallenge } from '../../../../core/models/node.model';
import { IngestModalComponent } from '../../components/ingest-modal/ingest-modal.component';
import { ThemeService } from '../../../../core/services/ui/theme.service';

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
        private readonly authService: AuthService,
        private readonly dbService: DatabaseService,
        private readonly cryptoService: CryptoService,
        public readonly themeService: ThemeService,
        private readonly cdr: ChangeDetectorRef,
        private readonly router: Router
    ) { }

    get logoSrc(): string {
        return this.themeService.isDark ? '/Images/nodeMesh_white.png' : '/Images/nodemesh_dark.png';
    }

    ngOnInit(): void {
        const user = this.authService.getCurrentUser();
        if (user) {
            this.userName = user.displayName || user.email || 'Forjador';
        }
        this.loadNodes(); // loadNodes is async but we don't await it to keep ngOnInit: void
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
