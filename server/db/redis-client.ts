// Client HTTP pour Redis API (compatible serverless)
class RedisHTTPClient {
    private readonly baseUrl: string;
    private readonly apiKey: string;

    constructor(baseUrl: string, apiKey: string) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(`${this.baseUrl}/api/redis/${key}`, {
                method: "GET",
                headers: {
                    "x-api-key": this.apiKey,
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const result = await response.json();
            return result.success ? result.data : null;
        } catch (error) {
            console.error("Redis get error:", error);
            return null;
        }
    }

    async set(key: string, value: unknown, ttl = 300): Promise<void> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(`${this.baseUrl}/api/redis/${key}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.apiKey,
                },
                body: JSON.stringify({ value, ttl }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }
        } catch (_error) {
            // Silencieux - le cache n'est pas critique
        }
    }

    async del(pattern: string): Promise<number> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(
                `${this.baseUrl}/api/redis/${pattern}`,
                {
                    method: "DELETE",
                    headers: {
                        "x-api-key": this.apiKey,
                    },
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const result = await response.json();
            return result.count || 0;
        } catch (_error) {
            return 0;
        }
    }
}

export { RedisHTTPClient };
