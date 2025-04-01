import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, Search, Plus, MoreVertical, Edit, Trash, Filter, ArrowUpDown, PlusCircle, List, Grid, Package, Settings } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatCurrency } from "@/lib/utils";
import { SkeletonCards } from "@/components/skeleton-cards";
import { DashboardTitle } from "@/components/dashboard/title";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";


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
  createdAt: string;
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: 'sorrentinos',
    imageUrl: '/images/placeholder.jpg', // Updated imageUrl
    isVegetarian: false,
    isFeatured: false,
    active: true,
    unitSize: '',
    stock: 0
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [minStockThreshold, setMinStockThreshold] = useState(5);
  const [showDisabled, setShowDisabled] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Error fetching products");
      }
      return response.json();
    },
  });

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
        description: "El producto ha sido creado correctamente",
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Product> }) => {
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
    onSuccess: (data) => {
      // Actualizar inmediatamente el caché con el nuevo dato sin esperar recargar
      queryClient.setQueryData(['products'], (oldData: Product[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(product => 
          product.id === currentProductId ? { ...product, ...data } : product
        );
      });

      // También invalidar la consulta para refrescar en segundo plano
      queryClient.invalidateQueries({ queryKey: ['products'] });

      setIsEditDialogOpen(false);
      resetForm();
      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado correctamente",
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

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error deleting product");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteProductId(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el producto.",
      });
    },
  });

  const filteredProducts = products?.filter((product) => {
    // Si showDisabled está activo, mostrar todos los productos
    // Si no, mostrar solo los activos
    if (!showDisabled && !product.active) {
      return false;
    }

    // Aplicar filtro de búsqueda si existe
    if (searchTerm) {
      return (
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return true;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'sorrentinos',
      imageUrl: '/images/placeholder.jpg', // Updated imageUrl
      isVegetarian: false,
      isFeatured: false,
      active: true,
      unitSize: '',
      stock: 0
    });
    setCurrentProductId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'price' || name === 'stock') {
      // Ensure price is a number
      const numValue = parseInt(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

    const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleUpdateProduct = () => {
    if (currentProductId) {
      console.log("Editando producto ID:", currentProductId, "con datos:", formData);
      updateMutation.mutate({ id: currentProductId, data: formData });
    }
  };


  const handleDeleteProduct = () => {
    if (deleteProductId) {
      deleteProductMutation.mutate(deleteProductId);
    }
  };

  // Use state para manejar correctamente el ID del producto actual
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);

  const openEditDialog = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      isVegetarian: product.isVegetarian,
      isFeatured: product.isFeatured,
      active: product.active,
      unitSize: product.unitSize,
      stock: product.stock
    });
    setCurrentProductId(product.id); // Usar setState para actualizar el ID
    setIsEditDialogOpen(true);
  };



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto py-6"
    >
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardTitle
        title="Productos"
        description="Gestiona los productos disponibles para la venta"
        icon={<Package className="h-6 w-6 text-[#e3a765]" />}
      />

      <div className="grid gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0">
            <CardTitle className="text-xl">Catálogo de productos</CardTitle>
            <div className="ml-auto flex space-x-2">
              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-[#e3a765] hover:bg-[#e3a765]/90 text-white ml-auto flex items-center"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nuevo Producto
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Configuración de Productos</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="minStock">Alerta de Stock Mínimo</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            id="minStock"
                            type="number"
                            value={minStockThreshold}
                            onChange={(e) => setMinStockThreshold(parseInt(e.target.value) || 0)}
                            min="0"
                          />
                          <span className="text-sm text-gray-500">unidades</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showDisabled">Mostrar productos deshabilitados</Label>
                        <Switch
                          id="showDisabled"
                          checked={showDisabled}
                          onCheckedChange={setShowDisabled}
                        />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <Search className="mr-2 h-4 w-4 text-[#5d6d7c]" />
                <Input
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => value && setViewMode(value as "grid" | "list")}
                className="border rounded-md"
              >
                <ToggleGroupItem value="grid" aria-label="Ver como cuadrícula">
                  <Grid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="Ver como lista">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {isLoading ? (
              <SkeletonCards count={8} />
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts?.map((product) => (
                  <motion.div
                    key={product.id}
                    className={`bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow ${!product.active ? 'opacity-50 grayscale' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="aspect-square relative bg-gray-100">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="h-12 w-12" />
                        </div>
                      )}
                      {product.stock <= minStockThreshold && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          ¡Poco stock!
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg">{product.name}</h3>
                      <p className="text-[#5d6d7c] text-sm line-clamp-2 h-10">
                        {product.description || "Sin descripción"}
                      </p>
                      <div className="mt-2 flex items-center text-sm">
                        <span className="text-[#5d6d7c]">Stock:</span>
                        <span className="font-medium ml-1">{product.stock} unidades</span>
                      </div>
                      <div className="mt-1 flex items-center text-sm">
                        <span className="text-[#5d6d7c]">Categoría:</span>
                        <span className="font-medium ml-1">{product.category || "Sin categoría"}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[#e3a765] font-bold text-lg">
                          {formatCurrency(product.price)}
                        </span>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4 text-[#5d6d7c]" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 hover:text-red-500 hover:border-red-500"
                            onClick={() => setDeleteProductId(product.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts?.map((product) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ opacity: product.active ? 1 : 0.5 }}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-md bg-gray-100 mr-3 flex items-center justify-center">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              ) : (
                                <Package className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            {product.name}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{product.description || "-"}</TableCell>
                        <TableCell>{product.category || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={product.stock <= minStockThreshold ? "text-red-500 font-medium" : ""}>
                              {product.stock}
                            </span>
                            {product.stock <= minStockThreshold && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                ¡Poco stock!
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-[#e3a765]">
                          {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit className="h-4 w-4 text-[#5d6d7c]" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 hover:text-red-500 hover:border-red-500"
                              onClick={() => setDeleteProductId(product.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteProductId} onOpenChange={(open) => !open && setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteProductMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Product Dialog */}
      <AlertDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Agregar producto</AlertDialogTitle>
            <AlertDialogDescription>Completa el formulario para agregar un nuevo producto.</AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="name">Nombre:</label>
                <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required />
              </div>
              <div>
                <label htmlFor="description">Descripción:</label>
                <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price">Precio:</label>
                  <Input id="price" name="price" type="number" value={formData.price || ''} onChange={handleInputChange} required />
                </div>
                <div>
                  <label htmlFor="stock">Stock:</label>
                  <Input
                    type="number"
                    id="stock"
                    placeholder="Stock disponible"
                    value={formData.stock}
                    onChange={(e) => {
                      const newStock = parseInt(e.target.value) || 0;
                      setFormData({ ...formData, stock: newStock });
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category">Categoría:</label>
                  <Select name="category" value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger id="category"><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sorrentinos">Sorrentinos</SelectItem>
                      <SelectItem value="ravioles">Ravioles</SelectItem>
                      <SelectItem value="fideos">Fideos</SelectItem>
                      <SelectItem value="salsas">Salsas</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="unitSize">Tamaño de unidad:</label>
                  <Input id="unitSize" name="unitSize" placeholder="Ej: 12 unid." value={formData.unitSize || ''} onChange={handleInputChange} required />
                </div>
              </div>
              <div>
                <label htmlFor="imageUrl">URL de imagen (opcional):</label>
                <Input id="imageUrl" name="imageUrl" value={formData.imageUrl || ''} onChange={handleInputChange} />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch id="isVegetarian" checked={formData.isVegetarian} onCheckedChange={(checked) => handleSwitchChange('isVegetarian', checked)} />
                  <label htmlFor="isVegetarian">Vegetariano</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="isFeatured" checked={formData.isFeatured} onCheckedChange={(checked) => handleSwitchChange('isFeatured', checked)} />
                  <label htmlFor="isFeatured">Destacado</label>
                </div>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>Cancelar</AlertDialogCancel>
              <AlertDialogAction type="submit" className="bg-[#e3a765] hover:bg-[#e3a765]/90" disabled={createMutation.isPending}>
                {createMutation.isPending && <span className="animate-spin mr-2">...</span>} Agregar Producto
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>


      {/* Edit Product Dialog */}
      <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Editar producto</AlertDialogTitle>
            <AlertDialogDescription>Modifica los detalles del producto.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-name">Nombre:</label>
              <Input id="edit-name" name="name" value={formData.name || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <label htmlFor="edit-description">Descripción:</label>
              <Textarea id="edit-description" name="description" value={formData.description || ''} onChange={handleInputChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-price">Precio:</label>
                <Input id="edit-price" name="price" type="number" value={formData.price || ''} onChange={handleInputChange} required />
              </div>
              <div>
                <label htmlFor="edit-stock">Stock:</label>
                <Input
                  type="number"
                  id="edit-stock"
                  placeholder="Stock disponible"
                  value={formData.stock}
                  onChange={(e) => {
                    const newStock = parseInt(e.target.value) || 0;
                    setFormData({ ...formData, stock: newStock });
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-category">Categoría:</label>
                <Select name="category" value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="edit-category"><SelectValue placeholder="Selecciona" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sorrentinos">Sorrentinos</SelectItem>
                    <SelectItem value="ravioles">Ravioles</SelectItem>
                    <SelectItem value="fideos">Fideos</SelectItem>
                    <SelectItem value="salsas">Salsas</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="edit-unitSize">Tamaño de unidad:</label>
                <Input id="edit-unitSize" name="unitSize" placeholder="Ej: 12 unid." value={formData.unitSize || ''} onChange={handleInputChange} required />
              </div>
            </div>
            <div>
              <label htmlFor="edit-imageUrl">URL de imagen (opcional):</label>
              <Input id="edit-imageUrl" name="imageUrl" value={formData.imageUrl || ''} onChange={handleInputChange} />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch id="edit-isVegetarian" checked={formData.isVegetarian} onCheckedChange={(checked) => handleSwitchChange('isVegetarian', checked)} />
                <label htmlFor="edit-isVegetarian">Vegetariano</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="edit-isFeatured" checked={formData.isFeatured} onCheckedChange={(checked) => handleSwitchChange('isFeatured', checked)} />
                <label htmlFor="edit-isFeatured">Destacado</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="edit-active" checked={formData.active} onCheckedChange={(checked) => handleSwitchChange('active', checked)} />
                <label htmlFor="edit-active">Activo</label>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateProduct} className="bg-[#e3a765] hover:bg-[#e3a765]/90" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <span className="animate-spin mr-2">...</span>} Guardar Cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </motion.div>
  );
}