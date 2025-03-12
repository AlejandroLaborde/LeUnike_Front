import { useState, useEffect, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  UserCircle, 
  MessageSquare, 
  ShoppingCart, 
  BarChart2, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  ShieldAlert
} from "lucide-react";

type SidebarItem = {
  icon: React.ReactNode;
  label: string;
  href: string;
  requiresAdmin: boolean;
  requiresSuperAdmin?: boolean;
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("Dashboard");

  // Check if the user is an admin or super_admin
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  // Define sidebar navigation items
  const sidebarItems: SidebarItem[] = [
    { 
      icon: <LayoutDashboard size={20} />, 
      label: "Dashboard", 
      href: "/dashboard",
      requiresAdmin: true
    },
    { 
      icon: <Package size={20} />, 
      label: "Productos", 
      href: "/dashboard/products",
      requiresAdmin: false
    },
    { 
      icon: <Users size={20} />, 
      label: "Vendedores", 
      href: "/dashboard/vendors",
      requiresAdmin: true
    },
    { 
      icon: <UserCircle size={20} />, 
      label: "Clientes", 
      href: "/dashboard/clients",
      requiresAdmin: false
    },
    { 
      icon: <MessageSquare size={20} />, 
      label: "Chats", 
      href: "/dashboard/chats",
      requiresAdmin: false
    },
    { 
      icon: <ShoppingCart size={20} />, 
      label: "Pedidos", 
      href: "/dashboard/orders",
      requiresAdmin: false
    },
    { 
      icon: <BarChart2 size={20} />, 
      label: "Métricas", 
      href: "/dashboard/metrics",
      requiresAdmin: true
    },
    { 
      icon: <ShieldAlert size={20} />, 
      label: "Usuarios", 
      href: "/dashboard/users",
      requiresAdmin: true,
      requiresSuperAdmin: true
    },
  ];

  // Set current page title based on location
  useEffect(() => {
    const currentItem = sidebarItems.find(item => item.href === location);
    if (currentItem) {
      setCurrentTitle(currentItem.label);
    }
  }, [location]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Filter sidebar items based on user role
  const filteredSidebarItems = sidebarItems.filter(item => {
    // If the item requires super admin privileges and user is not a super admin, hide it
    if (item.requiresSuperAdmin && !isSuperAdmin) {
      return false;
    }
    
    // Check admin privileges
    return !item.requiresAdmin || (item.requiresAdmin && isAdmin);
  });

  return (
    <div className="min-h-screen flex bg-[#f2efe2]">
      {/* Sidebar - Desktop */}
      <motion.aside
        className="hidden md:flex md:w-64 bg-white shadow-lg flex-col h-screen sticky top-0 z-10"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <Logo className="h-12 mx-auto" />
        </div>
        
        <div className="p-4">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-[#e3a765]/20 flex items-center justify-center text-[#e3a765]">
              <UserCircle size={24} />
            </div>
            <div className="ml-3">
              <h4 className="text-black font-medium">{user?.name}</h4>
              <p className="text-[#5d6d7c] text-xs">
                {user?.role === 'super_admin' ? 'Super Administrador' : 
                 user?.role === 'admin' ? 'Administrador' : 'Vendedor'}
              </p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {filteredSidebarItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center px-4 py-3 text-[#5d6d7c] hover:text-[#e3a765] rounded-md transition-all pl-4 border-l-4 ${
                  location === item.href 
                    ? 'border-[#e3a765] bg-[#e3a765]/10 text-[#e3a765]' 
                    : 'border-transparent hover:bg-[#e3a765]/5 hover:border-[#e3a765]/50'
                }`}
              >
                <span className="w-5 text-center">{item.icon}</span>
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t border-gray-200">
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            className="w-full flex items-center justify-center text-[#5d6d7c] hover:text-[#e3a765] hover:bg-[#e3a765]/5"
            disabled={logoutMutation.isPending}
          >
            <LogOut size={18} className="mr-2" />
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-0 left-0 z-30 m-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="bg-white shadow-md hover:bg-[#e3a765]/10"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <motion.aside
            className="fixed top-0 left-0 w-64 bg-white h-full z-50 p-4"
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <Logo className="h-10" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>
            
            <div className="flex items-center mb-6 p-4 bg-[#f2efe2] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[#e3a765]/20 flex items-center justify-center text-[#e3a765]">
                <UserCircle size={24} />
              </div>
              <div className="ml-3">
                <h4 className="text-black font-medium">{user?.name}</h4>
                <p className="text-[#5d6d7c] text-xs">
                  {user?.role === 'super_admin' ? 'Super Administrador' : 
                   user?.role === 'admin' ? 'Administrador' : 'Vendedor'}
                </p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {filteredSidebarItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-[#5d6d7c] hover:text-[#e3a765] rounded-md transition-all pl-4 border-l-4 ${
                    location === item.href 
                      ? 'border-[#e3a765] bg-[#e3a765]/10 text-[#e3a765]' 
                      : 'border-transparent hover:bg-[#e3a765]/5 hover:border-[#e3a765]/50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="w-5 text-center">{item.icon}</span>
                  <span className="ml-3">{item.label}</span>
                </Link>
              ))}
            </nav>
            
            <div className="mt-8 pt-4 border-t border-gray-200">
              <Button 
                onClick={handleLogout} 
                variant="ghost" 
                className="w-full flex items-center justify-center text-[#5d6d7c] hover:text-[#e3a765] hover:bg-[#e3a765]/5"
                disabled={logoutMutation.isPending}
              >
                <LogOut size={18} className="mr-2" />
                <span>Cerrar sesión</span>
              </Button>
            </div>
          </motion.aside>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-black font-['Playfair_Display']">{currentTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-[#5d6d7c] hover:text-[#e3a765] hover:bg-[#e3a765]/5">
              <Bell size={20} />
              <span className="absolute top-0 right-0 bg-[#e3a765] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <span className="hidden md:block text-[#5d6d7c]">|</span>
            <div className="hidden md:flex items-center">
              <span className="text-black font-medium mr-2">{user?.name}</span>
              <div className="w-8 h-8 rounded-full bg-[#e3a765]/20 flex items-center justify-center text-[#e3a765]">
                <UserCircle size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
