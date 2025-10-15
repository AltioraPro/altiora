// Client HTTP pour Redis API (compatible serverless)
class RedisHTTPClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/redis/${key}`, {
        method: "GET",
        headers: {
          "x-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.warn("Redis GET error:", error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/redis/${key}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify({ value, ttl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn("Redis SET error:", error);
    }
  }

  async del(pattern: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/api/redis/${pattern}`, {
        method: "DELETE",
        headers: {
          "x-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.count || 0;
    } catch (error) {
      console.warn("Redis DEL error:", error);
      return 0;
    }
  }
}

export { RedisHTTPClient };
