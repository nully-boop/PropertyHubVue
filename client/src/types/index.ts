// User types
export interface User {
  id: number;
  username: string;
  password: string;
}

// Property types
export interface Property {
  id: number;
  title: string;
  description: string;
  price: string | number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  listingType: string; // "For Sale" or "For Rent"
  bedrooms: number;
  bathrooms: string | number;
  squareFeet: number;
  yearBuilt?: number;
  status: string; // "active", "draft", "sold", "rented"
  views: number;
  sellerId: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  images: PropertyImage[];
  features?: PropertyFeatures;
  inquiryCount?: number;
}

// Property features types
export interface PropertyFeatures {
  id: number;
  propertyId: number;
  hasPool: boolean;
  hasGarden: boolean;
  hasGarage: boolean;
  hasBalcony: boolean;
  hasAirConditioning: boolean;
  hasGym: boolean;
  hasSecuritySystem: boolean;
  hasFireplace: boolean;
}

// Property image types
export interface PropertyImage {
  id: number;
  propertyId: number;
  imageUrl: string;
  isMain: boolean;
  createdAt: string | Date;
}

// Inquiry types
export interface Inquiry {
  id: number;
  propertyId: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  isViewed: boolean;
  createdAt: string | Date;
}

// Search filter types
export interface PropertyFilters {
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
}
