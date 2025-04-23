import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";

import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import Home from "@/pages/Home";
import BuyerInterface from "@/pages/BuyerInterface";
import SellerInterface from "@/pages/SellerInterface";
import PropertyDetail from "@/pages/PropertyDetail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/buy" component={BuyerInterface} />
      <Route path="/sell" component={SellerInterface} />
      <Route path="/property/:id" component={PropertyDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <AppHeader />
          <main className="flex-grow">
            <Router />
          </main>
          <AppFooter />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
