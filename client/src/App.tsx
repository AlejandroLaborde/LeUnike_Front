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
        
        {/* Protected Routes */}
        <Route path="/dashboard">
          {() => (
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>

        <Route path="/dashboard/products">
          {() => (
            <ProtectedRoute>
              <DashboardLayout>
                <ProductsPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>

        <Route path="/dashboard/vendors">
          {() => (
            <ProtectedRoute>
              <DashboardLayout>
                <VendorsPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>

        <Route path="/dashboard/clients">
          {() => (
            <ProtectedRoute>
              <DashboardLayout>
                <ClientsPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>

        <Route path="/dashboard/chats">
          {() => (
            <ProtectedRoute>
              <DashboardLayout>
                <ChatsPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>

        <Route path="/dashboard/orders">
          {() => (
            <ProtectedRoute>
              <DashboardLayout>
                <OrdersPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>

        <Route path="/dashboard/metrics">
          {() => (
            <ProtectedRoute>
              <DashboardLayout>
                <MetricsPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>

        <Route path="/dashboard/users">
          {() => (
            <ProtectedRoute>
              <DashboardLayout>
                <UsersPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>
        
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
