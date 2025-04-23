import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail, Send } from "lucide-react";
import { Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AppFooter() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-1 mb-4">
              <Home className="text-primary-400 text-2xl" />
              <h2 className="text-xl font-bold font-heading text-white">HomeHub</h2>
            </div>
            <p className="text-gray-400 mb-4">Find your perfect home with our comprehensive property listings and management tools.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Buyers</h3>
            <ul className="space-y-2">
              <li><Link href="/buy"><a className="text-gray-400 hover:text-white">Search Properties</a></Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Buying Guide</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Mortgage Calculator</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">First-time Buyers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Property Alerts</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Sellers</h3>
            <ul className="space-y-2">
              <li><Link href="/sell"><a className="text-gray-400 hover:text-white">List Your Property</a></Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Seller's Guide</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Property Valuation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Marketing Tools</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Agent Network</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400">
                <MapPin size={18} className="w-5 mr-2" />
                <span>123 Property St, Real Estate City</span>
              </li>
              <li className="flex items-center text-gray-400">
                <Phone size={18} className="w-5 mr-2" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center text-gray-400">
                <Mail size={18} className="w-5 mr-2" />
                <span>info@homehub.com</span>
              </li>
            </ul>
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Subscribe to our newsletter</h4>
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-grow rounded-r-none bg-gray-100 text-gray-900"
                />
                <Button className="rounded-l-none">
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2023 HomeHub. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
