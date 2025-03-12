import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart,
  PieChart,
  LineChart,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Wallet,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  PanelRight
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function MetricsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  
  // State
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showPercentages, setShowPercentages] = useState(true);
  
  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <BarChart className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-black mb-2">Acceso denegado</h2>
        <p className="text-[#5d6d7c] text-center max-w-md mb-4">
          No tienes permisos para acceder a las métricas de la empresa. Esta sección está reservada para administradores.
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/dashboard'}
        >
          Volver al Dashboard
        </Button>
      </div>
    );
  }

  // Mock data for sales
  const salesData = {
    week: [
      { day: 'Lun', sales: 25000 },
      { day: 'Mar', sales: 30000 },
      { day: 'Mié', sales: 22000 },
      { day: 'Jue', sales: 28000 },
      { day: 'Vie', sales: 35000 },
      { day: 'Sáb', sales: 40000 },
      { day: 'Dom', sales: 20000 },
    ],
    month: [
      { day: 'Sem 1', sales: 120000 },
      { day: 'Sem 2', sales: 145000 },
      { day: 'Sem 3', sales: 135000 },
      { day: 'Sem 4', sales: 156000 },
    ],
    quarter: [
      { day: 'Ene', sales: 450000 },
      { day: 'Feb', sales: 480000 },
      { day: 'Mar', sales: 520000 },
    ],
    year: [
      { day: 'Q1', sales: 1450000 },
      { day: 'Q2', sales: 1680000 },
      { day: 'Q3', sales: 1520000 },
      { day: 'Q4', sales: 1750000 },
    ],
  };

  // Mock data for product categories
  const categoryData = [
    { category: 'Sorrentinos', percentage: 45, sales: 675000 },
    { category: 'Ravioles', percentage: 25, sales: 375000 },
    { category: 'Canelones', percentage: 20, sales: 300000 },
    { category: 'Salsas', percentage: 10, sales: 150000 },
  ];

  // Mock data for bestselling products
  const bestsellingProducts = [
    { name: 'Sorrentinos de Queso y Jamón', sales: 320000, percentage: 22, change: 5 },
    { name: 'Ravioles de Carne', sales: 280000, percentage: 19, change: -2 },
    { name: 'Sorrentinos de Calabaza', sales: 240000, percentage: 16, change: 8 },
    { name: 'Canelones de Verdura', sales: 190000, percentage: 13, change: 3 },
    { name: 'Sorrentinos 4 Quesos', sales: 170000, percentage: 11, change: 1 },
  ];

  // Mock data for top performing vendors
  const topVendors = [
    { name: 'Laura Méndez', sales: 680000, percentage: 32, clients: 24 },
    { name: 'Jorge Pérez', sales: 520000, percentage: 25, clients: 18 },
    { name: 'María García', sales: 420000, percentage: 20, clients: 15 },
    { name: 'Diego Martínez', sales: 280000, percentage: 13, clients: 12 },
    { name: 'Ana López', sales: 200000, percentage: 10, clients: 9 },
  ];

  // Mock data for total numbers
  const totals = {
    revenue: 2100000,
    orders: 320,
    customers: 180,
    averageOrder: 6562.5,
    growth: 18.5,
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  // Simple bar chart component
  const SimpleBarChart = ({ data, selectedRange }: { data: typeof salesData.week, selectedRange: keyof typeof salesData }) => {
    const maxValue = Math.max(...data.map(item => item.sales));
    
    return (
      <div className="h-[300px] mt-4 pl-8">
        <div className="flex h-[250px] items-end space-x-2">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative flex flex-col items-center">
                <div
                  className="bg-[#e3a765] rounded-t w-12 transition-all duration-500"
                  style={{
                    height: `${(item.sales / maxValue) * 100}%`,
                    maxHeight: '220px',
                    minHeight: '20px'
                  }}
                >
                  {showPercentages && (
                    <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                      {formatCurrency(item.sales)}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2 text-xs text-[#5d6d7c]">{item.day}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple donut chart component (very basic representation)
  const SimpleDonutChart = ({ data }: { data: typeof categoryData }) => {
    return (
      <div className="flex justify-center items-center h-[250px] mt-4 relative">
        <div className="w-44 h-44 rounded-full border-8 border-transparent relative flex items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e3a765" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="0" />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fdd000" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="188.4" />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#5d6d7c" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="138.2" />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f2efe2" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="88" />
          </svg>
          <div className="absolute text-center">
            <div className="text-2xl font-bold">{totals.orders}</div>
            <div className="text-xs text-[#5d6d7c]">Pedidos</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header and Range Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Métricas</h1>
          <p className="text-[#5d6d7c]">Análisis y rendimiento del negocio</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-percentages"
              checked={showPercentages}
              onCheckedChange={setShowPercentages}
            />
            <Label htmlFor="show-percentages">Mostrar valores</Label>
          </div>
          
          <Select 
            value={dateRange} 
            onValueChange={(value) => setDateRange(value as typeof dateRange)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rango de fechas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-[#5d6d7c]">Ingresos totales</p>
                  <h3 className="text-2xl font-bold text-black mt-1">{formatCurrency(totals.revenue)}</h3>
                  <p className="text-green-500 text-xs font-medium mt-1 flex items-center">
                    <ChevronUp className="mr-1 h-4 w-4" />
                    {totals.growth}% vs. período anterior
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#e3a765]/10 flex items-center justify-center text-[#e3a765]">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-[#5d6d7c]">Pedidos totales</p>
                  <h3 className="text-2xl font-bold text-black mt-1">{totals.orders}</h3>
                  <p className="text-green-500 text-xs font-medium mt-1 flex items-center">
                    <ChevronUp className="mr-1 h-4 w-4" />
                    12.3% vs. período anterior
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#e3a765]/10 flex items-center justify-center text-[#e3a765]">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-[#5d6d7c]">Clientes</p>
                  <h3 className="text-2xl font-bold text-black mt-1">{totals.customers}</h3>
                  <p className="text-green-500 text-xs font-medium mt-1 flex items-center">
                    <ChevronUp className="mr-1 h-4 w-4" />
                    8.7% vs. período anterior
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#e3a765]/10 flex items-center justify-center text-[#e3a765]">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-[#5d6d7c]">Pedido promedio</p>
                  <h3 className="text-2xl font-bold text-black mt-1">{formatCurrency(totals.averageOrder)}</h3>
                  <p className="text-red-500 text-xs font-medium mt-1 flex items-center">
                    <ChevronDown className="mr-1 h-4 w-4" />
                    2.1% vs. período anterior
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#e3a765]/10 flex items-center justify-center text-[#e3a765]">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-[#e3a765]" />
                Ventas por {dateRange === 'week' ? 'día' : dateRange === 'month' ? 'semana' : dateRange === 'quarter' ? 'mes' : 'trimestre'}
              </CardTitle>
              <CardDescription>
                Evolución de ventas en el período seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={salesData[dateRange]} selectedRange={dateRange} />
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Categories Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-[#e3a765]" />
                Ventas por categoría
              </CardTitle>
              <CardDescription>
                Distribución de ventas por tipo de producto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleDonutChart data={categoryData} />
              
              <div className="space-y-2 mt-4">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        index === 0 ? 'bg-[#e3a765]' : 
                        index === 1 ? 'bg-[#fdd000]' : 
                        index === 2 ? 'bg-[#5d6d7c]' : 
                        'bg-[#f2efe2]'
                      }`}></div>
                      <span className="text-sm">{category.category}</span>
                    </div>
                    <div className="text-sm">
                      {showPercentages ? formatCurrency(category.sales) : `${category.percentage}%`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Products and Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Top Products */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-[#e3a765]" />
                Productos más vendidos
              </CardTitle>
              <CardDescription>
                Los productos con mayor volumen de ventas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bestsellingProducts.map((product, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-8 h-8 bg-[#f2efe2] rounded-full flex items-center justify-center text-[#5d6d7c] font-medium mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-[#e3a765] font-medium">
                          {showPercentages ? formatCurrency(product.sales) : `${product.percentage}%`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-[#e3a765] h-2 rounded-full"
                          style={{ width: `${product.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Top Vendors */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-[#e3a765]" />
                Vendedores destacados
              </CardTitle>
              <CardDescription>
                Rendimiento de los vendedores con mejores resultados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topVendors.map((vendor, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-8 h-8 bg-[#e3a765]/10 rounded-full flex items-center justify-center text-[#e3a765] mr-3">
                      {vendor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium">{vendor.name}</span>
                          <span className="text-xs text-[#5d6d7c] ml-2">{vendor.clients} clientes</span>
                        </div>
                        <span className="text-[#e3a765] font-medium">
                          {showPercentages ? formatCurrency(vendor.sales) : `${vendor.percentage}%`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-[#e3a765] h-2 rounded-full"
                          style={{ width: `${vendor.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
