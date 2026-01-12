import Redis from "ioredis"

// Utilise la variable d'environnement ou localhost par défaut
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

export async function rateLimit(identifier: string, limit: number = 5, window: number = 60): Promise<{ success: boolean, remaining: number }> {
    const key = `ratelimit:${identifier}`

    const current = await redis.incr(key)

    // Si c'est la première requête, on fixe l'expiration
    if (current === 1) {
        await redis.expire(key, window)
    }

    const ttl = await redis.ttl(key) // Temps restant

    return {
        success: current <= limit,
        remaining: Math.max(0, limit - current)
    }
}
