import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor() { }

    /**
     * Generates a unique secure database ID based on the user's UID using SHA-256.
     * This is used to initialize the IndexedDB vault for the user,
     * guaranteeing isolation (Local-First) without exposing the real UID.
     * 
     * @param uid The user's unique identifier (e.g., from Google OAuth)
     * @returns A promise that resolves to the derived storage key for the user's vault
     */
    async deriveStorageKey(uid: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(uid);
        // Use Web Crypto API to securely hash the UID
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);

        // Convert the buffer to a hexadecimal string representation
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return `nodemesh_vault_${hashHex}`;
    }
}
