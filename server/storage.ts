import { 
  users, type User, type InsertUser,
  properties, type Property, type InsertProperty,
  propertyFeatures, type PropertyFeatures, type InsertPropertyFeatures,
  propertyImages, type PropertyImage, type InsertPropertyImage,
  inquiries, type Inquiry, type InsertInquiry
} from "@shared/schema";

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Property operations
  getProperties(filters?: PropertyFilters): Promise<(Property & { images: PropertyImage[], features: PropertyFeatures | null })[]>;
  getProperty(id: number): Promise<(Property & { images: PropertyImage[], features: PropertyFeatures | null }) | undefined>;
  createProperty(property: InsertProperty, features?: InsertPropertyFeatures): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  incrementPropertyViews(id: number): Promise<void>;
  getPropertiesBySeller(sellerId: number): Promise<(Property & { inquiryCount: number })[]>;

  // Property images operations
  addPropertyImage(image: InsertPropertyImage): Promise<PropertyImage>;
  getPropertyImages(propertyId: number): Promise<PropertyImage[]>;
  deletePropertyImage(id: number): Promise<boolean>;
  setMainPropertyImage(id: number, propertyId: number): Promise<boolean>;

  // Property features operations
  getPropertyFeatures(propertyId: number): Promise<PropertyFeatures | undefined>;
  updatePropertyFeatures(propertyId: number, features: Partial<InsertPropertyFeatures>): Promise<PropertyFeatures>;

  // Inquiry operations
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiriesByProperty(propertyId: number): Promise<Inquiry[]>;
  getInquiriesBySeller(sellerId: number): Promise<Inquiry[]>;
  markInquiryAsViewed(id: number): Promise<boolean>;
}

