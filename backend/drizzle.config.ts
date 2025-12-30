import dotenv from 'dotenv';
import { defineConfig } from "drizzle-kit";

// Load environment variables from the correct file
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

export default defineConfig({
  schema: "./src/schema/*.ts",
  out: "./drizzle",
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_URL!,
  }
});
