
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Search, Plus, MoreVertical, Edit, Trash, Filter, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isVegetarian: boolean;
  isFeatured: boolean;
  active: boolean;
  unitSize: string;
  createdAt: string;
};

type SortOption = 'name' | 'price' | 'newest' | 'category';

export default function ProductsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const queryClient = useQueryClient();
  
  // State for product form
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: 'sorrentinos',
    imageUrl: '',
    isVegetarian: false,
    isFeatured: false,
    active: true,
    unitSize: '',
  });
  
  // UI states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showInactive, setShowInactive] = useState(false);
  
  // Data fetching
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }
      return response.json();
    }
  });
  
  // Mutations
  const createMutation = useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear el producto');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Producto creado",
        description: "El producto ha sido creado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Product> }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditDialogOpen(false);
      resetForm();
      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDeleteDialogOpen(false);
      setCurrentProductId(null);
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido desactivado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    });
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'sorrentinos',
      imageUrl: '',
      isVegetarian: false,
      isFeatured: false,
      active: true,
      unitSize: '',
    });
  };
  
  const handleCreateProduct = () => {
    if (!formData.name || !formData.description || !formData.unitSize) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate(formData);
  };
  
  const handleUpdateProduct = () => {
    if (!currentProductId) return;
    
    if (!formData.name || !formData.description || !formData.unitSize) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }
    
    updateMutation.mutate({ id: currentProductId, data: formData });
  };
  
  const handleDeleteProduct = () => {
    if (!currentProductId) return;
    deleteMutation.mutate(currentProductId);
  };
  
  const openEditDialog = (product: Product) => {
    setCurrentProductId(product.id);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      category: product.category || 'sorrentinos',
      imageUrl: product.imageUrl || '',
      isVegetarian: product.isVegetarian || false,
      isFeatured: product.isFeatured || false,
      active: product.active,
      unitSize: product.unitSize || '',
    });
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (productId: number) => {
    setCurrentProductId(productId);
    setIsDeleteDialogOpen(true);
  };
  
  // Filter and sort products
  const filteredAndSortedProducts = products.filter(product => {
    // Filter by search term
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    // Filter by active status
    const matchesActiveStatus = showInactive ? true : product.active;
    
    return matchesSearch && matchesCategory && matchesActiveStatus;
  }).sort((a, b) => {
    // Sort by different criteria
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return a.price - b.price;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });
  
  // Helper function to get category label
  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'sorrentinos': return 'Sorrentinos';
      case 'ravioles': return 'Ravioles';
      case 'canelones': return 'Canelones';
      case 'salsas': return 'Salsas';
      default: return category;
    }
  };

  return (
    <div>
      {/* Header and filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Productos</h1>
          <p className="text-[#5d6d7c]">Gestiona el catálogo de productos de la empresa</p>
        </div>
        
        {isAdmin && (
          <Button 
            onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}
            className="bg-[#e3a765] hover:bg-[#e3a765]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        )}
      </div>
      
      {/* Filters and search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#5d6d7c]" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value)}
        >
          <SelectTrigger>
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Categoría" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="sorrentinos">Sorrentinos</SelectItem>
            <SelectItem value="ravioles">Ravioles</SelectItem>
            <SelectItem value="canelones">Canelones</SelectItem>
            <SelectItem value="salsas">Salsas</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger>
            <div className="flex items-center">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Ordenar por" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="price">Precio</SelectItem>
            <SelectItem value="newest">Más recientes</SelectItem>
            <SelectItem value="category">Categoría</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={setShowInactive}
          />
          <Label htmlFor="show-inactive">Mostrar inactivos</Label>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#e3a765]" />
        </div>
      ) : (
        <>
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f2efe2] rounded-full mb-4">
                <Search className="h-8 w-8 text-[#5d6d7c]" />
              </div>
              <h3 className="text-lg font-medium text-black mb-2">No se encontraron productos</h3>
              <p className="text-[#5d6d7c] max-w-md mx-auto">
                {searchTerm 
                  ? `No hay resultados para "${searchTerm}". Intenta con otra búsqueda.` 
                  : "No hay productos en esta categoría."}
              </p>
              {isAdmin && (
                <Button 
                  className="mt-4 bg-[#e3a765] hover:bg-[#e3a765]/90"
                  onClick={() => {
                    resetForm();
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Producto
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`overflow-hidden ${!product.active ? 'opacity-60' : ''}`}>
                    {product.imageUrl ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-[#f2efe2] flex items-center justify-center">
                        <span className="text-[#5d6d7c]">Sin imagen</span>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg">{product.name}</h3>
                        {isAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openEditDialog(product)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openDeleteDialog(product.id)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                {product.active ? 'Desactivar' : 'Eliminar'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      <p className="text-sm text-[#5d6d7c] line-clamp-2 mb-3">{product.description}</p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-black">${product.price.toLocaleString()}</span>
                        <span className="text-sm text-[#5d6d7c]">{product.unitSize}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-[#f2efe2] text-[#5d6d7c]">
                          {getCategoryLabel(product.category)}
                        </Badge>
                        
                        {product.isVegetarian && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Vegetariano
                          </Badge>
                        )}
                        
                        {product.isFeatured && (
                          <Badge variant="outline" className="bg-[#e3a765]/10 text-[#e3a765] border-[#e3a765]/20">
                            Destacado
                          </Badge>
                        )}
                        
                        {!product.active && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Producto</DialogTitle>
            <DialogDescription>
              Agrega un nuevo producto al catálogo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre*
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción*
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Precio*
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitSize" className="text-right">
                Presentación*
              </Label>
              <Input
                id="unitSize"
                name="unitSize"
                placeholder="ej. Bandeja 12 unidades"
                value={formData.unitSize}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoría
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sorrentinos">Sorrentinos</SelectItem>
                  <SelectItem value="ravioles">Ravioles</SelectItem>
                  <SelectItem value="canelones">Canelones</SelectItem>
                  <SelectItem value="salsas">Salsas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">
                URL de Imagen
              </Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isVegetarian" className="text-right">
                Vegetariano
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="isVegetarian"
                  checked={formData.isVegetarian}
                  onCheckedChange={(checked) => handleSwitchChange('isVegetarian', checked)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isFeatured" className="text-right">
                Destacado
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleSwitchChange('isFeatured', checked)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-[#e3a765] hover:bg-[#e3a765]/90" 
              onClick={handleCreateProduct}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Modifica los detalles del producto.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nombre*
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Descripción*
              </Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                Precio*
              </Label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-unitSize" className="text-right">
                Presentación*
              </Label>
              <Input
                id="edit-unitSize"
                name="unitSize"
                placeholder="ej. Bandeja 12 unidades"
                value={formData.unitSize}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Categoría
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sorrentinos">Sorrentinos</SelectItem>
                  <SelectItem value="ravioles">Ravioles</SelectItem>
                  <SelectItem value="canelones">Canelones</SelectItem>
                  <SelectItem value="salsas">Salsas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-imageUrl" className="text-right">
                URL de Imagen
              </Label>
              <Input
                id="edit-imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isVegetarian" className="text-right">
                Vegetariano
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="edit-isVegetarian"
                  checked={formData.isVegetarian}
                  onCheckedChange={(checked) => handleSwitchChange('isVegetarian', checked)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isFeatured" className="text-right">
                Destacado
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="edit-isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleSwitchChange('isFeatured', checked)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-active" className="text-right">
                Activo
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleSwitchChange('active', checked)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                setIsEditDialogOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-[#e3a765] hover:bg-[#e3a765]/90" 
              onClick={handleUpdateProduct}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar desactivación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas desactivar este producto? Podrás reactivarlo más tarde.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCurrentProductId(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Desactivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, PlusCircle, Search, Trash } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Definir la interfaz para un producto
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isVegetarian: boolean;
  isFeatured: boolean;
  active: boolean;
  unitSize: string;
  stock: number;
}

interface NewProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  unitSize: string;
  isVegetarian: boolean;
  isFeatured: boolean;
  stock: string;
}

export default function ProductsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [formData, setFormData] = useState<NewProductFormData>({
    name: "",
    description: "",
    price: "",
    category: "",
    unitSize: "",
    isVegetarian: false,
    isFeatured: false,
    stock: "0"
  });
  const [tabValue, setTabValue] = useState("active");

  // Cargar productos
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Error al cargar productos");
      }
      return response.json();
    }
  });

  // Crear un nuevo producto
  const createProduct = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear el producto");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Producto creado",
        description: "El producto ha sido creado exitosamente",
      });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Actualizar un producto existente
  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar el producto");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado exitosamente",
      });
      resetForm();
      setIsDialogOpen(false);
      setEditingProductId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Desactivar un producto
  const deactivateProduct = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al desactivar el producto");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Producto desactivado",
        description: "El producto ha sido desactivado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = (tabValue === "active" && product.active) || 
                          (tabValue === "inactive" && !product.active);
    return matchesSearch && matchesStatus;
  });

  // Abrir diálogo para editar un producto existente
  const openEditDialog = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      unitSize: product.unitSize,
      isVegetarian: product.isVegetarian,
      isFeatured: product.isFeatured,
      stock: product.stock.toString()
    });
    setEditingProductId(product.id);
    setIsDialogOpen(true);
  };

  // Abrir diálogo para crear un nuevo producto
  const openNewDialog = () => {
    resetForm();
    setEditingProductId(null);
    setIsDialogOpen(true);
  };

  // Resetear el formulario
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      unitSize: "",
      isVegetarian: false,
      isFeatured: false,
      stock: "0"
    });
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name || !formData.description || !formData.price || !formData.unitSize) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }
    
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseInt(formData.price),
      category: formData.category || "General",
      unitSize: formData.unitSize,
      isVegetarian: formData.isVegetarian,
      isFeatured: formData.isFeatured,
      stock: parseInt(formData.stock) || 0
    };
    
    if (editingProductId) {
      updateProduct.mutate({ id: editingProductId, data: productData });
    } else {
      createProduct.mutate(productData);
    }
  };

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en checkboxes
  const handleCheckboxChange = (name: keyof NewProductFormData, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Manejar selección de categoría
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  // Verificar si el usuario tiene permisos de administrador
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  if (!isAdmin) {
    return (
      <div className="py-10 px-4 text-center">
        <Package className="h-12 w-12 text-[#5d6d7c] mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-black mb-3">Acceso restringido</h2>
        <p className="text-[#5d6d7c] max-w-md mx-auto mb-6">
          No tienes permisos para acceder a la gestión de productos.
          Por favor, contacta con un administrador si necesitas realizar cambios.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Productos</h1>
          <p className="text-[#5d6d7c]">Gestiona los productos disponibles para la venta</p>
        </div>
        <Button 
          className="mt-4 md:mt-0 bg-[#e3a765] hover:bg-[#e3a765]/90"
          onClick={openNewDialog}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nuevo producto
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <CardTitle>Listado de productos</CardTitle>
            <div className="w-full md:w-auto mt-4 md:mt-0 flex items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5d6d7c]" />
                <Input
                  className="pl-9"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <CardDescription>
            <Tabs defaultValue="active" className="mt-2" onValueChange={setTabValue}>
              <TabsList>
                <TabsTrigger value="active">Activos</TabsTrigger>
                <TabsTrigger value="inactive">Inactivos</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-[#e3a765]" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10">
              <Package className="h-12 w-12 text-[#5d6d7c] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black">No hay productos</h3>
              <p className="text-[#5d6d7c] mt-1">
                {searchTerm ? "No se encontraron productos con tu búsqueda" : "No hay productos en esta categoría"}
              </p>
              {!searchTerm && (
                <Button 
                  className="mt-4 bg-[#e3a765] hover:bg-[#e3a765]/90"
                  onClick={openNewDialog}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Añadir producto
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#5d6d7c] uppercase tracking-wider">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#5d6d7c] uppercase tracking-wider">Precio</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#5d6d7c] uppercase tracking-wider">Categoría</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#5d6d7c] uppercase tracking-wider">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#5d6d7c] uppercase tracking-wider">Características</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#5d6d7c] uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#e3a765]/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-[#e3a765]" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-black">{product.name}</div>
                            <div className="text-sm text-[#5d6d7c]">{product.unitSize}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-black">${product.price.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-black">{product.category}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' :
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock} unidades
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex space-x-2">
                          {product.isVegetarian && (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Vegetariano
                            </span>
                          )}
                          {product.isFeatured && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              Destacado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}>
                          Editar
                        </Button>
                        {product.active ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => deactivateProduct.mutate(product.id)}
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            Desactivar
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => updateProduct.mutate({ id: product.id, data: { active: true } })}
                          >
                            Activar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear/editar productos */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProductId ? "Editar producto" : "Crear nuevo producto"}</DialogTitle>
            <DialogDescription>
              {editingProductId 
                ? "Actualiza la información del producto seleccionado" 
                : "Completa el formulario para crear un nuevo producto"
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  name="name"
                  className="col-span-3"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Input
                  id="description"
                  name="description"
                  className="col-span-3"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Precio
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  className="col-span-3"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  className="col-span-3"
                  value={formData.stock}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Categoría
                </Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sorrentinos">Sorrentinos</SelectItem>
                    <SelectItem value="Ravioles">Ravioles</SelectItem>
                    <SelectItem value="Canelones">Canelones</SelectItem>
                    <SelectItem value="Fideos">Fideos</SelectItem>
                    <SelectItem value="Salsas">Salsas</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unitSize" className="text-right">
                  Tamaño/Unidad
                </Label>
                <Input
                  id="unitSize"
                  name="unitSize"
                  className="col-span-3"
                  placeholder="Ej: 500g / 12 unidades"
                  value={formData.unitSize}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">Opciones</div>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isVegetarian" 
                      checked={formData.isVegetarian} 
                      onCheckedChange={(checked) => handleCheckboxChange('isVegetarian', checked as boolean)}
                    />
                    <Label htmlFor="isVegetarian">Vegetariano</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isFeatured" 
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => handleCheckboxChange('isFeatured', checked as boolean)}
                    />
                    <Label htmlFor="isFeatured">Destacado</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#e3a765] hover:bg-[#e3a765]/90">
                {createProduct.isPending || updateProduct.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editingProductId ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
