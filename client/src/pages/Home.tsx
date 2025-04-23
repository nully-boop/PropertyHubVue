import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import PropertyFilter from "@/components/PropertyFilter";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Property } from "@/types";

export default function Home() {
  const [, setLocation] = useLocation();
  const [activePage, setActivePage] = useState('buyer');
  
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });
  
  const handleFilter = (filters: any) => {
    // Convert filters to URL parameters
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        // For arrays like features, join with commas
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(','));
          }
        } else {
          params.append(key, value as string);
        }
      }
    });
    
    // Navigate to the buy page with filters
    setLocation(`/buy?${params.toString()}`);
  };
  
  const switchPage = (page: string) => {
    setActivePage(page);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Type Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
          <Button
            variant={activePage === 'buyer' ? 'default' : 'ghost'}
            className={activePage === 'buyer' ? 'bg-white shadow text-primary' : 'text-gray-600'}
            onClick={() => switchPage('buyer')}
          >
            I'm a Buyer
          </Button>
          <Button
            variant={activePage === 'seller' ? 'default' : 'ghost'}
            className={activePage === 'seller' ? 'bg-white shadow text-primary' : 'text-gray-600'}
            onClick={() => switchPage('seller')}
          >
            I'm a Seller
          </Button>
        </div>
      </div>

      {activePage === 'buyer' ? (
        <div className="space-y-8">
          <PropertyFilter onFilter={handleFilter} />
          
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading font-semibold">Featured Properties</h2>
              <Link href="/buy">
                <a className="text-primary hover:underline">View all properties →</a>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden h-72 animate-pulse">
                    <div className="bg-gray-200 h-48"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.slice(0, 4).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No properties found</p>
              </div>
            )}
            
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setLocation('/buy')}
              >
                Browse All Properties
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <h2 className="text-2xl font-heading font-bold mb-4">List and Manage Your Properties</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of property owners who trust HomeHub to market and manage their real estate assets. 
            Our simple interface helps you create beautiful listings and track inquiries.
          </p>
          <Button 
            size="lg"
            onClick={() => setLocation('/sell')}
          >
            Get Started
          </Button>
        </div>
      )}
    </div>
  );
}
