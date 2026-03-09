import { CryptoService } from './crypto.service';

describe('CryptoService (TDD - AUT-02)', () => {
    let service: CryptoService;

    beforeEach(() => {
        service = new CryptoService();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // ---- PRUEBA 1: DOMPurify (anti-XSS) RNF-SEG-03 ----
    it('debe limpiar scripts maliciosos de un string HTML (RNF-SEG-03)', () => {
        const dirtyPayload = `
      <div>Hola</div>
      <script>alert("hackeado")</script>
      <img src="x" onerror="alert(1)">
    `;
        const cleanPayload = service.sanitizeHtml(dirtyPayload);

        expect(cleanPayload).not.toContain('<script>');
        expect(cleanPayload).not.toContain('alert');
        expect(cleanPayload).toContain('<div>Hola</div>');
        expect(cleanPayload).toContain('<img src="x">');
    });

    // ---- PRUEBA 2: Cifrado y Descifrado Local AES-GCM (RNF-SEG-02) ----
    it('debe derivar una llave, cifrar una API Key y descifrarla correctamente devolviendo el original', async () => {
        const mockUid = 'google_user_sub_12345';
        const apiKeyOriginal = 'AIzaSyA_mock_api_key_from_gemini';

        // 1. Derivar la llave
        const cryptoKey = await service.deriveKeyFromUid(mockUid);
        expect(cryptoKey.algorithm.name).toBe('AES-GCM');

        // 2. Cifrar
        const cipherTextBase64 = await service.encrypt(apiKeyOriginal, cryptoKey);

        // Comprobar que no se guarde en texto plano
        expect(cipherTextBase64).not.toBe(apiKeyOriginal);
        expect(cipherTextBase64.length).toBeGreaterThan(12);

        // 3. Descifrar
        const decryptedText = await service.decrypt(cipherTextBase64, cryptoKey);
        expect(decryptedText).toBe(apiKeyOriginal);
    });

    it('debe fallar al intentar descifrar un cipher con una llave incorrecta', async () => {
        const uid1 = 'user_1';
        const uid2 = 'user_2_hacker';
        const secret = 'mi_secreto_super_seguro';

        const rootKey1 = await service.deriveKeyFromUid(uid1);
        const hackerKey2 = await service.deriveKeyFromUid(uid2);

        const cipher = await service.encrypt(secret, rootKey1);

        // Intentar desencriptar el cipher del user_1 con la llave del user_2
        await expect(service.decrypt(cipher, hackerKey2)).rejects.toThrowError();
    });
});
