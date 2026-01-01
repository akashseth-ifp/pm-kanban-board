import './env';
import './types/express';
import express, { Express } from 'express';
import cors from 'cors';
import router from './routes';

console.log("Current Environment:", process.env.NODE_ENV);
console.log("Current Port:", process.env.PORT);

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', router);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;