export type PropertyFilters = {
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  listingType?: string;
  minBedrooms?: number;
  minBathrooms?: number;
  minSquareFeet?: number;
  minYearBuilt?: number;
  features?: string[];
  status?: string;
};

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private propertyFeatures: Map<number, PropertyFeatures>;
  private propertyImages: Map<number, PropertyImage[]>;
  private inquiries: Map<number, Inquiry>;
  
  private userIdCounter: number;
  private propertyIdCounter: number;
  private propertyFeaturesIdCounter: number;
  private propertyImageIdCounter: number;
  private inquiryIdCounter: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.propertyFeatures = new Map();
    this.propertyImages = new Map();
    this.inquiries = new Map();

    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.propertyFeaturesIdCounter = 1;
    this.propertyImageIdCounter = 1;
    this.inquiryIdCounter = 1;

    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Add demo user
    this.createUser({
      username: "demo",
      password: "demo123"
    });

    // Sample properties will be added here
    // We'll add them programmatically in routes
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Property operations
  async getProperties(filters?: PropertyFilters): Promise<(Property & { images: PropertyImage[], features: PropertyFeatures | null })[]> {
    let properties = Array.from(this.properties.values());

    if (filters) {
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        properties = properties.filter(p => 
          p.address.toLowerCase().includes(locationLower) || 
          p.city.toLowerCase().includes(locationLower) || 
          p.state.toLowerCase().includes(locationLower) || 
          p.zipCode.toLowerCase().includes(locationLower)
        );
      }

      if (filters.propertyType && filters.propertyType !== 'Any Type') {
        properties = properties.filter(p => p.propertyType === filters.propertyType);
      }

      if (filters.listingType) {
        properties = properties.filter(p => p.listingType === filters.listingType);
      }

      if (filters.minPrice) {
        properties = properties.filter(p => Number(p.price) >= filters.minPrice!);
      }

      if (filters.maxPrice) {
        properties = properties.filter(p => Number(p.price) <= filters.maxPrice!);
      }

      if (filters.minBedrooms) {
        properties = properties.filter(p => p.bedrooms >= filters.minBedrooms!);
      }

      if (filters.minBathrooms) {
        properties = properties.filter(p => Number(p.bathrooms) >= filters.minBathrooms!);
      }

      if (filters.minSquareFeet) {
        properties = properties.filter(p => p.squareFeet >= filters.minSquareFeet!);
      }

      if (filters.minYearBuilt) {
        properties = properties.filter(p => p.yearBuilt && p.yearBuilt >= filters.minYearBuilt!);
      }

      if (filters.status) {
        properties = properties.filter(p => p.status === filters.status);
      }

      if (filters.features && filters.features.length > 0) {
        properties = properties.filter(property => {
          const features = this.propertyFeatures.get(property.id);
          if (!features) return false;

          return filters.features!.every(feature => {
            switch (feature) {
              case 'Pool': return features.hasPool;
              case 'Garden': return features.hasGarden;
              case 'Garage': return features.hasGarage;
              case 'Balcony': return features.hasBalcony;
              case 'Air Conditioning': return features.hasAirConditioning;
              case 'Gym': return features.hasGym;
              case 'Security System': return features.hasSecuritySystem;
              case 'Fireplace': return features.hasFireplace;
              default: return false;
            }
          });
        });
      }
    }

    return properties.map(property => ({
      ...property,
      images: this.propertyImages.get(property.id) || [],
      features: this.propertyFeatures.get(property.id) || null
    }));
  }

  async getProperty(id: number): Promise<(Property & { images: PropertyImage[], features: PropertyFeatures | null }) | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;

    return {
      ...property,
      images: this.propertyImages.get(id) || [],
      features: this.propertyFeatures.get(id) || null
    };
  }

  async createProperty(property: InsertProperty, features?: InsertPropertyFeatures): Promise<Property> {
    const id = this.propertyIdCounter++;
    const now = new Date();
    
    const newProperty: Property = {
      ...property,
      id,
      views: 0,
      createdAt: now,
      updatedAt: now
    };
    
    this.properties.set(id, newProperty);
    
    // Create features if provided
    if (features) {
      const featureId = this.propertyFeaturesIdCounter++;
      const newFeatures: PropertyFeatures = {
        ...features,
        id: featureId,
        propertyId: id
      };
      
      this.propertyFeatures.set(id, newFeatures);
    }
    
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined> {
    const existingProperty = this.properties.get(id);
    if (!existingProperty) return undefined;

    const updatedProperty: Property = {
      ...existingProperty,
      ...property,
      updatedAt: new Date()
    };

    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const deleted = this.properties.delete(id);
    
    // Also delete related data
    this.propertyFeatures.delete(id);
    this.propertyImages.delete(id);
    
    // Delete related inquiries
    const inquiriesToDelete = Array.from(this.inquiries.values())
      .filter(inquiry => inquiry.propertyId === id);
      
    for (const inquiry of inquiriesToDelete) {
      this.inquiries.delete(inquiry.id);
    }
    
    return deleted;
  }

  async incrementPropertyViews(id: number): Promise<void> {
    const property = this.properties.get(id);
    if (property) {
      property.views += 1;
      this.properties.set(id, property);
    }
  }

  async getPropertiesBySeller(sellerId: number): Promise<(Property & { inquiryCount: number })[]> {
    const properties = Array.from(this.properties.values())
      .filter(property => property.sellerId === sellerId);
      
    return properties.map(property => {
      const inquiries = Array.from(this.inquiries.values())
        .filter(inquiry => inquiry.propertyId === property.id);
        
      return {
        ...property,
        inquiryCount: inquiries.length
      };
    });
  }

  // Property images operations
  async addPropertyImage(image: InsertPropertyImage): Promise<PropertyImage> {
    const id = this.propertyImageIdCounter++;
    const newImage: PropertyImage = {
      ...image,
      id,
      createdAt: new Date()
    };
    
    const propertyImages = this.propertyImages.get(image.propertyId) || [];
    
    // If this is the first image, set it as main
    if (propertyImages.length === 0) {
      newImage.isMain = true;
    }
    
    propertyImages.push(newImage);
    this.propertyImages.set(image.propertyId, propertyImages);
    
    return newImage;
  }

  async getPropertyImages(propertyId: number): Promise<PropertyImage[]> {
    return this.propertyImages.get(propertyId) || [];
  }

  async deletePropertyImage(id: number): Promise<boolean> {
    let deleted = false;
    
    for (const [propertyId, images] of this.propertyImages.entries()) {
      const imageIndex = images.findIndex(img => img.id === id);
      
      if (imageIndex !== -1) {
        const isMain = images[imageIndex].isMain;
        images.splice(imageIndex, 1);
        
        // If we deleted the main image and there are other images, set a new main
        if (isMain && images.length > 0) {
          images[0].isMain = true;
        }
        
        this.propertyImages.set(propertyId, images);
        deleted = true;
        break;
      }
    }
    
    return deleted;
  }

  async setMainPropertyImage(id: number, propertyId: number): Promise<boolean> {
    const images = this.propertyImages.get(propertyId);
    if (!images) return false;
    
    const imageIndex = images.findIndex(img => img.id === id);
    if (imageIndex === -1) return false;
    
    // Reset all images to not main and set the selected one to main
    for (const image of images) {
      image.isMain = image.id === id;
    }
    
    this.propertyImages.set(propertyId, images);
    return true;
  }

  // Property features operations
  async getPropertyFeatures(propertyId: number): Promise<PropertyFeatures | undefined> {
    return this.propertyFeatures.get(propertyId);
  }

  async updatePropertyFeatures(propertyId: number, features: Partial<InsertPropertyFeatures>): Promise<PropertyFeatures> {
    let propertyFeatures = this.propertyFeatures.get(propertyId);
    
    if (propertyFeatures) {
      // Update existing features
      propertyFeatures = {
        ...propertyFeatures,
        ...features
      };
    } else {
      // Create new features
      const id = this.propertyFeaturesIdCounter++;
      propertyFeatures = {
        id,
        propertyId,
        hasPool: features.hasPool || false,
        hasGarden: features.hasGarden || false,
        hasGarage: features.hasGarage || false,
        hasBalcony: features.hasBalcony || false,
        hasAirConditioning: features.hasAirConditioning || false,
        hasGym: features.hasGym || false,
        hasSecuritySystem: features.hasSecuritySystem || false,
        hasFireplace: features.hasFireplace || false,
      };
    }
    
    this.propertyFeatures.set(propertyId, propertyFeatures);
    return propertyFeatures;
  }

  // Inquiry operations
  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const id = this.inquiryIdCounter++;
    const newInquiry: Inquiry = {
      ...inquiry,
      id,
      isViewed: false,
      createdAt: new Date()
    };
    
    this.inquiries.set(id, newInquiry);
    return newInquiry;
  }

  async getInquiriesByProperty(propertyId: number): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values())
      .filter(inquiry => inquiry.propertyId === propertyId);
  }

  async getInquiriesBySeller(sellerId: number): Promise<Inquiry[]> {
    // Get all properties owned by this seller
    const sellerPropertyIds = Array.from(this.properties.values())
      .filter(property => property.sellerId === sellerId)
      .map(property => property.id);
      
    // Get all inquiries for those properties
    return Array.from(this.inquiries.values())
      .filter(inquiry => sellerPropertyIds.includes(inquiry.propertyId));
  }

  async markInquiryAsViewed(id: number): Promise<boolean> {
    const inquiry = this.inquiries.get(id);
    if (!inquiry) return false;
    
    inquiry.isViewed = true;
    this.inquiries.set(id, inquiry);
    return true;
  }
}

export const storage = new MemStorage();
