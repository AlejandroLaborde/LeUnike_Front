import { BarChart, Calendar, DollarSign, ShoppingBag, ShoppingCart, UserPlus, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Mock QR code component
const WhatsAppQR = () => (
  <div className="flex flex-col items-center justify-center">
    <div className="w-32 h-32 bg-white p-3 rounded-lg shadow-md mb-3">
      <div className="w-full h-full bg-black grid grid-cols-7 grid-rows-7 gap-[2px]" style={{ backgroundColor: "#000" }}>
        <div className="col-span-3 row-span-3 bg-black rounded-tl-lg border-white border-r-4 border-b-4"></div>
        <div className="col-span-1 row-span-3"></div>
        <div className="col-span-3 row-span-3 bg-black rounded-tr-lg border-white border-l-4 border-b-4"></div>
        <div className="col-span-1 row-span-1"></div>
        <div className="col-span-1 row-span-1 bg-black"></div>
        <div className="col-span-1 row-span-1"></div>
        <div className="col-span-1 row-span-1 bg-black"></div>
        <div className="col-span-1 row-span-1"></div>
        <div className="col-span-1 row-span-1 bg-black"></div>
        <div className="col-span-1 row-span-1"></div>
        <div className="col-span-1 row-span-1"></div>
        <div className="col-span-1 row-span-1 bg-black"></div>
        <div className="col-span-1 row-span-1"></div>
        <div className="col-span-1 row-span-1 bg-black"></div>
        <div className="col-span-3 row-span-3 bg-black rounded-bl-lg border-white border-r-4 border-t-4"></div>
        <div className="col-span-1 row-span-3"></div>
        <div className="col-span-3 row-span-3 bg-black border-white"></div>
      </div>
    </div>
    <p className="text-sm text-[#5d6d7c]">Escanea para acceder al WhatsApp del negocio</p>
    <p className="text-sm text-[#5d6d7c] font-medium mt-1">+54 11 5555-7890</p>
    <Button variant="link" size="sm" className="mt-2 text-[#e3a765]">
      <Calendar className="h-4 w-4 mr-1" />
      Descargar QR
    </Button>
  </div>
);

// Simple chart using divs
const SalesChart = () => (
  <div className="h-[250px] w-full flex items-end justify-between px-2">
    {[65, 45, 75, 55, 80, 65, 48, 70, 85, 60, 75, 90, 80, 65, 75, 60, 85, 70, 65, 80].map((height, index) => (
      <div
        key={index}
        className={`w-4 rounded-t ${index < 12 ? 'bg-[#e3a765]' : 'bg-[#fdd000]'}`}
        style={{ height: `${height}%` }}
      ></div>
    ))}
  </div>
);

// Product popularity component
const PopularProducts = () => {
  const products = [
    { name: "Sorrentinos de Queso y Jamón", percentage: 85 },
    { name: "Ravioles de Carne", percentage: 70 },
    { name: "Sorrentinos de Calabaza", percentage: 65 },
    { name: "Canelones de Verdura", percentage: 50 },
  ];

  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div key={index} className="flex items-center">
          <div className="w-10 h-10 bg-[#e3a765]/10 rounded-full flex items-center justify-center text-[#e3a765] mr-3">
            <ShoppingBag size={16} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-black">{product.name}</h4>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-[#e3a765] h-2 rounded-full"
                style={{ width: `${product.percentage}%` }}
              ></div>
            </div>
          </div>
          <div className="ml-4">
            <span className="text-sm font-medium text-[#5d6d7c]">{product.percentage}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Order data (in a real app, this would come from an API)
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        { id: "ORD-5523", client: "Martín Gómez", vendor: "Laura Méndez", amount: 8450, status: "Entregado", date: "10/10/2023" },
        { id: "ORD-5522", client: "Carolina Sánchez", vendor: "Jorge Pérez", amount: 12300, status: "En proceso", date: "09/10/2023" },
        { id: "ORD-5521", client: "Roberto Álvarez", vendor: "Laura Méndez", amount: 5750, status: "Entregado", date: "08/10/2023" },
        { id: "ORD-5520", client: "Marcela Torres", vendor: "Diego Martínez", amount: 9880, status: "Pendiente", date: "08/10/2023" }
      ];
    },
    enabled: user?.role === 'admin' || user?.role === 'super_admin'
  });

  // Show message if user doesn't have access to dashboard
  if (user?.role === 'vendor') {
    return (
      <div className="py-10 px-4 text-center">
        <Users className="h-12 w-12 text-[#5d6d7c] mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-black mb-3">Acceso restringido</h2>
        <p className="text-[#5d6d7c] max-w-md mx-auto mb-6">
          Lo sentimos, pero no tienes permisos para acceder al dashboard. 
          Por favor, dirígete a las secciones a las que tienes acceso desde el menú lateral.
        </p>
        <Button 
          className="bg-[#e3a765] hover:bg-[#e3a765]/90 text-white"
          onClick={() => window.location.href = '/dashboard/clients'}
        >
          Ir a mis clientes
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Sales */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#5d6d7c]">Ventas del mes</p>
                  <h3 className="text-2xl font-bold text-black mt-1">$156,500</h3>
                  <p className="text-green-500 text-sm font-medium mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    12.5% vs mes anterior
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#e3a765]/10 flex items-center justify-center text-[#e3a765]">
                  <DollarSign size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* New Orders */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#5d6d7c]">Pedidos nuevos</p>
                  <h3 className="text-2xl font-bold text-black mt-1">24</h3>
                  <p className="text-green-500 text-sm font-medium mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    8.2% vs semana anterior
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#e3a765]/10 flex items-center justify-center text-[#e3a765]">
                  <ShoppingCart size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* New Clients */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#5d6d7c]">Clientes nuevos</p>
                  <h3 className="text-2xl font-bold text-black mt-1">14</h3>
                  <p className="text-red-500 text-sm font-medium mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 110-2h5zm-4-4a1 1 0 110-2h9a1 1 0 110 2H8z" clipRule="evenodd" />
                    </svg>
                    3.8% vs mes anterior
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#e3a765]/10 flex items-center justify-center text-[#e3a765]">
                  <UserPlus size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Charts and Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sales Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">Ventas recientes</CardTitle>
                  <div className="flex items-center">
                    <Button variant="ghost" size="sm" className="text-[#5d6d7c]">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm">Últimos 30 días</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <SalesChart />
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Recent Orders */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">Pedidos recientes</CardTitle>
                  <Button variant="link" className="text-[#e3a765]" onClick={() => window.location.href = '/dashboard/orders'}>
                    Ver todos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-4 text-center text-[#5d6d7c]">Cargando pedidos...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#5d6d7c] uppercase tracking-wider">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#5d6d7c] uppercase tracking-wider">Cliente</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#5d6d7c] uppercase tracking-wider">Vendedor</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#5d6d7c] uppercase tracking-wider">Monto</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#5d6d7c] uppercase tracking-wider">Estado</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#5d6d7c] uppercase tracking-wider">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders?.map((order, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-black">{order.id}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-black">{order.client}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-black">{order.vendor}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-black">${order.amount.toLocaleString()}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                order.status === 'Entregado' ? 'bg-green-100 text-green-800' :
                                order.status === 'En proceso' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-[#5d6d7c]">{order.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Right column - WhatsApp QR and Popular Products */}
        <div className="lg:col-span-1 space-y-6">
          {/* WhatsApp QR Code */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">WhatsApp QR</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#5d6d7c]" 
                    onClick={() => {
                      toast({
                        title: "QR actualizado",
                        description: "El código QR ha sido actualizado correctamente",
                      });
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <WhatsAppQR />
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Top Products */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">Productos más vendidos</CardTitle>
                  <Button variant="ghost" size="icon" className="text-[#5d6d7c]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <PopularProducts />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
