import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor() { }

    /**
     * Generates a unique database ID based on the user's UID.
     * This is used to initialize the IndexedDB vault for the user,
     * guaranteeing isolation (Local-First).
     * 
     * @param uid The user's unique identifier (e.g., from Google OAuth)
     * @returns The derived storage key for the user's vault
     */
    deriveStorageKey(uid: string): string {
        return `nodemesh_vault_${uid}`;
    }
}
