import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Search, MapPin } from "lucide-react";

interface PropertyFilterProps {
  onFilter: (filters: any) => void;
  initialFilters?: any;
}

export default function PropertyFilter({ onFilter, initialFilters = {} }: PropertyFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [filters, setFilters] = useState({
    location: initialFilters.location || '',
    propertyType: initialFilters.propertyType || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    minBedrooms: initialFilters.minBedrooms || '',
    minBathrooms: initialFilters.minBathrooms || '',
    minSquareFeet: initialFilters.minSquareFeet || '',
    minYearBuilt: initialFilters.minYearBuilt || '',
    features: initialFilters.features || [],
    listingType: initialFilters.listingType || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFilters({ ...filters, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  return (
    <Card className="bg-white rounded-xl shadow-md mb-8">
      <CardContent className="p-6">
        <h2 className="text-2xl font-heading font-bold mb-4">Find your perfect home</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="col-span-4 md:col-span-1">
              <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="text-gray-400 h-4 w-4" />
                </div>
                <Input
                  id="location"
                  name="location"
                  placeholder="City, neighborhood, or address"
                  value={filters.location}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">Property Type</Label>
              <Select
                value={filters.propertyType}
                onValueChange={(value) => handleSelectChange('propertyType', value)}
              >
                <SelectTrigger id="propertyType">
                  <SelectValue placeholder="Any Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any_type">Any Type</SelectItem>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Condo">Condo</SelectItem>
                  <SelectItem value="Townhouse">Townhouse</SelectItem>
                  <SelectItem value="Land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">Price Range</Label>
              <Select
                value={filters.maxPrice}
                onValueChange={(value) => handleSelectChange('maxPrice', value)}
              >
                <SelectTrigger id="priceRange">
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any_price">Any Price</SelectItem>
                  <SelectItem value="200000">Under $200k</SelectItem>
                  <SelectItem value="300000">Under $300k</SelectItem>
                  <SelectItem value="400000">Under $400k</SelectItem>
                  <SelectItem value="500000">Under $500k</SelectItem>
                  <SelectItem value="750000">Under $750k</SelectItem>
                  <SelectItem value="1000000">Under $1M</SelectItem>
                  <SelectItem value="2000000">Under $2M</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block invisible text-sm font-medium text-gray-700 mb-1">Search</Label>
              <Button type="submit" className="w-full">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </div>
          
          <div>
            <button 
              type="button"
              onClick={toggleAdvanced}
              className="text-primary text-sm font-medium flex items-center"
            >
              <span>Advanced Search</span>
              {showAdvanced ? 
                <ChevronUp className="ml-1 h-4 w-4" /> : 
                <ChevronDown className="ml-1 h-4 w-4" />
              }
            </button>
            
            {showAdvanced && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="minBedrooms" className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</Label>
                  <Select
                    value={filters.minBedrooms}
                    onValueChange={(value) => handleSelectChange('minBedrooms', value)}
                  >
                    <SelectTrigger id="minBedrooms">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="minBathrooms" className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</Label>
                  <Select
                    value={filters.minBathrooms}
                    onValueChange={(value) => handleSelectChange('minBathrooms', value)}
                  >
                    <SelectTrigger id="minBathrooms">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="1.5">1.5+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="2.5">2.5+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="minSquareFeet" className="block text-sm font-medium text-gray-700 mb-1">Property Size</Label>
                  <Select
                    value={filters.minSquareFeet}
                    onValueChange={(value) => handleSelectChange('minSquareFeet', value)}
                  >
                    <SelectTrigger id="minSquareFeet">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="500">500+ sq ft</SelectItem>
                      <SelectItem value="1000">1000+ sq ft</SelectItem>
                      <SelectItem value="1500">1500+ sq ft</SelectItem>
                      <SelectItem value="2000">2000+ sq ft</SelectItem>
                      <SelectItem value="2500">2500+ sq ft</SelectItem>
                      <SelectItem value="3000">3000+ sq ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="minYearBuilt" className="block text-sm font-medium text-gray-700 mb-1">Year Built</Label>
                  <Select
                    value={filters.minYearBuilt}
                    onValueChange={(value) => handleSelectChange('minYearBuilt', value)}
                  >
                    <SelectTrigger id="minYearBuilt">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="2020">2020+</SelectItem>
                      <SelectItem value="2010">2010+</SelectItem>
                      <SelectItem value="2000">2000+</SelectItem>
                      <SelectItem value="1990">1990+</SelectItem>
                      <SelectItem value="1980">1980+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-1">Features</Label>
                  <Select
                    value={(filters.features || [])[0]}
                    onValueChange={(value) => handleSelectChange('features', value)}
                  >
                    <SelectTrigger id="features">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="Pool">Pool</SelectItem>
                      <SelectItem value="Garage">Garage</SelectItem>
                      <SelectItem value="Garden">Garden</SelectItem>
                      <SelectItem value="Balcony">Balcony</SelectItem>
                      <SelectItem value="Air Conditioning">Air Conditioning</SelectItem>
                      <SelectItem value="Gym">Gym</SelectItem>
                      <SelectItem value="Security System">Security System</SelectItem>
                      <SelectItem value="Fireplace">Fireplace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="listingType" className="block text-sm font-medium text-gray-700 mb-1">Listing Type</Label>
                  <Select
                    value={filters.listingType}
                    onValueChange={(value) => handleSelectChange('listingType', value)}
                  >
                    <SelectTrigger id="listingType">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="For Sale">For Sale</SelectItem>
                      <SelectItem value="For Rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
