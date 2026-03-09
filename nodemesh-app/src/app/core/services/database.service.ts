import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {

    public db!: Dexie;

    constructor() { }

    get name(): string {
        return this.db ? this.db.name : '';
    }

    get tables(): Table<any, any>[] {
        return this.db ? this.db.tables : [];
    }

    initializeVault(vaultName: string): void {
        this.db = new Dexie(vaultName);

        this.db.version(1).stores({
            nodes: '++id, content, sourceId, nextReviewDate', // RNF-ALF-01: Added nextReviewDate for Spaced Repetition (SM-2)
            api_keys: '++id, provider, key',
            history: '++id, nodeId, date, grade', // RNF-ALF-01: added history table
            statistics: '++id, metric, value' // RNF-ALF-01: added statistics table
        });

        // RNF-ALF-01: Manejador global de errores para detectar cuando el disco (IndexedDB) se llena.
        // Aunque IndexedDB usa el disco duro del usuario, Chrome/Edge imponen cuotas por dominio
        // (usualmente un % del disco libre). Si el usuario sube miles de PDFs, la cuota puede llenarse.
        this.db.open().catch((err: any) => {
            if (err.name === 'QuotaExceededError') {
                console.error('[DatabaseService] CRÍTICO: La cuota de almacenamiento local (IndexedDB) de este navegador se ha excedido. NodeMesh no puede guardar más nodos.');
                // En el futuro, aquí se puede disparar un Subject/Observable para que la UI muestre un modal amigable.
            } else {
                console.error('[DatabaseService] Error genérico al abrir IndexedDB:', err);
            }
        });
    }
}
