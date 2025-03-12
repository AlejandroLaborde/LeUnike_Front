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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowDownAZ,
  ArrowDown01,
  MoreHorizontal, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Loader2,
  ArrowUp 
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
type FilterOption = 'all' | 'featured' | 'vegetarian' | 'sorrentinos' | 'ravioles' | 'canelones' | 'salsas';

export default function ProductsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "sorrentinos",
    imageUrl: "",
    isVegetarian: false,
    isFeatured: false,
    unitSize: "",
  });

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/products');
      return await res.json() as Product[];
    }
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest('POST', '/api/products', {
        ...data,
        price: Number(data.price),
        active: true
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Producto creado",
        description: "El producto ha sido creado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al crear el producto",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: { id: number, product: Partial<Product> }) => {
      const res = await apiRequest('PUT', `/api/products/${data.id}`, data.product);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setEditProduct(null);
      resetForm();
      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar el producto",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/products/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar el producto",
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

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData({
      ...formData,
      [id]: checked
    });
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "sorrentinos",
      imageUrl: "",
      isVegetarian: false,
      isFeatured: false,
      unitSize: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editProduct) {
      updateProductMutation.mutate({ 
        id: editProduct.id, 
        product: {
          ...formData,
          price: Number(formData.price)
        }
      });
    } else {
      createProductMutation.mutate(formData);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      imageUrl: product.imageUrl || "",
      isVegetarian: product.isVegetarian,
      isFeatured: product.isFeatured,
      unitSize: product.unitSize,
    });
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Filter and sort products
  const filteredAndSortedProducts = products
    ? products
        .filter(product => {
          // Apply search term filter
          const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               product.description.toLowerCase().includes(searchTerm.toLowerCase());
          
          // Apply category filter
          const matchesFilter = 
            filterBy === 'all' ? true :
            filterBy === 'featured' ? product.isFeatured :
            filterBy === 'vegetarian' ? product.isVegetarian :
            product.category === filterBy;
          
          return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
          // Apply sorting
          if (sortBy === 'name') {
            return sortDirection === 'asc' 
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          } else if (sortBy === 'price') {
            return sortDirection === 'asc' 
              ? a.price - b.price
              : b.price - a.price;
          } else if (sortBy === 'newest') {
            return sortDirection === 'asc' 
              ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          } else if (sortBy === 'category') {
            return sortDirection === 'asc' 
              ? a.category.localeCompare(b.category)
              : b.category.localeCompare(a.category);
          }
          return 0;
        })
    : [];

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

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5d6d7c]" size={18} />
            <Input
              placeholder="Buscar productos..."
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            value={filterBy}
            onValueChange={(value) => setFilterBy(value as FilterOption)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los productos</SelectItem>
              <SelectItem value="featured">Destacados</SelectItem>
              <SelectItem value="vegetarian">Vegetarianos</SelectItem>
              <Separator className="my-1" />
              <SelectItem value="sorrentinos">Sorrentinos</SelectItem>
              <SelectItem value="ravioles">Ravioles</SelectItem>
              <SelectItem value="canelones">Canelones</SelectItem>
              <SelectItem value="salsas">Salsas</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px]">
                {sortBy === 'name' && <ArrowDownAZ className="mr-2 h-4 w-4" />}
                {sortBy === 'price' && <ArrowDown01 className="mr-2 h-4 w-4" />}
                {sortBy === 'newest' && <ArrowUp className="mr-2 h-4 w-4" />}
                Ordenar por{' '}
                {sortBy === 'name' ? 'Nombre' : 
                 sortBy === 'price' ? 'Precio' : 
                 sortBy === 'newest' ? 'Más reciente' : 
                 'Categoría'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                <ArrowDownAZ className="mr-2 h-4 w-4" />
                Nombre
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('price')}>
                <ArrowDown01 className="mr-2 h-4 w-4" />
                Precio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('newest')}>
                <ArrowUp className="mr-2 h-4 w-4" />
                Más reciente
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('category')}>
                <ArrowDownAZ className="mr-2 h-4 w-4" />
                Categoría
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleSortDirection}>
                {sortDirection === 'asc' ? 'Ascendente ↑' : 'Descendente ↓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              {filteredAndSortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-48 overflow-hidden bg-[#f2efe2]">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#5d6d7c]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Tags */}
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {product.isFeatured && (
                          <span className="bg-[#fdd000]/20 text-[#e3a765] px-2 py-1 text-xs font-medium rounded">
                            Destacado
                          </span>
                        )}
                        {product.isVegetarian && (
                          <span className="bg-[#5d6d7c]/10 text-[#5d6d7c] px-2 py-1 text-xs font-medium rounded">
                            Vegetariano
                          </span>
                        )}
                      </div>
                      
                      {isAdmin && (
                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white rounded-full">
                                <MoreHorizontal size={16} />
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
                                onClick={() => openDeleteDialog(product)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="flex-grow py-4">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-[#5d6d7c] font-medium px-2 py-0.5 bg-[#f2efe2] rounded">
                          {getCategoryLabel(product.category)}
                        </span>
                        <span className="font-semibold text-[#e3a765]">
                          ${product.price.toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-black mb-2">{product.name}</h3>
                      <p className="text-[#5d6d7c] text-sm line-clamp-3 mb-2">
                        {product.description}
                      </p>
                      <p className="text-xs text-[#5d6d7c]">
                        Tamaño: <span className="font-medium">{product.unitSize}</span>
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddDialogOpen || !!editProduct} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditProduct(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
            <DialogDescription>
              {editProduct 
                ? 'Modifica los detalles del producto existente.' 
                : 'Completa los campos para crear un nuevo producto.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name" className="text-[#5d6d7c]">Nombre del producto*</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Ej: Sorrentinos de Queso y Jamón"
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description" className="text-[#5d6d7c]">Descripción*</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Describe el producto..."
                    value={formData.description} 
                    onChange={handleInputChange} 
                    required 
                    className="min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="price" className="text-[#5d6d7c]">Precio*</Label>
                  <Input 
                    id="price" 
                    name="price" 
                    type="number" 
                    placeholder="Ej: 1800"
                    value={formData.price} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="unitSize" className="text-[#5d6d7c]">Tamaño/Unidad*</Label>
                  <Input 
                    id="unitSize" 
                    name="unitSize" 
                    placeholder="Ej: 12 unid." 
                    value={formData.unitSize} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-[#5d6d7c]">Categoría*</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleSelectChange(value, 'category')}
                  >
                    <SelectTrigger>
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
                
                <div>
                  <Label htmlFor="imageUrl" className="text-[#5d6d7c]">URL de imagen (opcional)</Label>
                  <Input 
                    id="imageUrl" 
                    name="imageUrl" 
                    placeholder="https://example.com/image.jpg" 
                    value={formData.imageUrl} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isVegetarian"
                      checked={formData.isVegetarian}
                      onCheckedChange={(checked) => handleCheckboxChange('isVegetarian', checked as boolean)}
                    />
                    <Label htmlFor="isVegetarian" className="text-[#5d6d7c]">Vegetariano</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => handleCheckboxChange('isFeatured', checked as boolean)}
                    />
                    <Label htmlFor="isFeatured" className="text-[#5d6d7c]">Destacado</Label>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditProduct(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-[#e3a765] hover:bg-[#e3a765]/90"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                {(createProductMutation.isPending || updateProductMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editProduct ? 'Guardar cambios' : 'Crear producto'}
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
              Esta acción no se puede deshacer. El producto{' '}
              <span className="font-medium">{productToDelete?.name}</span> será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => productToDelete && deleteProductMutation.mutate(productToDelete.id)}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
