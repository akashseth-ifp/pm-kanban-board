import './env';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node'; // import helper
import { auth } from './lib/auth';
// Environment variables loaded via ./env import

console.log("Current Environment:", process.env.NODE_ENV);
console.log("Current Port:", process.env.PORT);

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.all("/api/auth/*path", (req, res) => {
    return toNodeHandler(auth)(req, res);
});

app.get('/api', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the Kanban Board API' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;
