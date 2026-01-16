import crypto from "node:crypto";
import { env } from "@/env";

const ALGORITHM = "aes-256-cbc";

// Module-level state
let key: Buffer | null = null;
let iv: Buffer | null = null;
let initialized = false;

/**
 * Initialize encryption keys from environment variables
 * @throws Error if encryption keys are missing or invalid
 */
function init(): void {
    if (initialized) {
        return;
    }

    if (!(env.ENCRYPTION_KEY && env.ENCRYPTION_IV)) {
        throw new Error(
            "Missing encryption keys. Please set ENCRYPTION_KEY and ENCRYPTION_IV environment variables."
        );
    }

    try {
        key = Buffer.from(env.ENCRYPTION_KEY, "hex");
        iv = Buffer.from(env.ENCRYPTION_IV, "hex");

        // Validate key and IV lengths
        if (key.length !== 32) {
            throw new Error(
                "ENCRYPTION_KEY must be 32 bytes (64 hex characters)"
            );
        }
        if (iv.length !== 16) {
            throw new Error(
                "ENCRYPTION_IV must be 16 bytes (32 hex characters)"
            );
        }

        initialized = true;
    } catch (error) {
        throw new Error(
            `Failed to initialize encryption: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

/**
 * Encrypt a plaintext string
 * @param text - The plaintext to encrypt
 * @returns Encrypted text in hex format
 */
function encrypt(text: string): string {
    init();

    if (!key || !iv) {
        throw new Error("Encryption not initialized");
    }

    try {
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");
        return encrypted;
    } catch (error) {
        throw new Error(
            `Encryption failed: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

/**
 * Decrypt an encrypted string
 * @param encrypted - The encrypted text in hex format
 * @returns Decrypted plaintext
 */
function decrypt(encrypted: string): string {
    init();

    if (!key || !iv) {
        throw new Error("Encryption not initialized");
    }

    try {
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    } catch (error) {
        throw new Error(
            `Decryption failed: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

/**
 * Check if a string appears to be encrypted (hex format check)
 * @param text - Text to check
 * @returns true if text looks encrypted
 */
function isEncrypted(text: string): boolean {
    return /^[0-9a-f]+$/i.test(text) && text.length % 2 === 0;
}

/**
 * Encryption service for sensitive data (OAuth tokens, credentials)
 * Uses AES-256-CBC encryption with keys from environment variables
 */
export const EncryptionService = {
    init,
    encrypt,
    decrypt,
    isEncrypted,
};
