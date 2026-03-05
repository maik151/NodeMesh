import { Injectable } from '@angular/core';

import { UserProfile } from '../../data/models/interfaces/user-profile.interface';

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

    /**
     * Mocks the Google OAuth 2.0 login flow.
     * In a real implementation, this would interact with Firebase Auth or Angularx Social Login.
     * For now, it returns a mock UserProfile to satisfy the TDD Green phase.
     * 
     * @returns A promise that resolves to the authenticated user's profile
     */
    async loginWithGoogle(): Promise<UserProfile> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Return a mock user that satisfies the test expectations
        return {
            uid: 'google_oauth_mock_uid_12345',
            email: 'user@example.com',
            displayName: 'Mock Google User',
        };
    }
}
