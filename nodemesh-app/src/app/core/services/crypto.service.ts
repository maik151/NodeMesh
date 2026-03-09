import { Injectable } from '@angular/core';
import DOMPurify from 'dompurify';

@Injectable({
    providedIn: 'root'
})
export class CryptoService {

    constructor() { }

    /**
     * RNF-SEG-03: DOMPurify Anti-XSS.
     * Toma cualquier string crudo (potencialmente del LLM) y devuelve un HTML o string seguro sin scripts inyectables.
     */
    sanitizeHtml(dirty: string): string {
        return DOMPurify.sanitize(dirty);
    }

    /**
     * Deriva una clave maestra AES-GCM (CryptoKey) a partir de un string UID empleando SHA-256.
     * Esta clave se usará para el RNF-SEG-02 (Cifrado simétrico de API Keys).
     */
    async deriveKeyFromUid(uid: string): Promise<CryptoKey> {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.digest('SHA-256', enc.encode(uid));

        return crypto.subtle.importKey(
            'raw',
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Cifra un string en texto plano empleando la llave derivada del usuario (AES-GCM).
     * Retorna una cadena codificada en Base64 que incluye: el IV (12 bytes) + el CipherText.
     */
    async encrypt(plainText: string, key: CryptoKey): Promise<string> {
        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const cipherBuffer = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            enc.encode(plainText)
        );

        // Concatenar el IV y el Cipher original en un solo buffer
        const cipherArray = new Uint8Array(cipherBuffer);
        const concatBuffer = new Uint8Array(iv.length + cipherArray.length);
        concatBuffer.set(iv, 0);
        concatBuffer.set(cipherArray, iv.length);

        return this.arrayBufferToBase64(concatBuffer);
    }

    /**
     * Descifra una cadena previamente devuelta por el método encrypt.
     */
    async decrypt(encryptedBase64: string, key: CryptoKey): Promise<string> {
        const concatBuffer = this.base64ToArrayBuffer(encryptedBase64);

        // El IV siempre son los primeros 12 bytes
        const iv = concatBuffer.slice(0, 12);
        const data = concatBuffer.slice(12);

        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );

        const dec = new TextDecoder();
        return dec.decode(decryptedBuffer);
    }

    // --- Helpers de conversión (ArrayBuffer <-> Base64) ---
    private arrayBufferToBase64(buffer: Uint8Array): string {
        let binary = '';
        const len = buffer.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(buffer[i]);
        }
        return btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): Uint8Array {
        const binary_string = atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }
}
