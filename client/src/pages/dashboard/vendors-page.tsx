import { useState } from "react";
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
  DialogTitle, 
  DialogTrigger, 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Loader2,
  User,
  UserCheck,
  UserX,
  Filter,
  UserPlus
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
import { Badge } from "@/components/ui/badge";

type UserRole = 'super_admin' | 'admin' | 'vendor';

interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export default function VendorsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check if current user has admin permissions
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;
  
  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <UserX className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-black mb-2">Acceso denegado</h2>
        <p className="text-[#5d6d7c] text-center max-w-md mb-4">
          No tienes permisos para acceder a la gestión de vendedores. Esta sección está reservada para administradores.
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
  
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "vendor">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
    role: "vendor" as UserRole,
    active: true
  });
  
  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/users');
      return await res.json() as User[];
    }
  });
  
  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest('POST', '/api/users', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al crear el usuario",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: number, userData: Partial<typeof formData> }) => {
      const res = await apiRequest('PUT', `/api/users/${data.id}`, data.userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setEditUser(null);
      resetForm();
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar el usuario",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/users/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      toast({
        title: "Usuario desactivado",
        description: "El usuario ha sido desactivado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al desactivar el usuario",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      active: checked
    });
  };
  
  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      role: value as UserRole
    });
  };
  
  const resetForm = () => {
    setFormData({
      username: "",
      name: "",
      password: "",
      role: "vendor",
      active: true
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editUser) {
      // For edit, only include changed fields and omit password if empty
      const changedData: Partial<typeof formData> = {};
      if (formData.name !== editUser.name) changedData.name = formData.name;
      if (formData.username !== editUser.username) changedData.username = formData.username;
      if (formData.password) changedData.password = formData.password;
      if (formData.role !== editUser.role) changedData.role = formData.role;
      if (formData.active !== editUser.active) changedData.active = formData.active;
      
      updateUserMutation.mutate({ id: editUser.id, userData: changedData });
    } else {
      createUserMutation.mutate(formData);
    }
  };
  
  const openEditDialog = (user: User) => {
    setEditUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      password: "", // Don't show password, will only update if new one is entered
      role: user.role,
      active: user.active
    });
  };
  
  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };
  
  // Filter users
  const filteredUsers = users
    ? users
        .filter(user => {
          // Filter out current user (can't edit self)
          if (user.id === user?.id) return false;
          
          // Apply search filter
          const matchesSearch = 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase());
          
          // Apply status filter
          const matchesStatus = 
            filterStatus === 'all' ? true :
            filterStatus === 'active' ? user.active :
            !user.active;
          
          // Apply role filter
          const matchesRole = 
            filterRole === 'all' ? true :
            filterRole === 'admin' ? user.role === 'admin' || user.role === 'super_admin' :
            user.role === 'vendor';
          
          return matchesSearch && matchesStatus && matchesRole;
        })
    : [];
  
  // Helper function to get role label
  const getRoleLabel = (role: UserRole) => {
    switch(role) {
      case 'super_admin': return 'Super Administrador';
      case 'admin': return 'Administrador';
      case 'vendor': return 'Vendedor';
      default: return role;
    }
  };
  
  // Helper function to get role badge color
  const getRoleBadgeColor = (role: UserRole) => {
    switch(role) {
      case 'super_admin': return 'bg-[#5d6d7c] text-white';
      case 'admin': return 'bg-[#e3a765] text-white';
      case 'vendor': return 'bg-[#fdd000]/20 text-[#e3a765]';
      default: return 'bg-gray-200 text-gray-800';
    }
  };
  
  return (
    <div>
      {/* Header and filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Vendedores</h1>
          <p className="text-[#5d6d7c]">Gestiona los usuarios y sus permisos</p>
        </div>
        
        {isSuperAdmin && (
          <Button 
            onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}
            className="bg-[#e3a765] hover:bg-[#e3a765]/90"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5d6d7c]" size={18} />
            <Input
              placeholder="Buscar por nombre o usuario..."
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as typeof filterStatus)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filterRole}
              onValueChange={(value) => setFilterRole(value as typeof filterRole)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="vendor">Vendedores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Users Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>
            Lista de usuarios con acceso al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#e3a765]" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-[#5d6d7c] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">No se encontraron usuarios</h3>
              <p className="text-[#5d6d7c] max-w-md mx-auto">
                {searchTerm || filterStatus !== 'all' || filterRole !== 'all'
                  ? "No hay resultados para los filtros aplicados."
                  : "No hay usuarios registrados en el sistema."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium text-[#5d6d7c] p-3">Nombre</th>
                    <th className="text-left font-medium text-[#5d6d7c] p-3">Usuario</th>
                    <th className="text-left font-medium text-[#5d6d7c] p-3">Rol</th>
                    <th className="text-left font-medium text-[#5d6d7c] p-3">Estado</th>
                    <th className="text-left font-medium text-[#5d6d7c] p-3">Fecha registro</th>
                    <th className="text-right font-medium text-[#5d6d7c] p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr 
                      key={user.id}
                      className="border-b hover:bg-gray-50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#e3a765]/10 flex items-center justify-center text-[#e3a765]">
                            <User size={16} />
                          </div>
                          <span className="font-medium text-black">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-[#5d6d7c]">{user.username}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={`${getRoleBadgeColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {user.active ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            <UserCheck size={14} className="mr-1" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                            <UserX size={14} className="mr-1" />
                            Inactivo
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-[#5d6d7c]">
                        {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: es })}
                      </td>
                      <td className="p-3 text-right">
                        {isSuperAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openDeleteDialog(user)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                {user.active ? 'Desactivar' : 'Eliminar'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={isAddDialogOpen || !!editUser} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditUser(null);
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
            <DialogDescription>
              {editUser 
                ? 'Modifica los datos del usuario seleccionado.' 
                : 'Completa los campos para crear un nuevo usuario.'}
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
                    placeholder="Ej: Juan Pérez"
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="username" className="text-[#5d6d7c]">Nombre de usuario*</Label>
                  <Input 
                    id="username" 
                    name="username" 
                    placeholder="Ej: jperez"
                    value={formData.username} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-[#5d6d7c]">
                    {editUser ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña*'}
                  </Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="Contraseña segura"
                    value={formData.password} 
                    onChange={handleInputChange} 
                    required={!editUser} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="role" className="text-[#5d6d7c]">Rol*</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={handleSelectChange}
                    disabled={!isSuperAdmin}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {isSuperAdmin && (
                        <SelectItem value="admin">Administrador</SelectItem>
                      )}
                      <SelectItem value="vendor">Vendedor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="active"
                    checked={formData.active}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="active" className="text-[#5d6d7c]">Usuario activo</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditUser(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-[#e3a765] hover:bg-[#e3a765]/90"
                disabled={createUserMutation.isPending || updateUserMutation.isPending}
              >
                {(createUserMutation.isPending || updateUserMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editUser ? 'Guardar cambios' : 'Crear usuario'}
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
              Esta acción {userToDelete?.active ? 'desactivará' : 'eliminará'} el usuario{' '}
              <span className="font-medium">{userToDelete?.name}</span>.
              {userToDelete?.active 
                ? ' El usuario no podrá acceder al sistema, pero sus datos se mantendrán.'
                : ' Esto eliminará permanentemente al usuario del sistema.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => userToDelete && deleteUserMutation.mutate(userToDelete.id)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {userToDelete?.active ? 'Desactivar' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
