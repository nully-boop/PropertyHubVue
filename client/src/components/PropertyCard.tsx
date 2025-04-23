import { useState } from "react";
import { Link } from "wouter";
import { Heart, BedDouble, Bath, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Property, PropertyImage } from "@/types";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export default function PropertyCard({ property, className }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const mainImage = property.images.find(img => img.isMain) || property.images[0];
  
  const formatPrice = () => {
    if (property.listingType === "For Rent") {
      return `$${Number(property.price).toLocaleString()}/mo`;
    } else {
      return `$${Number(property.price).toLocaleString()}`;
    }
  };

  return (
    <div className={cn("property-card bg-white rounded-lg shadow-md overflow-hidden transition duration-300", className)}>
      <div className="relative h-48 sm:h-40 md:h-48">
        <Link href={`/property/${property.id}`}>
          <a>
            <img 
              src={mainImage?.imageUrl} 
              alt={property.title} 
              className="w-full h-full object-cover"
            />
          </a>
        </Link>
        <div className="absolute top-3 left-3">
          <span className={cn(
            "text-white text-xs px-2 py-1 rounded-md",
            property.listingType === "For Sale" ? "bg-primary" : "bg-green-500"
          )}>
            {property.listingType}
          </span>
        </div>
        <Button 
          variant="outline"
          size="icon"
          className="absolute top-3 right-3 bg-white rounded-full w-8 h-8 p-1.5 hover:text-accent"
          onClick={toggleFavorite}
        >
          <Heart className={cn("h-4 w-4", isFavorite ? "fill-accent text-accent" : "text-gray-400")} />
        </Button>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-accent font-semibold mb-1">{formatPrice()}</p>
            <h3 className="font-heading font-semibold text-lg">
              <Link href={`/property/${property.id}`}>
                <a className="hover:text-primary">{property.title}</a>
              </Link>
            </h3>
            <p className="text-gray-600 text-sm">{property.address}, {property.city}, {property.state}</p>
          </div>
        </div>
        <div className="flex items-center mt-4 text-sm text-gray-600 justify-between">
          <div className="flex items-center">
            <BedDouble className="mr-1 h-4 w-4" />
            <span>{property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}</span>
          </div>
          <div className="flex items-center">
            <Bath className="mr-1 h-4 w-4" />
            <span>{property.bathrooms} {Number(property.bathrooms) === 1 ? 'bath' : 'baths'}</span>
          </div>
          <div className="flex items-center">
            <Maximize2 className="mr-1 h-4 w-4" />
            <span>{property.squareFeet.toLocaleString()} sq ft</span>
          </div>
        </div>
      </div>
    </div>
  );
}
