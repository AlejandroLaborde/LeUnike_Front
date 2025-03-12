import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AboutPage from "@/pages/about-page";
import GalleryPage from "@/pages/gallery-page";
import ContactPage from "@/pages/contact-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import DashboardLayout from "./pages/dashboard/layout";
import DashboardPage from "./pages/dashboard/dashboard-page";
import ProductsPage from "./pages/dashboard/products-page";
import VendorsPage from "./pages/dashboard/vendors-page";
import ClientsPage from "./pages/dashboard/clients-page";
import ChatsPage from "./pages/dashboard/chats-page";
import OrdersPage from "./pages/dashboard/orders-page";
import MetricsPage from "./pages/dashboard/metrics-page";
import UsersPage from "./pages/dashboard/users-page";
import { AuthProvider } from "./hooks/use-auth";
import { WhatsappButton } from "./components/whatsapp-button";

// Dashboard routes handler component
function DashboardRoutes() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Switch>
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/dashboard/products" component={ProductsPage} />
          <Route path="/dashboard/vendors" component={VendorsPage} />
          <Route path="/dashboard/clients" component={ClientsPage} />
          <Route path="/dashboard/chats" component={ChatsPage} />
          <Route path="/dashboard/orders" component={OrdersPage} />
          <Route path="/dashboard/metrics" component={MetricsPage} />
          <Route path="/dashboard/users" component={UsersPage} />
          <Route component={NotFound} />
        </Switch>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function Router() {
  const [location] = useLocation();
  
  // Don't show WhatsApp button on dashboard pages
  const isDashboard = location.startsWith("/dashboard");

  return (
    <>
      <Switch>
        {/* Public pages */}
        <Route path="/" component={HomePage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/gallery" component={GalleryPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/auth" component={AuthPage} />
        
        {/* Dashboard pages */}
        <Route path="/dashboard/:rest*" component={DashboardRoutes} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
      
      {!isDashboard && <WhatsappButton />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
