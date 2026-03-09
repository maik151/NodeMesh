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
            nodes: '++id, content, sourceId, nextReviewDate',
            api_keys: '++id, provider, key',
            history: '++id, nodeId, date, grade',
            statistics: '++id, metric, value'
        });

        this.db.open().catch((err: any) => {
            if (err.name === 'QuotaExceededError') {
                console.error('[DatabaseService] CRITICAL: QuotaExceededError. NodeMesh cannot save more nodes.');
            } else {
                console.error('[DatabaseService] Error opening IndexedDB:', err);
            }
        });
    }

    async saveApiKey(provider: string, encryptedKey: string): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.table('api_keys').put({ provider, key: encryptedKey });
    }

    async getApiKey(provider: string): Promise<string | null> {
        if (!this.db) throw new Error('Database not initialized');
        const record = await this.db.table('api_keys').where('provider').equals(provider).first();
        return record ? record.key : null;
    }
}
