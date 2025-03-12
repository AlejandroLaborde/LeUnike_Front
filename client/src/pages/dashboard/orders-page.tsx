import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Loader2,
  FileText,
  User,
  Package,
  Calendar,
  ShoppingCart,
  Check,
  Clock,
  Truck,
  XCircle,
  ArrowUpDown,
  Filter,
  RefreshCw
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useLocation } from "wouter";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

type OrderStatus = 'pending' | 'processing' | 'delivered' | 'canceled';

type Client = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
};

type Product = {
  id: number;
  name: string;
  price: number;
  unitSize: string;
  category: string;
};

type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  product?: Product;
};

type Order = {
  id: number;
  clientId: number;
  vendorId: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  client?: Client;
  items?: OrderItem[];
};

export default function OrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  
  // Extract client ID from URL if present
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const clientFilter = searchParams.get('client') 
    ? parseInt(searchParams.get('client') as string) 
    : null;

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');

  // Form state
  const [formData, setFormData] = useState({
    clientId: "",
    products: [{ productId: "", quantity: 1 }],
    status: "pending" as OrderStatus,
  });

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/orders');
      return await res.json() as Order[];
    }
  });

  // Fetch clients for order form
  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/clients');
      return await res.json() as Client[];
    }
  });

  // Fetch products for order form
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/products');
      return await res.json() as Product[];
    }
  });

  // Change order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async (data: { id: number, status: OrderStatus }) => {
      const res = await apiRequest('PUT', `/api/orders/${data.id}`, { status: data.status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setIsStatusDialogOpen(false);
      toast({
        title: "Estado actualizado",
        description: "El estado del pedido ha sido actualizado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar el estado",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter, sort, and group orders
  const processedOrders = orders
    ? orders
        // First apply client filter if present
        .filter(order => clientFilter ? order.clientId === clientFilter : true)
        // Then apply search and status filters
        .filter(order => {
          // Client name search will be added once we have client details
          const matchesSearch = order.id.toString().includes(searchTerm);
          const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
          return matchesSearch && matchesStatus;
        })
        // Sort by date
        .sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        })
    : [];

  // Group orders by status for the tabs view
  const ordersByStatus = {
    all: processedOrders,
    pending: processedOrders.filter(order => order.status === 'pending'),
    processing: processedOrders.filter(order => order.status === 'processing'),
    delivered: processedOrders.filter(order => order.status === 'delivered'),
    canceled: processedOrders.filter(order => order.status === 'canceled')
  };

  // Helper function to format date
  const formatOrderDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
  };

  // Helper function to get status badge styles
  const getStatusBadge = (status: OrderStatus) => {
    switch(status) {
      case 'pending':
        return {
          icon: <Clock className="h-3 w-3 mr-1" />,
          className: "bg-yellow-100 text-yellow-800 border-0"
        };
      case 'processing':
        return {
          icon: <Truck className="h-3 w-3 mr-1" />,
          className: "bg-blue-100 text-blue-800 border-0"
        };
      case 'delivered':
        return {
          icon: <Check className="h-3 w-3 mr-1" />,
          className: "bg-green-100 text-green-800 border-0"
        };
      case 'canceled':
        return {
          icon: <XCircle className="h-3 w-3 mr-1" />,
          className: "bg-red-100 text-red-800 border-0"
        };
    }
  };

  // Helper function to get status text
  const getStatusText = (status: OrderStatus) => {
    switch(status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'En proceso';
      case 'delivered': return 'Entregado';
      case 'canceled': return 'Cancelado';
    }
  };

  // Create initial tab value based on URL query param or default to 'all'
  const initialTab = statusFilter !== 'all' ? statusFilter : 'all';

  return (
    <div>
      {/* Header and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Pedidos</h1>
          <p className="text-[#5d6d7c]">
            {isAdmin 
              ? 'Gestiona todos los pedidos de la empresa' 
              : 'Gestiona los pedidos de tus clientes asignados'}
          </p>
        </div>
        
        <Button 
          onClick={() => setIsNewOrderOpen(true)}
          className="bg-[#e3a765] hover:bg-[#e3a765]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Pedido
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5d6d7c]" size={18} />
            <Input
              placeholder="Buscar por número de pedido..."
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="processing">En proceso</SelectItem>
                <SelectItem value="delivered">Entregados</SelectItem>
                <SelectItem value="canceled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="w-10 h-10"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Tabs and Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Pedidos</CardTitle>
          <CardDescription>
            {clientFilter && clients
              ? `Mostrando pedidos del cliente: ${clients.find(c => c.id === clientFilter)?.name || 'Cliente seleccionado'}`
              : "Lista de pedidos registrados en el sistema"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue={initialTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>
                Todos <Badge variant="outline" className="ml-2 bg-gray-100">{ordersByStatus.all.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" onClick={() => setStatusFilter('pending')}>
                Pendientes <Badge variant="outline" className="ml-2 bg-yellow-100">{ordersByStatus.pending.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="processing" onClick={() => setStatusFilter('processing')}>
                En proceso <Badge variant="outline" className="ml-2 bg-blue-100">{ordersByStatus.processing.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="delivered" onClick={() => setStatusFilter('delivered')}>
                Entregados <Badge variant="outline" className="ml-2 bg-green-100">{ordersByStatus.delivered.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="canceled" onClick={() => setStatusFilter('canceled')}>
                Cancelados <Badge variant="outline" className="ml-2 bg-red-100">{ordersByStatus.canceled.length}</Badge>
              </TabsTrigger>
            </TabsList>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#e3a765]" />
              </div>
            ) : processedOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-[#5d6d7c] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">No se encontraron pedidos</h3>
                <p className="text-[#5d6d7c] max-w-md mx-auto mb-6">
                  {searchTerm || statusFilter !== 'all'
                    ? "No hay resultados para los filtros aplicados."
                    : clientFilter
                      ? "Este cliente no tiene pedidos registrados."
                      : "No hay pedidos registrados en el sistema."}
                </p>
                <Button 
                  className="bg-[#e3a765] hover:bg-[#e3a765]/90"
                  onClick={() => setIsNewOrderOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Pedido
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Nº Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedOrders.map((order, index) => {
                      // Find client name if available
                      const clientName = clients?.find(c => c.id === order.clientId)?.name || `Cliente #${order.clientId}`;
                      const statusInfo = getStatusBadge(order.status);
                      
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{`#${order.id.toString().padStart(4, '0')}`}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-[#5d6d7c]" />
                              <span>{clientName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-[#e3a765]">
                            ${order.totalAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusInfo.className}>
                              {statusInfo.icon}
                              {getStatusText(order.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatOrderDate(order.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => {
                                  setViewingOrder(order);
                                  setIsOrderDetailOpen(true);
                                }}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Ver detalles
                                </DropdownMenuItem>
                                {(isAdmin || order.status === 'pending') && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
                                    
                                    {order.status !== 'pending' && (
                                      <DropdownMenuItem onClick={() => {
                                        setSelectedOrder(order);
                                        setNewStatus('pending');
                                        setIsStatusDialogOpen(true);
                                      }}>
                                        <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                                        Pendiente
                                      </DropdownMenuItem>
                                    )}
                                    
                                    {order.status !== 'processing' && (
                                      <DropdownMenuItem onClick={() => {
                                        setSelectedOrder(order);
                                        setNewStatus('processing');
                                        setIsStatusDialogOpen(true);
                                      }}>
                                        <Truck className="mr-2 h-4 w-4 text-blue-600" />
                                        En proceso
                                      </DropdownMenuItem>
                                    )}
                                    
                                    {order.status !== 'delivered' && (
                                      <DropdownMenuItem onClick={() => {
                                        setSelectedOrder(order);
                                        setNewStatus('delivered');
                                        setIsStatusDialogOpen(true);
                                      }}>
                                        <Check className="mr-2 h-4 w-4 text-green-600" />
                                        Entregado
                                      </DropdownMenuItem>
                                    )}
                                    
                                    {order.status !== 'canceled' && (
                                      <DropdownMenuItem onClick={() => {
                                        setSelectedOrder(order);
                                        setNewStatus('canceled');
                                        setIsStatusDialogOpen(true);
                                      }}>
                                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                        Cancelado
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalle del Pedido #{viewingOrder?.id.toString().padStart(4, '0')}</DialogTitle>
            <DialogDescription>
              Información completa del pedido
            </DialogDescription>
          </DialogHeader>
          
          {viewingOrder && (
            <div className="space-y-6 py-4">
              {/* Order Info */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-[#5d6d7c]">Cliente</h3>
                    <p className="text-black">{clients?.find(c => c.id === viewingOrder.clientId)?.name || `Cliente #${viewingOrder.clientId}`}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#5d6d7c]">Fecha</h3>
                    <p className="text-black">{formatOrderDate(viewingOrder.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex justify-between mt-2">
                  <div>
                    <h3 className="text-sm font-medium text-[#5d6d7c]">Estado</h3>
                    <Badge variant="outline" className={getStatusBadge(viewingOrder.status).className}>
                      {getStatusBadge(viewingOrder.status).icon}
                      {getStatusText(viewingOrder.status)}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#5d6d7c]">Total</h3>
                    <p className="text-[#e3a765] font-bold text-lg">${viewingOrder.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {/* Order Items (this would come from the real data) */}
              <div>
                <h3 className="text-sm font-medium text-[#5d6d7c] mb-2">Productos</h3>
                <div className="bg-gray-50 rounded-md p-4">
                  <div className="space-y-3">
                    {/* In a real app, we would fetch the order items here */}
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div className="flex-1">
                        <p className="font-medium">Sorrentinos de Queso y Jamón</p>
                        <p className="text-sm text-[#5d6d7c]">12 unid.</p>
                      </div>
                      <div className="text-center w-16">
                        <p className="text-sm">x2</p>
                      </div>
                      <div className="text-right w-24">
                        <p className="font-medium">$3,600</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div className="flex-1">
                        <p className="font-medium">Ravioles de Carne</p>
                        <p className="text-sm text-[#5d6d7c]">24 unid.</p>
                      </div>
                      <div className="text-center w-16">
                        <p className="text-sm">x1</p>
                      </div>
                      <div className="text-right w-24">
                        <p className="font-medium">$1,900</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div className="flex-1">
                        <p className="font-medium">Salsa Filetto</p>
                        <p className="text-sm text-[#5d6d7c]">500ml</p>
                      </div>
                      <div className="text-center w-16">
                        <p className="text-sm">x2</p>
                      </div>
                      <div className="text-right w-24">
                        <p className="font-medium">$1,900</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-2 border-t flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-[#5d6d7c]">Subtotal: $7,400</p>
                      <p className="text-sm text-[#5d6d7c]">IVA (21%): $1,554</p>
                      <p className="font-bold text-black mt-1">Total: ${viewingOrder.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsOrderDetailOpen(false)}
            >
              Cerrar
            </Button>
            
            {(isAdmin || viewingOrder?.status === 'pending') && (
              <Button 
                className="bg-[#e3a765] hover:bg-[#e3a765]/90"
                onClick={() => {
                  if (viewingOrder) {
                    setSelectedOrder(viewingOrder);
                    setIsStatusDialogOpen(true);
                    setIsOrderDetailOpen(false);
                  }
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Cambiar estado
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Cambiar Estado del Pedido</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo estado para el pedido #{selectedOrder?.id.toString().padStart(4, '0')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select
              value={newStatus}
              onValueChange={(value) => setNewStatus(value as OrderStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                    Pendiente
                  </div>
                </SelectItem>
                <SelectItem value="processing">
                  <div className="flex items-center">
                    <Truck className="mr-2 h-4 w-4 text-blue-600" />
                    En proceso
                  </div>
                </SelectItem>
                <SelectItem value="delivered">
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    Entregado
                  </div>
                </SelectItem>
                <SelectItem value="canceled">
                  <div className="flex items-center">
                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                    Cancelado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-[#e3a765] hover:bg-[#e3a765]/90"
              onClick={() => {
                if (selectedOrder) {
                  updateOrderStatusMutation.mutate({
                    id: selectedOrder.id,
                    status: newStatus
                  });
                }
              }}
              disabled={updateOrderStatusMutation.isPending}
            >
              {updateOrderStatusMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Order Dialog (simplified) */}
      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo Pedido</DialogTitle>
            <DialogDescription>
              Crea un nuevo pedido seleccionando el cliente y los productos
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Client selection */}
            <div>
              <Label htmlFor="client" className="text-[#5d6d7c]">Cliente*</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Products selection (simplified) */}
            <div>
              <Label className="text-[#5d6d7c] block mb-2">Productos*</Label>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor="product" className="text-xs text-[#5d6d7c]">Producto</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products?.map(product => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name} - ${product.price} ({product.unitSize})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-20">
                        <Label htmlFor="quantity" className="text-xs text-[#5d6d7c]">Cantidad</Label>
                        <Input type="number" min="1" defaultValue="1" />
                      </div>
                      <Button variant="outline" size="icon" className="shrink-0">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    <Plus className="mr-1 h-4 w-4" />
                    Agregar otro producto
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Order summary */}
            <div>
              <h3 className="text-sm font-medium text-[#5d6d7c] mb-2">Resumen</h3>
              <div className="bg-gray-50 rounded-md p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-[#5d6d7c]">Subtotal:</span>
                  <span className="font-medium">$0</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-[#5d6d7c]">IVA (21%):</span>
                  <span className="font-medium">$0</span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-[#e3a765]">$0</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewOrderOpen(false)}
            >
              Cancelar
            </Button>
            <Button className="bg-[#e3a765] hover:bg-[#e3a765]/90">
              Crear pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
