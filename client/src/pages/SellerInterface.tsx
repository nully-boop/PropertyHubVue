import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  PencilIcon, 
  EyeIcon, 
  AlertCircleIcon, 
  PlusIcon, 
  ArrowUpIcon, 
  CircleAlert 
} from "lucide-react";
import { Property, Inquiry } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PropertyForm from "@/components/PropertyForm";

export default function SellerInterface() {
  const [, setLocation] = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState("properties");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // For demo purposes, we're using a hardcoded seller ID (1)
  const sellerId = 1;

  // Fetch properties
  const { 
    data: properties,
    isLoading: propertiesLoading 
  } = useQuery<(Property & { inquiryCount: number })[]>({
    queryKey: [`/api/seller/${sellerId}/properties`],
  });

  // Fetch inquiries
  const { 
    data: inquiries,
    isLoading: inquiriesLoading
  } = useQuery<Inquiry[]>({
    queryKey: [`/api/seller/${sellerId}/inquiries`],
  });

  // Update property status mutation
  const updatePropertyStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/properties/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/seller/${sellerId}/properties`] });
      toast({
        title: "Status Updated",
        description: "Property status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update property status",
        variant: "destructive",
      });
    }
  });

  // Mark inquiry as viewed
  const markInquiryAsViewed = useMutation({
    mutationFn: async (inquiryId: number) => {
      await apiRequest("PATCH", `/api/inquiries/${inquiryId}/view`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/seller/${sellerId}/inquiries`] });
      toast({
        title: "Marked as Viewed",
        description: "Inquiry has been marked as viewed",
      });
    }
  });

  // Calculate dashboard stats
  const totalProperties = properties?.length || 0;
  const activeProperties = properties?.filter(p => p.status === "active").length || 0;
  const totalInquiries = inquiries?.length || 0;
  const newInquiries = inquiries?.filter(inq => !inq.isViewed).length || 0;

  const handlePropertyFormSuccess = (property: Property) => {
    setShowAddForm(false);
    queryClient.invalidateQueries({ queryKey: [`/api/seller/${sellerId}/properties`] });
    toast({
      title: "Success!",
      description: "Your property has been saved successfully",
    });
  };

  const handleViewProperty = (propertyId: number) => {
    setLocation(`/property/${propertyId}`);
  };

  const handleEditProperty = (propertyId: number) => {
    // In a full implementation, we'd show an edit form
    toast({
      title: "Edit Property",
      description: "Property editing would open here",
    });
  };

  const handleViewInquiry = (inquiryId: number) => {
    if (inquiries) {
      const inquiry = inquiries.find(inq => inq.id === inquiryId);
      if (inquiry && !inquiry.isViewed) {
        markInquiryAsViewed.mutate(inquiryId);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {showAddForm ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-heading font-bold">Add New Property</h2>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
          <PropertyForm onSuccess={handlePropertyFormSuccess} />
        </div>
      ) : (
        <>
          <Card className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-heading font-bold">Property Management Dashboard</h2>
              <Button onClick={() => setShowAddForm(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                <span>Add New Property</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-lg font-semibold mb-2">Your Properties</h3>
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-gray-800">{totalProperties}</span>
                  {totalProperties > 0 && (
                    <span className="text-green-500 ml-2 flex items-center text-sm">
                      <ArrowUpIcon className="h-4 w-4 mr-1" />
                      <span>1 new</span>
                    </span>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-lg font-semibold mb-2">Active Listings</h3>
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-gray-800">{activeProperties}</span>
                  <span className="text-gray-500 ml-2 text-sm">of {totalProperties} total</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-lg font-semibold mb-2">Inquiries</h3>
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-gray-800">{totalInquiries}</span>
                  {newInquiries > 0 && (
                    <span className="text-accent ml-2 flex items-center text-sm">
                      <CircleAlert className="h-4 w-4 mr-1" />
                      <span>{newInquiries} new</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex mb-4 border-b">
                <button
                  className={`py-2 px-4 font-medium ${activeTab === 'properties' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('properties')}
                >
                  Properties
                </button>
                <button
                  className={`py-2 px-4 font-medium ${activeTab === 'inquiries' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('inquiries')}
                >
                  Inquiries
                </button>
              </div>

              {activeTab === 'properties' ? (
                <div className="overflow-x-auto">
                  {propertiesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p>Loading your properties...</p>
                    </div>
                  ) : properties && properties.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Views</TableHead>
                          <TableHead>Inquiries</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {properties.map((property) => (
                          <TableRow key={property.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  {property.images && property.images.length > 0 ? (
                                    <img 
                                      className="h-10 w-10 rounded-md object-cover"
                                      src={property.images[0].imageUrl}
                                      alt={property.title}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-md bg-gray-200"></div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{property.title}</div>
                                  <div className="text-sm text-gray-500">{property.address}, {property.city}, {property.state}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                property.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {property.listingType === 'For Rent' 
                                ? `$${Number(property.price).toLocaleString()}/mo` 
                                : `$${Number(property.price).toLocaleString()}`
                              }
                            </TableCell>
                            <TableCell>{property.views}</TableCell>
                            <TableCell>{property.inquiryCount}</TableCell>
                            <TableCell className="whitespace-nowrap text-right text-sm font-medium">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-primary hover:text-primary mr-2"
                                onClick={() => handleEditProperty(property.id)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => handleViewProperty(property.id)}
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">No properties listed yet</h3>
                      <p className="text-gray-500 mb-4">Add your first property to get started</p>
                      <Button onClick={() => setShowAddForm(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Property
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {inquiriesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p>Loading inquiries...</p>
                    </div>
                  ) : inquiries && inquiries.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead>From</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inquiries.map((inquiry) => {
                          const property = properties?.find(p => p.id === inquiry.propertyId);
                          return (
                            <TableRow key={inquiry.id} className={!inquiry.isViewed ? "bg-blue-50" : undefined}>
                              <TableCell>
                                {property ? property.title : `Property #${inquiry.propertyId}`}
                              </TableCell>
                              <TableCell>{inquiry.name}</TableCell>
                              <TableCell>{inquiry.email}</TableCell>
                              <TableCell>{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  inquiry.isViewed
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {inquiry.isViewed ? 'Viewed' : 'New'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewInquiry(inquiry.id)}
                                >
                                  {!inquiry.isViewed && <AlertCircleIcon className="h-4 w-4 mr-1 text-blue-500" />}
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">No inquiries yet</h3>
                      <p className="text-gray-500">Inquiries from potential buyers will appear here</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {activeTab === 'properties' && (
            <PropertyForm onSuccess={handlePropertyFormSuccess} />
          )}
        </>
      )}
    </div>
  );
}
