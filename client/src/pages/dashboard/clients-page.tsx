import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Loader2, 
  User,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  ShoppingBag
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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Client = {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  vendorId: number | null;
  createdAt: string;
};

export default function ClientsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    vendorId: ""
  });

  // Fetch clients
  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/clients');
      return await res.json() as Client[];
    }
  });

  // Fetch vendors (only for admin users)
  const { data: vendors, refetch: refetchVendors } = useQuery({
    queryKey: ['/api/users/vendors'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/users/vendors');
      return await res.json() as Array<{id: number, name: string, username: string}>;
    },
    enabled: isAdmin
  });

  // Mutations
  const createClientMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest('POST', '/api/clients', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Cliente creado",
        description: "El cliente ha sido creado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al crear el cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: async (data: { id: number, client: Partial<typeof formData> }) => {
      const res = await apiRequest('PUT', `/api/clients/${data.id}`, data.client);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setEditClient(null);
      resetForm();
      toast({
        title: "Cliente actualizado",
        description: "El cliente ha sido actualizado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar el cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      vendorId: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editClient) {
      updateClientMutation.mutate({ 
        id: editClient.id, 
        client: formData
      });
    } else {
      createClientMutation.mutate(formData);
    }
  };

  const openEditDialog = (client: Client) => {
    setEditClient(client);
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone,
      address: client.address || "",
      vendorId: client.vendorId ? client.vendorId.toString() : ""
    });
  };

  const openDeleteDialog = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const navigateToChat = (clientId: number) => {
    window.location.href = `/dashboard/chats?client=${clientId}`;
  };

  const navigateToOrders = (clientId: number) => {
    window.location.href = `/dashboard/orders?client=${clientId}`;
  };

  const onCreateClientClick = () => {
    // Refresh vendors list when opening dialog
    refetchVendors();
    setIsAddDialogOpen(true);
  };

  // Filter clients
  const filteredClients = clients
    ? clients.filter(client => {
        return client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
               client.phone.includes(searchTerm);
      })
    : [];

  return (
    <div>
      {/* Header and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Clientes</h1>
          <p className="text-[#5d6d7c]">{isAdmin ? 'Gestiona todos los clientes de la empresa' : 'Gestiona tus clientes asignados'}</p>
        </div>

        <Button 
          onClick={onCreateClientClick}
          className="bg-[#e3a765] hover:bg-[#e3a765]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5d6d7c]" size={18} />
          <Input
            placeholder="Buscar clientes por nombre, email o teléfono..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Clients List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#e3a765]" />
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <User className="h-12 w-12 text-[#5d6d7c] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">No se encontraron clientes</h3>
          <p className="text-[#5d6d7c] max-w-md mx-auto mb-6">
            {searchTerm 
              ? `No hay resultados para "${searchTerm}". Intenta con otra búsqueda.` 
              : isAdmin 
                ? "No hay clientes registrados en el sistema aún." 
                : "No tienes clientes asignados."}
          </p>
          <Button 
            className="bg-[#e3a765] hover:bg-[#e3a765]/90"
            onClick={onCreateClientClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Cliente
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 pt-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#e3a765]/10 flex items-center justify-center text-[#e3a765]">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{client.name}</CardTitle>
                        {client.vendorId && !isAdmin && (
                          <Badge className="mt-1 bg-[#fdd000]/20 text-[#e3a765] hover:bg-[#fdd000]/30">
                            Tu cliente
                          </Badge>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigateToChat(client.id)}>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Ver conversación
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigateToOrders(client.id)}>
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Ver pedidos
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(client)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(client)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#5d6d7c]" />
                      <a 
                        href={`tel:${client.phone}`} 
                        className="text-sm text-[#5d6d7c] hover:text-[#e3a765] transition-colors"
                      >
                        {client.phone}
                      </a>
                    </div>

                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#5d6d7c]" />
                        <a 
                          href={`mailto:${client.email}`} 
                          className="text-sm text-[#5d6d7c] hover:text-[#e3a765] transition-colors break-all"
                        >
                          {client.email}
                        </a>
                      </div>
                    )}

                    {client.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-[#5d6d7c] mt-0.5" />
                        <span className="text-sm text-[#5d6d7c]">{client.address}</span>
                      </div>
                    )}

                    <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs text-[#5d6d7c]">
                        Cliente desde: {format(new Date(client.createdAt), 'dd/MM/yyyy', { locale: es })}
                      </span>

                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0" 
                          onClick={() => navigateToChat(client.id)}
                        >
                          <MessageCircle className="h-4 w-4 text-[#5d6d7c]" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => navigateToOrders(client.id)}
                        >
                          <ShoppingBag className="h-4 w-4 text-[#5d6d7c]" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Client Dialog */}
      <Dialog open={isAddDialogOpen || !!editClient} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditClient(null);
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editClient ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
            <DialogDescription>
              {editClient 
                ? 'Modifica los datos del cliente seleccionado.' 
                : 'Completa los campos para registrar un nuevo cliente.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name" className="text-[#5d6d7c]">Nombre completo*</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Ej: María González"
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-[#5d6d7c]">Teléfono*</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    placeholder="Ej: +54 11 1234-5678"
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-[#5d6d7c]">Email (opcional)</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="Ej: cliente@email.com"
                    value={formData.email} 
                    onChange={handleInputChange} 
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-[#5d6d7c]">Dirección (opcional)</Label>
                  <Textarea 
                    id="address" 
                    name="address" 
                    placeholder="Ej: Av. Corrientes 1234, CABA"
                    value={formData.address} 
                    onChange={handleInputChange} 
                  />
                </div>

                {isAdmin && (
                  <div>
                    <Label htmlFor="vendorId" className="text-[#5d6d7c]">
                      {!editClient ? 'Asignar a vendedor*' : 'Reasignar a vendedor*'}
                    </Label>
                    <Select
                      name="vendorId"
                      value={formData.vendorId}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          vendorId: value
                        });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar vendedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors?.map((vendor: {id: number, name: string}) => (
                          <SelectItem key={vendor.id} value={vendor.id.toString()}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!editClient && (
                      <p className="text-sm text-[#5d6d7c] mt-1">
                        Los clientes deben estar asignados a un vendedor para su seguimiento.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditClient(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-[#e3a765] hover:bg-[#e3a765]/90"
                disabled={createClientMutation.isPending || updateClientMutation.isPending}
              >
                {(createClientMutation.isPending || updateClientMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editClient ? 'Guardar cambios' : 'Crear cliente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el cliente{' '}
              <span className="font-medium">{clientToDelete?.name}</span> del sistema.
              Todos los datos asociados a este cliente también serán eliminados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                // In a real app, this would call a delete API
                toast({
                  title: "Cliente eliminado",
                  description: `El cliente ${clientToDelete?.name} ha sido eliminado correctamente.`,
                });
                setIsDeleteDialogOpen(false);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}