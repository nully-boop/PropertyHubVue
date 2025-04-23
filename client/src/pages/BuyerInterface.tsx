import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import PropertyFilter from "@/components/PropertyFilter";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property } from "@/types";

export default function BuyerInterface() {
  const [location, setLocation] = useLocation();
  const [filters, setFilters] = useState<any>({});
  const [sortOption, setSortOption] = useState("newest");
  const [page, setPage] = useState(1);
  const propertiesPerPage = 8;
  
  // Parse URL params to get initial filters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const initialFilters: any = {};
    
    params.forEach((value, key) => {
      if (key === 'features') {
        initialFilters[key] = value.split(',');
      } else {
        initialFilters[key] = value;
      }
    });
    
    setFilters(initialFilters);
  }, [location]);
  
  // Fetch properties with filters
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties', filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              searchParams.append(key, value.join(','));
            }
          } else {
            searchParams.append(key, value as string);
          }
        }
      });
      
      const response = await fetch(`/api/properties?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      return response.json();
    },
    enabled: Object.keys(filters).length > 0 || location === '/buy'
  });
  
  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
    
    // Update URL with filters
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(','));
          }
        } else {
          params.append(key, value as string);
        }
      }
    });
    
    setLocation(`/buy?${params.toString()}`);
    setPage(1); // Reset to first page when changing filters
  };
  
  const sortProperties = (properties: Property[]) => {
    if (!properties) return [];
    
    const sortedProperties = [...properties];
    
    switch (sortOption) {
      case "newest":
        return sortedProperties.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "price-high-low":
        return sortedProperties.sort((a, b) => 
          Number(b.price) - Number(a.price)
        );
      case "price-low-high":
        return sortedProperties.sort((a, b) => 
          Number(a.price) - Number(b.price)
        );
      case "most-viewed":
        return sortedProperties.sort((a, b) => b.views - a.views);
      default:
        return sortedProperties;
    }
  };
  
  // Apply sorting
  const sortedProperties = sortProperties(properties || []);
  
  // Apply pagination
  const startIndex = (page - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const displayedProperties = sortedProperties.slice(startIndex, endIndex);
  const totalPages = Math.ceil((sortedProperties.length || 0) / propertiesPerPage);
  
  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <PropertyFilter onFilter={handleFilter} initialFilters={filters} />
      
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-heading font-semibold">
            {isLoading ? "Loading properties..." : 
              `${sortedProperties.length} ${sortedProperties.length === 1 ? 'Property' : 'Properties'}`}
          </h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Sort by:</span>
            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-high-low">Price (High to Low)</SelectItem>
                <SelectItem value="price-low-high">Price (Low to High)</SelectItem>
                <SelectItem value="most-viewed">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden h-72 animate-pulse">
                <div className="bg-gray-200 h-48"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">No properties match your search</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search criteria or clear filters</p>
            <Button variant="outline" onClick={() => handleFilter({})}>
              Clear All Filters
            </Button>
          </div>
        )}
        
        {!isLoading && sortedProperties.length > propertiesPerPage && page < totalPages && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              onClick={handleLoadMore}
            >
              Load More Properties
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
