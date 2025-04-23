import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import Home from "@/pages/Home";
import BuyerInterface from "@/pages/BuyerInterface";
import SellerInterface from "@/pages/SellerInterface";
import PropertyDetail from "@/pages/PropertyDetail";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/buy" component={BuyerInterface} />
      <ProtectedRoute path="/sell" component={SellerInterface} />
      <Route path="/property/:id" component={PropertyDetail} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
