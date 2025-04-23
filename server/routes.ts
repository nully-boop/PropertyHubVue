import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertPropertyImageSchema, insertInquirySchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Setup file upload with multer
const storage_dir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(storage_dir)) {
  fs.mkdirSync(storage_dir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, storage_dir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up demo data
  await setupDemoData();

  // Get all properties with optional filters
  app.get("/api/properties", async (req: Request, res: Response) => {
    try {
      const filters = {
        location: req.query.location as string | undefined,
        propertyType: req.query.propertyType as string | undefined,
        listingType: req.query.listingType as string | undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        minBedrooms: req.query.minBedrooms ? Number(req.query.minBedrooms) : undefined,
        minBathrooms: req.query.minBathrooms ? Number(req.query.minBathrooms) : undefined,
        minSquareFeet: req.query.minSquareFeet ? Number(req.query.minSquareFeet) : undefined,
        minYearBuilt: req.query.minYearBuilt ? Number(req.query.minYearBuilt) : undefined,
        features: req.query.features ? (req.query.features as string).split(",") : undefined,
        status: req.query.status as string | undefined,
      };

      const properties = await storage.getProperties(filters);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  // Get a single property
  app.get("/api/properties/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid property ID" });
      }

      const property = await storage.getProperty(id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      // Increment view count
      await storage.incrementPropertyViews(id);

      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ error: "Failed to fetch property" });
    }
  });

  // Create a new property
  app.post("/api/properties", async (req: Request, res: Response) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);
      
      // Create the property
      const property = await storage.createProperty(propertyData);
      
      // Set up features if provided
      if (req.body.features) {
        await storage.updatePropertyFeatures(property.id, {
          propertyId: property.id,
          hasPool: req.body.features.includes("Pool"),
          hasGarden: req.body.features.includes("Garden"),
          hasGarage: req.body.features.includes("Garage"),
          hasBalcony: req.body.features.includes("Balcony"),
          hasAirConditioning: req.body.features.includes("Air Conditioning"),
          hasGym: req.body.features.includes("Gym"),
          hasSecuritySystem: req.body.features.includes("Security System"),
          hasFireplace: req.body.features.includes("Fireplace"),
        });
      }
      
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating property:", error);
      res.status(500).json({ error: "Failed to create property" });
    }
  });

  // Update a property
  app.patch("/api/properties/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid property ID" });
      }

      const propertyData = req.body;
      
      // Update the property
      const property = await storage.updateProperty(id, propertyData);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      
      // Update features if provided
      if (req.body.features) {
        await storage.updatePropertyFeatures(id, {
          propertyId: id,
          hasPool: req.body.features.includes("Pool"),
          hasGarden: req.body.features.includes("Garden"),
          hasGarage: req.body.features.includes("Garage"),
          hasBalcony: req.body.features.includes("Balcony"),
          hasAirConditioning: req.body.features.includes("Air Conditioning"),
          hasGym: req.body.features.includes("Gym"),
          hasSecuritySystem: req.body.features.includes("Security System"),
          hasFireplace: req.body.features.includes("Fireplace"),
        });
      }
      
      res.json(property);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ error: "Failed to update property" });
    }
  });

  // Delete a property
  app.delete("/api/properties/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid property ID" });
      }

      const deleted = await storage.deleteProperty(id);
      if (!deleted) {
        return res.status(404).json({ error: "Property not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ error: "Failed to delete property" });
    }
  });

  // Get properties for a seller
  app.get("/api/seller/:sellerId/properties", async (req: Request, res: Response) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (isNaN(sellerId)) {
        return res.status(400).json({ error: "Invalid seller ID" });
      }

      const properties = await storage.getPropertiesBySeller(sellerId);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching seller properties:", error);
      res.status(500).json({ error: "Failed to fetch seller properties" });
    }
  });

  // Upload property images
  app.post("/api/properties/:id/images", upload.array("images", 10), async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ error: "Invalid property ID" });
      }

      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      const uploadedImages = req.files as Express.Multer.File[];
      if (!uploadedImages || uploadedImages.length === 0) {
        return res.status(400).json({ error: "No images uploaded" });
      }

      const savedImages = [];
      for (const file of uploadedImages) {
        const imageData = {
          propertyId,
          imageUrl: `/uploads/${file.filename}`,
          isMain: false, // Will be set to true for the first image if no other main image exists
        };

        const image = await storage.addPropertyImage(imageData);
        savedImages.push(image);
      }

      res.status(201).json(savedImages);
    } catch (error) {
      console.error("Error uploading images:", error);
      res.status(500).json({ error: "Failed to upload images" });
    }
  });

  // Delete a property image
  app.delete("/api/property-images/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid image ID" });
      }

      const deleted = await storage.deletePropertyImage(id);
      if (!deleted) {
        return res.status(404).json({ error: "Image not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  });

  // Set main property image
  app.patch("/api/properties/:propertyId/images/:id/main", async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const imageId = parseInt(req.params.id);
      
      if (isNaN(propertyId) || isNaN(imageId)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const success = await storage.setMainPropertyImage(imageId, propertyId);
      if (!success) {
        return res.status(404).json({ error: "Image or property not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error setting main image:", error);
      res.status(500).json({ error: "Failed to set main image" });
    }
  });

  // Create a property inquiry
  app.post("/api/properties/:id/inquiries", async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ error: "Invalid property ID" });
      }

      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      const inquiryData = insertInquirySchema.parse({
        ...req.body,
        propertyId
      });
      
      const inquiry = await storage.createInquiry(inquiryData);
      res.status(201).json(inquiry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating inquiry:", error);
      res.status(500).json({ error: "Failed to create inquiry" });
    }
  });

  // Get inquiries for a property
  app.get("/api/properties/:id/inquiries", async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ error: "Invalid property ID" });
      }

      const inquiries = await storage.getInquiriesByProperty(propertyId);
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });

  // Get inquiries for a seller
  app.get("/api/seller/:sellerId/inquiries", async (req: Request, res: Response) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (isNaN(sellerId)) {
        return res.status(400).json({ error: "Invalid seller ID" });
      }

      const inquiries = await storage.getInquiriesBySeller(sellerId);
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching seller inquiries:", error);
      res.status(500).json({ error: "Failed to fetch seller inquiries" });
    }
  });

  // Mark inquiry as viewed
  app.patch("/api/inquiries/:id/view", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid inquiry ID" });
      }

      const success = await storage.markInquiryAsViewed(id);
      if (!success) {
        return res.status(404).json({ error: "Inquiry not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error marking inquiry as viewed:", error);
      res.status(500).json({ error: "Failed to mark inquiry as viewed" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static(storage_dir));

  const httpServer = createServer(app);
  return httpServer;
}

// Set up demo data
async function setupDemoData() {
  try {
    // Create a demo user if none exists
    let demoUser = await storage.getUserByUsername("demo");
    if (!demoUser) {
      demoUser = await storage.createUser({
        username: "demo",
        password: "demo123"
      });
    }

    // Check if we already have properties, if not create demo properties
    const existingProperties = await storage.getProperties();
    if (existingProperties.length === 0) {
      // Modern Family Home
      const property1 = await storage.createProperty({
        title: "Modern Family Home",
        description: "Beautiful modern family home in a quiet neighborhood with access to great schools and amenities.",
        price: "425000",
        address: "123 Main St",
        city: "Austin",
        state: "TX",
        zipCode: "78701",
        propertyType: "House",
        listingType: "For Sale",
        bedrooms: 3,
        bathrooms: "2",
        squareFeet: 1850,
        yearBuilt: 2018,
        sellerId: demoUser.id,
        status: "active"
      });

      await storage.updatePropertyFeatures(property1.id, {
        propertyId: property1.id,
        hasPool: true,
        hasGarden: true,
        hasGarage: true,
        hasBalcony: false,
        hasAirConditioning: true,
        hasGym: false,
        hasSecuritySystem: true,
        hasFireplace: true
      });

      await storage.addPropertyImage({
        propertyId: property1.id,
        imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        isMain: true
      });

      // Luxury Apartment
      const property2 = await storage.createProperty({
        title: "Luxury Apartment",
        description: "High-end luxury apartment in the heart of the city with stunning views and premium amenities.",
        price: "2850",
        address: "456 Park Ave",
        city: "New York",
        state: "NY",
        zipCode: "10022",
        propertyType: "Apartment",
        listingType: "For Rent",
        bedrooms: 2,
        bathrooms: "2",
        squareFeet: 1100,
        yearBuilt: 2015,
        sellerId: demoUser.id,
        status: "active"
      });

      await storage.updatePropertyFeatures(property2.id, {
        propertyId: property2.id,
        hasPool: false,
        hasGarden: false,
        hasGarage: true,
        hasBalcony: true,
        hasAirConditioning: true,
        hasGym: true,
        hasSecuritySystem: true,
        hasFireplace: false
      });

      await storage.addPropertyImage({
        propertyId: property2.id,
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        isMain: true
      });

      // Contemporary Townhouse
      const property3 = await storage.createProperty({
        title: "Contemporary Townhouse",
        description: "Stylish and modern townhouse with high-end finishes and a great location close to entertainment and dining.",
        price: "575000",
        address: "789 Oak Dr",
        city: "Chicago",
        state: "IL",
        zipCode: "60611",
        propertyType: "Townhouse",
        listingType: "For Sale",
        bedrooms: 4,
        bathrooms: "3",
        squareFeet: 2200,
        yearBuilt: 2019,
        sellerId: demoUser.id,
        status: "active"
      });

      await storage.updatePropertyFeatures(property3.id, {
        propertyId: property3.id,
        hasPool: false,
        hasGarden: true,
        hasGarage: true,
        hasBalcony: true,
        hasAirConditioning: true,
        hasGym: false,
        hasSecuritySystem: true,
        hasFireplace: true
      });

      await storage.addPropertyImage({
        propertyId: property3.id,
        imageUrl: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        isMain: true
      });

      // Oceanfront Cottage
      const property4 = await storage.createProperty({
        title: "Oceanfront Cottage",
        description: "Charming beachfront cottage with direct ocean access and stunning panoramic views.",
        price: "3900",
        address: "101 Beach Rd",
        city: "Miami",
        state: "FL",
        zipCode: "33139",
        propertyType: "House",
        listingType: "For Rent",
        bedrooms: 3,
        bathrooms: "2",
        squareFeet: 1650,
        yearBuilt: 2010,
        sellerId: demoUser.id,
        status: "active"
      });

      await storage.updatePropertyFeatures(property4.id, {
        propertyId: property4.id,
        hasPool: true,
        hasGarden: true,
        hasGarage: false,
        hasBalcony: true,
        hasAirConditioning: true,
        hasGym: false,
        hasSecuritySystem: true,
        hasFireplace: false
      });

      await storage.addPropertyImage({
        propertyId: property4.id,
        imageUrl: "https://images.unsplash.com/photo-1584738766473-61c083514bf4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        isMain: true
      });

      // Add a draft property
      await storage.createProperty({
        title: "City Apartment",
        description: "Urban apartment in a prime downtown location with easy access to public transit.",
        price: "450000",
        address: "555 Downtown Ave",
        city: "Seattle",
        state: "WA",
        zipCode: "98101",
        propertyType: "Apartment",
        listingType: "For Sale",
        bedrooms: 2,
        bathrooms: "2",
        squareFeet: 950,
        yearBuilt: 2017,
        sellerId: demoUser.id,
        status: "draft"
      });

      // Create demo inquiries
      await storage.createInquiry({
        propertyId: property1.id,
        name: "John Smith",
        email: "john@example.com",
        phone: "555-123-4567",
        message: "I'm interested in viewing this property. When would be a good time to schedule a showing?"
      });

      await storage.createInquiry({
        propertyId: property1.id,
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "555-987-6543",
        message: "Does this property have a finished basement? Also, how old is the roof?"
      });

      await storage.createInquiry({
        propertyId: property3.id,
        name: "Michael Brown",
        email: "michael@example.com",
        phone: "555-456-7890",
        message: "I'm looking for a home in this area and would like to know if this property is still available."
      });
    }
  } catch (error) {
    console.error("Error setting up demo data:", error);
  }
}
