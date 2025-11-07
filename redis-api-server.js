#!/usr/bin/env node

const express = require("express");
const Redis = require("ioredis");
const cors = require("cors");

const app = express();
const PORT = process.env.REDIS_API_PORT || 3001;
const API_KEY = process.env.REDIS_API_KEY || "your-secret-api-key-change-me";

// Middleware
app.use(cors());
app.use(express.json());

// Redis client
const redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
});

redis.on("error", (err) => {
    console.error("Redis connection error:", err);
});

redis.on("connect", () => {
    console.log("✅ Connected to Redis");
});

// Middleware d'authentification
const authenticate = (req, res, next) => {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey || apiKey !== API_KEY) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized - Invalid API Key",
        });
    }

    next();
};

// Routes API

// GET - Récupérer une valeur
app.get("/api/redis/:key", authenticate, async (req, res) => {
    try {
        const { key } = req.params;
        const value = await redis.get(key);

        res.json({
            success: true,
            data: value ? JSON.parse(value) : null,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// POST - Définir une valeur
app.post("/api/redis/:key", authenticate, async (req, res) => {
    try {
        const { key } = req.params;
        const { value, ttl = 300 } = req.body;

        await redis.setex(key, ttl, JSON.stringify(value));

        res.json({
            success: true,
            message: "Value set successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// DELETE - Supprimer une ou plusieurs clés
app.delete("/api/redis/:pattern", authenticate, async (req, res) => {
    try {
        const { pattern } = req.params;

        // Si pattern contient *, on fait un scan
        if (pattern.includes("*")) {
            const keys = await redis.keys(pattern);

            if (keys.length > 0) {
                await redis.del(...keys);
            }

            res.json({
                success: true,
                message: `Deleted ${keys.length} keys`,
                count: keys.length,
            });
        } else {
            // Sinon, suppression directe
            await redis.del(pattern);

            res.json({
                success: true,
                message: "Key deleted successfully",
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// Health check
app.get("/health", async (req, res) => {
    try {
        await redis.ping();
        res.json({
            success: true,
            status: "healthy",
            redis: "connected",
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: "unhealthy",
            error: error.message,
        });
    }
});

// Démarrer le serveur
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Redis API Server running on port ${PORT}`);
    console.log(`🔑 API Key: ${API_KEY}`);
    console.log(`📊 Health check: http://217.154.120.235:${PORT}/health`);
});

// Gestion des erreurs
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
    console.error("Unhandled Rejection:", error);
});
