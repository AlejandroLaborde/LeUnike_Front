import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { DashboardTitle } from "@/components/dashboard/title";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ShieldAlert, Search, MoreVertical, PlusCircle, Check, X, RefreshCw } from "lucide-react";
import axios from "axios";
import { es } from "date-fns/locale";

// Tipos
type User = {
  id: number;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  role: "vendor" | "admin" | "super_admin";
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// Schema de validación de formulario
const formSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().optional(),
  role: z.enum(["vendor", "admin", "super_admin"]),
  active: z.boolean().default(true),
});

// Formateador de fechas
const formatDate = (date: Date) => {
  return format(date, "dd MMM yyyy", { locale: es });
};

export default function VendorsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const queryClient = useQueryClient();

  // Si el usuario no es admin o super_admin, mostrar acceso restringido
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-black mb-2">Acceso denegado</h2>
        <p className="text-[#5d6d7c] text-center max-w-md mb-4">
          No tienes permisos para acceder a la gestión de vendedores. Esta sección está reservada para Administradores.
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

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    role: "vendor" as "vendor" | "admin" | "super_admin",
    active: true,
  });
  const [vendorToDelete, setVendorToDelete] = useState<User | null>(null);
  const [editingVendor, setEditingVendor] = useState<User | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      role: "vendor",
      active: true,
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const toggleVendorStatus = async (vendor: User) => {
    try {
      const updatedVendor = { ...vendor, active: !vendor.active };
      await axios.put(`/api/users/${vendor.id}`, updatedVendor);
      queryClient.invalidateQueries(["users"]);
      toast({
        title: `Vendedor ${updatedVendor.active ? 'activado' : 'desactivado'}`, 
        description: `El estado del vendedor ${vendor.name} ha sido actualizado.`
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "No se pudo actualizar el estado del vendedor." 
      });
    }
  };

  const openDeleteDialog = (vendorId: number) => {
    setCurrentUserId(vendorId);
    setIsDeleteDialogOpen(true);
  };

  const openEditDialog = (userData: User) => {
    setCurrentUserId(userData.id);
    setFormData({
      username: userData.username,
      password: "", // No incluimos la contraseña actual por seguridad
      name: userData.name,
      email: userData.email || "",
      phone: userData.phone || "",
      role: userData.role,
      active: userData.active,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      role: "vendor",
      active: true,
    });
  };

  const handleDeleteUser = async () => {
    if (!vendorToDelete) return;

    try {
      await axios.delete(`/api/users/${vendorToDelete.id}`);
      queryClient.invalidateQueries(["users"]);
      setIsDeleteDialogOpen(false);
      setVendorToDelete(null);
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el usuario",
      });
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el usuario");
      }

      // Actualizar la lista de usuarios
      queryClient.invalidateQueries(["users"]);
      setIsAddDialogOpen(false);
      resetForm();

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado correctamente",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "No se pudo crear el usuario",
      });
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!currentUserId) return;

      const dataToUpdate = { ...formData };
      // Si no se proporciona una nueva contraseña, eliminarla del objeto de actualización
      if (!dataToUpdate.password) {
        delete dataToUpdate.password;
      }

      const response = await fetch(`/api/users/${currentUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToUpdate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar el usuario");
      }

      // Actualizar la lista de usuarios
      queryClient.invalidateQueries(["users"]);
      setIsEditDialogOpen(false);
      resetForm();

      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado correctamente",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "No se pudo actualizar el usuario",
      });
    }
  };

  const { data: allUsers, isLoading, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Error fetching vendors");
      }
      const data = await response.json();
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Filtrar solo los usuarios con rol de vendedor
  const vendors = useMemo(() => 
    allUsers?.filter((user: User) => user.role === 'vendor') || [], 
    [allUsers]
  );

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "No se pudieron cargar los vendedores",
    });
  }

  const filteredVendors = useMemo(() => {
    return vendors?.filter((vendor: User) => {
      // Filtrar por término de búsqueda
      const matchesSearch = !searchTerm ? true : (
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Filtrar por estado
      const matchesFilter = 
        filterStatus === "all" ? true :
        filterStatus === "active" ? vendor.active :
        !vendor.active;

      return matchesSearch && matchesFilter;
    });
  }, [vendors, searchTerm, filterStatus]);

  // Función para refrescar datos
  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: "Datos actualizados",
      description: "La lista de vendedores ha sido actualizada"
    });
  }, [refetch, toast]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <DashboardTitle
          title="Gestión de Vendedores"
          description="Administra los usuarios con rol de vendedor en el sistema"
        />
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Vendedor
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-6">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#5d6d7c]" />
              <Input
                placeholder="Buscar vendedor..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value as any)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleRefresh} className="px-3">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#5d6d7c]">No hay vendedores registrados.</p>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#5d6d7c]">No se encontraron resultados para tu búsqueda.</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
              >
                Restablecer filtros
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor: User) => (
                    <TableRow key={vendor.id} className={!vendor.active ? "bg-gray-50" : ""}>
                      <TableCell className="font-medium">
                        {vendor.name}
                      </TableCell>
                      <TableCell>{vendor.username}</TableCell>
                      <TableCell>{vendor.email || "-"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vendor.role === "super_admin"
                            ? "bg-blue-100 text-blue-800"
                            : vendor.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {vendor.role === "super_admin"
                            ? "Super Administrador"
                            : vendor.role === "admin"
                            ? "Administrador"
                            : "Vendedor"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={vendor.active ? "default" : "outline"} className={!vendor.active ? "bg-gray-200 text-gray-700" : ""}>
                          {vendor.active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{vendor.createdAt ? formatDate(new Date(vendor.createdAt)) : "-"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleVendorStatus(vendor)}>
                              {vendor.active ? (
                                <>
                                  <X className="mr-2 h-4 w-4" />
                                  <span>Desactivar</span>
                                </>
                              ) : (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  <span>Activar</span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(vendor)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setVendorToDelete(vendor);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para agregar un nuevo vendedor */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Crear nuevo vendedor</DialogTitle>
            <DialogDescription>
              Completa el formulario para crear un nuevo usuario con rol de vendedor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username" className="text-[#5d6d7c]">
                  Usuario*
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-[#5d6d7c]">
                  Contraseña*
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="name" className="text-[#5d6d7c]">
                Nombre completo*
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-[#5d6d7c]">
                  Correo electrónico*
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-[#5d6d7c]">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleSwitchChange("active", checked)}
              />
              <Label htmlFor="active" className="font-medium text-sm cursor-pointer">
                {formData.active ? "Usuario activo" : "Usuario inactivo"}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateUser}>Crear Vendedor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar un vendedor */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Editar vendedor</DialogTitle>
            <DialogDescription>
              Actualiza la información del vendedor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username" className="text-[#5d6d7c]">
                  Usuario*
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-[#5d6d7c]">
                  Nueva contraseña
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="Dejar en blanco para no cambiar"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="name" className="text-[#5d6d7c]">
                Nombre completo*
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-[#5d6d7c]">
                  Correo electrónico*
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-[#5d6d7c]">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleSwitchChange("active", checked)}
              />
              <Label htmlFor="active" className="font-medium text-sm cursor-pointer">
                {formData.active ? "Usuario activo" : "Usuario inactivo"}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}