import { db } from "../server/db";
import * as schema from "../shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool } from "@neondatabase/serverless";

// This script creates all the database tables based on the schema
async function main() {
  try {
    console.log("Creating database schema...");
    
    // Create tables based on schema
    const migrationResult = await db.execute(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );

      -- Properties table
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        property_type TEXT NOT NULL,
        listing_type TEXT NOT NULL,
        bedrooms INTEGER NOT NULL,
        bathrooms TEXT NOT NULL,
        square_feet INTEGER NOT NULL,
        seller_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        year_built INTEGER,
        views INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- Property features table
      CREATE TABLE IF NOT EXISTS property_features (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        has_pool BOOLEAN NOT NULL DEFAULT FALSE,
        has_garden BOOLEAN NOT NULL DEFAULT FALSE,
        has_garage BOOLEAN NOT NULL DEFAULT FALSE,
        has_balcony BOOLEAN NOT NULL DEFAULT FALSE,
        has_air_conditioning BOOLEAN NOT NULL DEFAULT FALSE,
        has_gym BOOLEAN NOT NULL DEFAULT FALSE,
        has_security_system BOOLEAN NOT NULL DEFAULT FALSE,
        has_fireplace BOOLEAN NOT NULL DEFAULT FALSE
      );

      -- Property images table
      CREATE TABLE IF NOT EXISTS property_images (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        is_main BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- Inquiries table
      CREATE TABLE IF NOT EXISTS inquiries (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT NOT NULL,
        is_viewed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    console.log("Database schema created successfully!");
  } catch (error) {
    console.error("Error creating database schema:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();