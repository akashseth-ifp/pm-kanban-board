
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables before anything else
dotenv.config({ path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV || 'development'}`) });

console.log(`[env] Loaded env from .env.${process.env.NODE_ENV || 'development'}`);
