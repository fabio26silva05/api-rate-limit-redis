import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';

const app = express();
const PORT = 3000;

// 1. Configure sua URL entre as aspas simples corretamente
const redisClient = createClient({  
    url: process.env.REDIS_URL
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// 2. Lógica do Rate Limit
const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const key = `rate-limit:${ip}`;

    try {
        const requests = await redisClient.incr(key);
        if (requests === 1) await redisClient.expire(key, 60);

        if (requests > 10) {
            return res.status(429).json({ error: 'Muitas requisições. Tente em 1 minuto.' });
        }
        next();
    } catch (err) {
        next();
    }
};

// 3. Inicialização do Servidor
async function startServer() {
    let redisConnected = false;
    
    try {
        // Tenta conectar ao Redis com timeout de 5 segundos
        const connectPromise = redisClient.connect();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Redis connection timeout")), 5000)
        );
        
        await Promise.race([connectPromise, timeoutPromise]);
        redisConnected = true;
        console.log("✓ Conectado ao Redis no Upstash");
    } catch (err) {
        console.error("✗ Erro ao conectar ao Redis:", err instanceof Error ? err.message : err);
        console.log("⚠ Continuando sem Redis...");
    }

    app.use((req: Request, res: Response, next: NextFunction) => {
        if (redisConnected) {
            rateLimitMiddleware(req, res, next);
        } else {
            next();
        }
    });

    app.get('/', (req, res) => {
        res.send('SentinelRate Guard está protegendo a API ');
    });

    app.listen(PORT, () => {
        console.log(`✓ Servidor rodando em http://localhost:${PORT}`);
    });
}

startServer().catch(err => {
    console.error("Erro crítico ao iniciar servidor:", err);
    process.exit(1);
});