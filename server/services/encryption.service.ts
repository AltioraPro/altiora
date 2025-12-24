import crypto from "node:crypto";
import { env } from "@/env";

const ALGORITHM = "aes-256-cbc";

/**
 * Encryption service for sensitive data (OAuth tokens, credentials)
 * Uses AES-256-CBC encryption with keys from environment variables
 */
export class EncryptionService {
	private static key: Buffer;
	private static iv: Buffer;
	private static initialized = false;

	/**
	 * Initialize encryption keys from environment variables
	 * @throws Error if encryption keys are missing or invalid
	 */
	static init(): void {
		if (this.initialized) return;

		if (!env.ENCRYPTION_KEY || !env.ENCRYPTION_IV) {
			throw new Error(
				"Missing encryption keys. Please set ENCRYPTION_KEY and ENCRYPTION_IV environment variables.",
			);
		}

		try {
			this.key = Buffer.from(env.ENCRYPTION_KEY, "hex");
			this.iv = Buffer.from(env.ENCRYPTION_IV, "hex");

			// Validate key and IV lengths
			if (this.key.length !== 32) {
				throw new Error(
					"ENCRYPTION_KEY must be 32 bytes (64 hex characters)",
				);
			}
			if (this.iv.length !== 16) {
				throw new Error("ENCRYPTION_IV must be 16 bytes (32 hex characters)");
			}

			this.initialized = true;
		} catch (error) {
			throw new Error(
				`Failed to initialize encryption: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	/**
	 * Encrypt a plaintext string
	 * @param text - The plaintext to encrypt
	 * @returns Encrypted text in hex format
	 */
	static encrypt(text: string): string {
		this.init();

		try {
			const cipher = crypto.createCipheriv(ALGORITHM, this.key, this.iv);
			let encrypted = cipher.update(text, "utf8", "hex");
			encrypted += cipher.final("hex");
			return encrypted;
		} catch (error) {
			throw new Error(
				`Encryption failed: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	/**
	 * Decrypt an encrypted string
	 * @param encrypted - The encrypted text in hex format
	 * @returns Decrypted plaintext
	 */
	static decrypt(encrypted: string): string {
		this.init();

		try {
			const decipher = crypto.createDecipheriv(ALGORITHM, this.key, this.iv);
			let decrypted = decipher.update(encrypted, "hex", "utf8");
			decrypted += decipher.final("utf8");
			return decrypted;
		} catch (error) {
			throw new Error(
				`Decryption failed: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	/**
	 * Check if a string appears to be encrypted (hex format check)
	 * @param text - Text to check
	 * @returns true if text looks encrypted
	 */
	static isEncrypted(text: string): boolean {
		return /^[0-9a-f]+$/i.test(text) && text.length % 2 === 0;
	}
}
