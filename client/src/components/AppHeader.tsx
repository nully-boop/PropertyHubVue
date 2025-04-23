import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Home className="text-primary text-2xl" />
            <Link className="text-xl font-bold font-heading text-primary" href="/">HomeHub</Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link className="font-medium hover:text-primary" href="/">Home</Link>
            <Link className="font-medium hover:text-primary" href="/buy">Buy</Link>
            <Link className="font-medium hover:text-primary" href="/buy?listingType=For%20Rent">Rent</Link>
            <Link className="font-medium hover:text-primary" href="/sell">Sell</Link>
            <Link className="font-medium hover:text-primary" href="/sell">Manage</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link className="hidden md:flex items-center text-gray-600 hover:text-primary" href="/favorites">
              <Heart size={18} className="mr-1" />
              <span>Saved</span>
            </Link>
            <Button>Sign In</Button>
            <button 
              className="md:hidden text-gray-600" 
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-2 pb-3 space-y-1">
            <Link className="block px-3 py-2 rounded-md hover:bg-gray-100" href="/">Home</Link>
            <Link className="block px-3 py-2 rounded-md hover:bg-gray-100" href="/buy">Buy</Link>
            <Link className="block px-3 py-2 rounded-md hover:bg-gray-100" href="/buy?listingType=For%20Rent">Rent</Link>
            <Link className="block px-3 py-2 rounded-md hover:bg-gray-100" href="/sell">Sell</Link>
            <Link className="block px-3 py-2 rounded-md hover:bg-gray-100" href="/sell">Manage</Link>
            <Link className="block px-3 py-2 rounded-md hover:bg-gray-100" href="/favorites">
              <Heart size={18} className="inline mr-2" /> Saved
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
