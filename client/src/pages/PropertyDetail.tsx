import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { 
  BedDouble, 
  Bath, 
  Maximize2, 
  Calendar, 
  Share2, 
  Heart, 
  Home, 
  MapPin,
  Waves,
  Flower2,
  Car,
  Fence,
  Wind,
  Dumbbell,
  ShieldCheck,
  Flame
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Property, PropertyFeatures } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form validation schema for inquiry
const inquiryFormSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  phone: z.string().optional(),
  message: z.string().min(10, { message: "Message should be at least 10 characters" }),
});

type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(false);
  const propertyId = parseInt(id);

  if (isNaN(propertyId)) {
    setLocation("/not-found");
    return null;
  }

  // Fetch property details
  const { data: property, isLoading, error } = useQuery<Property & { features: PropertyFeatures | null }>({
    queryKey: [`/api/properties/${propertyId}`],
  });

  // Contact form submission
  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "I'm interested in this property and would like to schedule a viewing."
    }
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: InquiryFormValues) => {
      return apiRequest("POST", `/api/properties/${propertyId}/inquiries`, data);
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Sent!",
        description: "Your inquiry has been sent to the seller.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send inquiry. Please try again later.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: InquiryFormValues) => {
    inquiryMutation.mutate(data);
  };

  // Toggle favorite status
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite 
        ? "Property removed from your saved listings" 
        : "Property added to your saved listings",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold mb-2">Property Not Found</h2>
          <p className="text-gray-500 mb-6">The property you're looking for could not be found.</p>
          <Button onClick={() => setLocation("/buy")}>Browse Properties</Button>
        </div>
      </div>
    );
  }

  const formatPrice = () => {
    if (property.listingType === "For Rent") {
      return `$${Number(property.price).toLocaleString()}/mo`;
    } else {
      return `$${Number(property.price).toLocaleString()}`;
    }
  };

  // Map property features to icon components
  const getFeatureIcon = (featureName: string) => {
    switch (featureName) {
      case "Pool": return <Waves className="h-5 w-5" />;
      case "Garden": return <Flower2 className="h-5 w-5" />;
      case "Garage": return <Car className="h-5 w-5" />;
      case "Balcony": return <Fence className="h-5 w-5" />;
      case "Air Conditioning": return <Wind className="h-5 w-5" />;
      case "Gym": return <Dumbbell className="h-5 w-5" />;
      case "Security System": return <ShieldCheck className="h-5 w-5" />;
      case "Fireplace": return <Flame className="h-5 w-5" />;
      default: return <Home className="h-5 w-5" />;
    }
  };

  // Extract features from property.features object
  const getPropertyFeatures = () => {
    if (!property.features) return [];
    
    const featuresList = [];
    if (property.features.hasPool) featuresList.push("Pool");
    if (property.features.hasGarden) featuresList.push("Garden");
    if (property.features.hasGarage) featuresList.push("Garage");
    if (property.features.hasBalcony) featuresList.push("Balcony");
    if (property.features.hasAirConditioning) featuresList.push("Air Conditioning");
    if (property.features.hasGym) featuresList.push("Gym");
    if (property.features.hasSecuritySystem) featuresList.push("Security System");
    if (property.features.hasFireplace) featuresList.push("Fireplace");
    
    return featuresList;
  };

  const features = getPropertyFeatures();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">{property.title}</h1>
            <p className="text-gray-600 flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {property.address}, {property.city}, {property.state} {property.zipCode}
            </p>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <span className="text-3xl font-bold text-accent mr-4">{formatPrice()}</span>
            <span className="bg-primary text-white text-sm px-3 py-1 rounded-full">
              {property.listingType}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {/* Main image */}
          <div className="md:col-span-2 lg:col-span-3">
            {property.images && property.images.length > 0 ? (
              <img 
                src={property.images[0].imageUrl} 
                alt={property.title}
                className="w-full h-[400px] object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
                <Home className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Property details */}
          <div className="flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-4">
              {property.images && property.images.slice(1, 5).map((image, index) => (
                <div key={image.id} className="aspect-square">
                  <img 
                    src={image.imageUrl} 
                    alt={`${property.title} - Image ${index + 2}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
              
              {/* If there are less than 4 additional images, fill with placeholders */}
              {property.images && Array.from({ length: Math.max(0, 4 - (property.images.length - 1)) }).map((_, index) => (
                <div key={`placeholder-${index}`} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-between">
              <Button variant="outline" className="w-[48%]" onClick={() => window.open(`https://maps.google.com/?q=${property.address},${property.city},${property.state}`)}>
                <MapPin className="mr-2 h-4 w-4" /> Map
              </Button>
              <Button variant="outline" className="w-[48%]" onClick={handleToggleFavorite}>
                <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-accent text-accent' : ''}`} /> 
                {isFavorite ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* All images carousel for mobile */}
        {property.images && property.images.length > 0 && (
          <div className="block md:hidden mb-8">
            <Carousel>
              <CarouselContent>
                {property.images.map((image, index) => (
                  <CarouselItem key={image.id}>
                    <div className="p-1">
                      <img 
                        src={image.imageUrl} 
                        alt={`${property.title} - Image ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column - Property details */}
          <div className="md:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h2 className="text-xl font-heading font-semibold mb-4">Property Details</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col items-center">
                      <BedDouble className="text-primary mb-2" />
                      <span className="text-gray-500 text-sm">Bedrooms</span>
                      <span className="font-semibold">{property.bedrooms}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col items-center">
                      <Bath className="text-primary mb-2" />
                      <span className="text-gray-500 text-sm">Bathrooms</span>
                      <span className="font-semibold">{property.bathrooms}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col items-center">
                      <Maximize2 className="text-primary mb-2" />
                      <span className="text-gray-500 text-sm">Square Feet</span>
                      <span className="font-semibold">{property.squareFeet.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col items-center">
                      <Calendar className="text-primary mb-2" />
                      <span className="text-gray-500 text-sm">Year Built</span>
                      <span className="font-semibold">{property.yearBuilt || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-heading font-semibold mb-4">Description</h2>
                  <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="space-y-6">
                <div>
                  <h2 className="text-xl font-heading font-semibold mb-4">Property Features</h2>
                  
                  {features.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {features.map((feature, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center">
                          <div className="bg-primary/10 p-2 rounded-full mr-3 text-primary">
                            {getFeatureIcon(feature)}
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No additional features listed for this property.</p>
                  )}
                </div>
                
                <div>
                  <h2 className="text-xl font-heading font-semibold mb-4">Property Type</h2>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p>{property.propertyType}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="location">
                <div>
                  <h2 className="text-xl font-heading font-semibold mb-4">Location</h2>
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBVeaq0Ix9DJo5JiYdGUqE2JXUwxJP6Qeo&q=${encodeURIComponent(`${property.address}, ${property.city}, ${property.state} ${property.zipCode}`)}`}
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p className="text-gray-700">
                    {property.address}, {property.city}, {property.state} {property.zipCode}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right column - Contact form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Contact Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Your message" 
                              className="min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={inquiryMutation.isPending}
                    >
                      {inquiryMutation.isPending ? 'Sending...' : 'Send Inquiry'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4">
                <Button variant="outline" className="w-full" onClick={() => window.location.href = `tel:5551234567`}>
                  Call Agent
                </Button>
              </CardFooter>
            </Card>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Property Insights</h3>
              <p className="text-sm text-blue-700 mb-2">
                This property has been viewed {property.views} times.
              </p>
              <p className="text-sm text-blue-700">
                Listed on {new Date(property.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
