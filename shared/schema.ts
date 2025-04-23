import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Property schema
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  propertyType: text("property_type").notNull(), // house, apartment, condo, etc.
  listingType: text("listing_type").notNull(), // for sale, for rent
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }).notNull(),
  squareFeet: integer("square_feet").notNull(),
  yearBuilt: integer("year_built"),
  status: text("status").notNull().default("active"), // active, draft, sold, rented
  views: integer("views").notNull().default(0),
  sellerId: integer("seller_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

// Property Features schema
export const propertyFeatures = pgTable("property_features", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  hasPool: boolean("has_pool").notNull().default(false),
  hasGarden: boolean("has_garden").notNull().default(false),
  hasGarage: boolean("has_garage").notNull().default(false),
  hasBalcony: boolean("has_balcony").notNull().default(false),
  hasAirConditioning: boolean("has_air_conditioning").notNull().default(false),
  hasGym: boolean("has_gym").notNull().default(false),
  hasSecuritySystem: boolean("has_security_system").notNull().default(false),
  hasFireplace: boolean("has_fireplace").notNull().default(false),
});

export const insertPropertyFeaturesSchema = createInsertSchema(propertyFeatures).omit({
  id: true,
});

export type InsertPropertyFeatures = z.infer<typeof insertPropertyFeaturesSchema>;
export type PropertyFeatures = typeof propertyFeatures.$inferSelect;

// Property Images schema
export const propertyImages = pgTable("property_images", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  imageUrl: text("image_url").notNull(),
  isMain: boolean("is_main").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPropertyImageSchema = createInsertSchema(propertyImages).omit({
  id: true,
  createdAt: true,
});

export type InsertPropertyImage = z.infer<typeof insertPropertyImageSchema>;
export type PropertyImage = typeof propertyImages.$inferSelect;

// Inquiries schema
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  isViewed: boolean("is_viewed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  isViewed: true,
  createdAt: true,
});

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;
