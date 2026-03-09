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
            nodes: '++id, content, sourceId',
            api_keys: '++id, provider, key'
        });
    }
}
