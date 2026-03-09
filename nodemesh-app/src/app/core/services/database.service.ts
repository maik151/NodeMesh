import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {

    constructor() { }

    // Mock properties to satisfy TypeScript compiler before full implementation
    name: string = '';
    tables: any[] = [];

    initializeVault(vaultName: string): void {
        // Not implemented yet (RED phase)
    }
}
