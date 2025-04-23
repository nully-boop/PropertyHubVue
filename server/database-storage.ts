import { 
  users, type User, type InsertUser,
  properties, type Property, type InsertProperty,
  propertyFeatures, type PropertyFeatures, type InsertPropertyFeatures,
  propertyImages, type PropertyImage, type InsertPropertyImage,
  inquiries, type Inquiry, type InsertInquiry
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, like, inArray, sql, or } from "drizzle-orm";
import type { IStorage, PropertyFilters } from "./storage";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Property operations
  async getProperties(filters?: PropertyFilters): Promise<(Property & { images: PropertyImage[]; features: PropertyFeatures | null; })[]> {
    let query = db.select().from(properties);
    
    if (filters) {
      let conditions = [];
      
      if (filters.location) {
        conditions.push(
          or(
            like(properties.address, `%${filters.location}%`),
            like(properties.city, `%${filters.location}%`),
            like(properties.state, `%${filters.location}%`),
            like(properties.zipCode, `%${filters.location}%`)
          )
        );
      }
      
      if (filters.propertyType && filters.propertyType !== 'any_type') {
        conditions.push(eq(properties.propertyType, filters.propertyType));
      }
      
      if (filters.listingType && filters.listingType !== 'any_listing') {
        conditions.push(eq(properties.listingType, filters.listingType));
      }
      
      if (filters.minPrice) {
        conditions.push(gte(sql`CAST(${properties.price} AS NUMERIC)`, filters.minPrice));
      }
      
      if (filters.maxPrice) {
        conditions.push(sql`CAST(${properties.price} AS NUMERIC) <= ${filters.maxPrice}`);
      }
      
      if (filters.minBedrooms) {
        conditions.push(gte(properties.bedrooms, filters.minBedrooms));
      }
      
      if (filters.minBathrooms) {
        conditions.push(sql`CAST(${properties.bathrooms} AS NUMERIC) >= ${filters.minBathrooms}`);
      }
      
      if (filters.minSquareFeet) {
        conditions.push(gte(properties.squareFeet, filters.minSquareFeet));
      }
      
      if (filters.minYearBuilt) {
        conditions.push(gte(properties.yearBuilt as any, filters.minYearBuilt));
      }
      
      if (filters.status && filters.status !== 'any_status') {
        conditions.push(eq(properties.status, filters.status));
      }

      if (conditions.length > 0) {
        for (const condition of conditions) {
          query = query.where(condition);
        }
      }
    }
    
    const propertiesResult = await query;
    
    // Fetch images and features for each property
    const result = await Promise.all(
      propertiesResult.map(async (property) => {
        const images = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, property.id));
        const featuresResult = await db.select().from(propertyFeatures).where(eq(propertyFeatures.propertyId, property.id));
        const features = featuresResult.length > 0 ? featuresResult[0] : null;
        
        return { ...property, images, features };
      })
    );
    
    return result;
  }

  async getProperty(id: number): Promise<(Property & { images: PropertyImage[]; features: PropertyFeatures | null; }) | undefined> {
    const propertyResult = await db.select().from(properties).where(eq(properties.id, id));
    
    if (propertyResult.length === 0) {
      return undefined;
    }
    
    const property = propertyResult[0];
    const images = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, id));
    const featuresResult = await db.select().from(propertyFeatures).where(eq(propertyFeatures.propertyId, id));
    const features = featuresResult.length > 0 ? featuresResult[0] : null;
    
    return { ...property, images, features };
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const result = await db.insert(properties).values(property).returning();
    return result[0];
  }

  async updateProperty(id: number, propertyData: Partial<InsertProperty>): Promise<Property | undefined> {
    const result = await db.update(properties)
      .set(propertyData)
      .where(eq(properties.id, id))
      .returning();
    
    return result[0];
  }

  async deleteProperty(id: number): Promise<boolean> {
    // Delete related data first
    await db.delete(propertyImages).where(eq(propertyImages.propertyId, id));
    await db.delete(propertyFeatures).where(eq(propertyFeatures.propertyId, id));
    await db.delete(inquiries).where(eq(inquiries.propertyId, id));
    
    // Delete the property
    const result = await db.delete(properties).where(eq(properties.id, id)).returning();
    return result.length > 0;
  }

  async incrementPropertyViews(id: number): Promise<void> {
    await db.update(properties)
      .set({ views: sql`${properties.views} + 1` })
      .where(eq(properties.id, id));
  }

  async getPropertiesBySeller(sellerId: number): Promise<(Property & { inquiryCount: number; })[]> {
    const propertiesResult = await db.select().from(properties).where(eq(properties.sellerId, sellerId));
    
    const result = await Promise.all(
      propertiesResult.map(async (property) => {
        const inquiryCount = await db.select({ count: sql<number>`count(*)` })
          .from(inquiries)
          .where(eq(inquiries.propertyId, property.id));
        
        return { ...property, inquiryCount: inquiryCount[0].count };
      })
    );
    
    return result;
  }

  // Property images operations
  async addPropertyImage(image: InsertPropertyImage): Promise<PropertyImage> {
    // Check if this is the first image for this property, if so, make it the main image
    const existingImages = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, image.propertyId));
    const isMain = existingImages.length === 0 ? true : image.isMain;
    
    // If this is set as main image, reset all other images
    if (isMain) {
      await db.update(propertyImages)
        .set({ isMain: false })
        .where(eq(propertyImages.propertyId, image.propertyId));
    }
    
    const result = await db.insert(propertyImages).values({ ...image, isMain }).returning();
    return result[0];
  }

  async getPropertyImages(propertyId: number): Promise<PropertyImage[]> {
    return await db.select().from(propertyImages).where(eq(propertyImages.propertyId, propertyId));
  }

  async deletePropertyImage(id: number): Promise<boolean> {
    const result = await db.delete(propertyImages).where(eq(propertyImages.id, id)).returning();
    return result.length > 0;
  }

  async setMainPropertyImage(id: number, propertyId: number): Promise<boolean> {
    // Reset all images for this property
    await db.update(propertyImages)
      .set({ isMain: false })
      .where(eq(propertyImages.propertyId, propertyId));
    
    // Set the new main image
    const result = await db.update(propertyImages)
      .set({ isMain: true })
      .where(eq(propertyImages.id, id))
      .returning();
    
    return result.length > 0;
  }

  // Property features operations
  async getPropertyFeatures(propertyId: number): Promise<PropertyFeatures | undefined> {
    const result = await db.select().from(propertyFeatures).where(eq(propertyFeatures.propertyId, propertyId));
    return result[0];
  }

  async updatePropertyFeatures(propertyId: number, featureData: Partial<InsertPropertyFeatures>): Promise<PropertyFeatures> {
    // Check if features already exist for this property
    const existingFeatures = await db.select().from(propertyFeatures).where(eq(propertyFeatures.propertyId, propertyId));
    
    if (existingFeatures.length > 0) {
      // Update existing features
      const result = await db.update(propertyFeatures)
        .set(featureData)
        .where(eq(propertyFeatures.propertyId, propertyId))
        .returning();
      
      return result[0];
    } else {
      // Create new features with defaults for missing boolean fields
      const completeFeatureData = {
        propertyId,
        hasPool: featureData.hasPool || false,
        hasGarden: featureData.hasGarden || false,
        hasGarage: featureData.hasGarage || false,
        hasBalcony: featureData.hasBalcony || false,
        hasAirConditioning: featureData.hasAirConditioning || false,
        hasGym: featureData.hasGym || false,
        hasSecuritySystem: featureData.hasSecuritySystem || false,
        hasFireplace: featureData.hasFireplace || false,
        ...featureData
      };
      const result = await db.insert(propertyFeatures).values(completeFeatureData).returning();
      return result[0];
    }
  }

  // Inquiry operations
  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const result = await db.insert(inquiries).values(inquiry).returning();
    return result[0];
  }

  async getInquiriesByProperty(propertyId: number): Promise<Inquiry[]> {
    return await db.select().from(inquiries).where(eq(inquiries.propertyId, propertyId));
  }

  async getInquiriesBySeller(sellerId: number): Promise<Inquiry[]> {
    const sellerProperties = await db.select().from(properties).where(eq(properties.sellerId, sellerId));
    const propertyIds = sellerProperties.map(property => property.id);
    
    if (propertyIds.length === 0) {
      return [];
    }
    
    return await db.select().from(inquiries).where(inArray(inquiries.propertyId, propertyIds));
  }

  async markInquiryAsViewed(id: number): Promise<boolean> {
    const result = await db.update(inquiries)
      .set({ isViewed: true })
      .where(eq(inquiries.id, id))
      .returning();
    
    return result.length > 0;
  }
}