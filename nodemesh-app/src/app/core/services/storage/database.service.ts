import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { NodeChallenge } from '../../models/node.model';

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

    async initializeVault(vaultName: string): Promise<void> {
        if (this.db) {
            this.db.close();
        }
        // Identificar el motor de BD disponible (compatibilidad con tests)
        const g = globalThis as any;
        const idb = g.indexedDB || g.window?.indexedDB;
        const idbKR = g.IDBKeyRange || g.window?.IDBKeyRange;

        this.db = new Dexie(vaultName, {
            indexedDB: idb,
            IDBKeyRange: idbKR
        });

        this.db.version(1).stores({
            nodes: '++id, content, sourceId, nextReviewDate',
            api_keys: '++id, provider, key',
            history: '++id, nodeId, date, grade',
            statistics: '++id, metric, value'
        });

        try {
            await this.db.open();
        } catch (err: any) {
            if (err.name === 'QuotaExceededError') {
                console.error('[DatabaseService] CRITICAL: QuotaExceededError. NodeMesh cannot save more nodes.');
            } else {
                console.error('[DatabaseService] Error opening IndexedDB:', err);
            }
            throw err;
        }
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

    async saveNodes(nodes: Omit<NodeChallenge, 'id'>[]): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.table('nodes').bulkAdd(nodes);
    }

    async getNodes(): Promise<NodeChallenge[]> {
        if (!this.db) throw new Error('Database not initialized');
        return await this.db.table('nodes').toArray();
    }

    async getNodesBySource(sourceId: string): Promise<NodeChallenge[]> {
        if (!this.db) throw new Error('Database not initialized');
        return await this.db.table('nodes').where('sourceId').equals(sourceId).toArray();
    }
}
