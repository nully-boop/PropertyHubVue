import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";

import { Property, PropertyFeatures } from "@/types";
import { UploadCloud } from "lucide-react";

// Create zod schema for property form
const propertyFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  price: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a valid number greater than 0"
  }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  zipCode: z.string().min(5, { message: "ZIP code is required" }),
  propertyType: z.string().min(1, { message: "Property type is required" }),
  listingType: z.string().min(1, { message: "Listing type is required" }),
  bedrooms: z.string().transform(val => Number(val)),
  bathrooms: z.string(),
  squareFeet: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Square feet must be a valid number greater than 0"
  }),
  yearBuilt: z.string().optional(),
  sellerId: z.number().default(1), // Default to demo user
  features: z.array(z.string()).optional(),
  status: z.string().default("active"),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  onSuccess: (property: Property) => void;
  property?: Property & { features?: PropertyFeatures };
  isEdit?: boolean;
}

export default function PropertyForm({ onSuccess, property, isEdit = false }: PropertyFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: property?.title || "",
      description: property?.description || "",
      price: property?.price?.toString() || "",
      address: property?.address || "",
      city: property?.city || "",
      state: property?.state || "",
      zipCode: property?.zipCode || "",
      propertyType: property?.propertyType || "",
      listingType: property?.listingType || "For Sale",
      bedrooms: property?.bedrooms?.toString() || "",
      bathrooms: property?.bathrooms?.toString() || "",
      squareFeet: property?.squareFeet?.toString() || "",
      yearBuilt: property?.yearBuilt?.toString() || "",
      sellerId: 1, // Default to demo seller
      status: property?.status || "active",
      features: property?.features ? getSelectedFeatures(property.features) : [],
    }
  });

  // Function to extract selected features from features object
  function getSelectedFeatures(features: PropertyFeatures): string[] {
    const selectedFeatures: string[] = [];
    if (features.hasPool) selectedFeatures.push("Pool");
    if (features.hasGarden) selectedFeatures.push("Garden");
    if (features.hasGarage) selectedFeatures.push("Garage");
    if (features.hasBalcony) selectedFeatures.push("Balcony");
    if (features.hasAirConditioning) selectedFeatures.push("Air Conditioning");
    if (features.hasGym) selectedFeatures.push("Gym");
    if (features.hasSecuritySystem) selectedFeatures.push("Security System");
    if (features.hasFireplace) selectedFeatures.push("Fireplace");
    return selectedFeatures;
  }
  
  const onSubmit = async (data: PropertyFormValues) => {
    try {
      let propertyId: number;
      
      // Create or update property
      if (isEdit && property) {
        // Update existing property
        const res = await apiRequest("PATCH", `/api/properties/${property.id}`, {
          ...data,
          features: data.features || []
        });
        const updatedProperty = await res.json();
        propertyId = updatedProperty.id;
        
        toast({
          title: "Property Updated",
          description: "Your property has been updated successfully."
        });
      } else {
        // Create new property
        const res = await apiRequest("POST", "/api/properties", {
          ...data,
          features: data.features || []
        });
        const newProperty = await res.json();
        propertyId = newProperty.id;
        
        toast({
          title: "Property Added",
          description: "Your property has been added successfully."
        });
      }
      
      // Upload images if there are any
      if (uploadedFiles.length > 0) {
        await uploadImages(propertyId);
      }
      
      // Fetch the complete property with images and features
      const propertyRes = await fetch(`/api/properties/${propertyId}`);
      const fullProperty = await propertyRes.json();
      
      // Call the success handler
      onSuccess(fullProperty);
      
    } catch (error) {
      console.error("Error saving property:", error);
      toast({
        title: "Error",
        description: "There was an error saving your property. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const uploadImages = async (propertyId: number) => {
    try {
      const formData = new FormData();
      
      uploadedFiles.forEach(file => {
        formData.append("images", file);
      });
      
      const response = await fetch(`/api/properties/${propertyId}/images`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload images");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const availableFeatures = [
    { id: "pool", label: "Pool" },
    { id: "garden", label: "Garden" },
    { id: "garage", label: "Garage" },
    { id: "balcony", label: "Balcony" },
    { id: "ac", label: "Air Conditioning" },
    { id: "gym", label: "Gym" },
    { id: "security", label: "Security System" },
    { id: "fireplace", label: "Fireplace" },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-heading font-bold mb-6">
          {isEdit ? "Edit Property" : "Add New Property"}
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Modern Family Home" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="Condo">Condo</SelectItem>
                        <SelectItem value="Townhouse">Townhouse</SelectItem>
                        <SelectItem value="Land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                        <Input placeholder="e.g. 450000" className="pl-7" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="listingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="For Sale" id="for-sale" />
                          <FormLabel htmlFor="for-sale" className="text-sm cursor-pointer">For Sale</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="For Rent" id="for-rent" />
                          <FormLabel htmlFor="for-rent" className="text-sm cursor-pointer">For Rent</FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP</FormLabel>
                      <FormControl>
                        <Input placeholder="ZIP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bedrooms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Studio</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bathrooms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="1.5">1.5</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="2.5">2.5</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="3.5">3.5</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="squareFeet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Size (sq ft)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1850" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="yearBuilt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Built</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2010" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your property..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel className="block text-sm font-medium text-gray-700 mb-2">Property Features</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableFeatures.map((feature) => (
                  <FormField
                    key={feature.id}
                    control={form.control}
                    name="features"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={feature.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(feature.label)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), feature.label])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== feature.label
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {feature.label}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <FormLabel className="block text-sm font-medium text-gray-700 mb-2">Property Images</FormLabel>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/90"
                    >
                      <span>Upload images</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">{uploadedFiles.length} file(s) selected</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {isEdit ? "Update Property" : "Add Property"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
