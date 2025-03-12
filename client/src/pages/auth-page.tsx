import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "El usuario es requerido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});

// Register schema
const registerSchema = z.object({
  username: z.string().min(3, { message: "El usuario debe tener al menos 3 caracteres" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
    },
  });

  // Handle login submission
  function onLoginSubmit(values: LoginValues) {
    loginMutation.mutate(values);
  }

  // Handle registration submission
  function onRegisterSubmit(values: RegisterValues) {
    registerMutation.mutate(values);
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f2efe2]">
        <Loader2 className="h-8 w-8 animate-spin text-[#e3a765]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f2efe2]">
      {/* Left side - Auth form */}
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-8">
            <Logo width={120} height={64} />
          </div>
          
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-[#5d6d7c] font-['Playfair_Display']">
                Bienvenido a Le Unique
              </CardTitle>
              <CardDescription className="text-center text-[#5d6d7c]/80">
                {activeTab === "login" 
                  ? "Accede a tu cuenta para gestionar tus productos y pedidos" 
                  : "Crea una nueva cuenta para gestionar tus productos y pedidos"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="login" className="data-[state=active]:bg-[#e3a765] data-[state=active]:text-white">
                    Iniciar sesión
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-[#e3a765] data-[state=active]:text-white">
                    Registrarse
                  </TabsTrigger>
                </TabsList>
                
                {/* Login Form */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#5d6d7c]">Usuario</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ingresa tu usuario" 
                                {...field} 
                                className="border-[#5d6d7c]/20 focus:border-[#e3a765]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#5d6d7c]">Contraseña</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Ingresa tu contraseña"
                                  {...field}
                                  className="border-[#5d6d7c]/20 focus:border-[#e3a765] pr-10"
                                />
                              </FormControl>
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5d6d7c]"
                                onClick={togglePasswordVisibility}
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-[#e3a765] hover:bg-[#e3a765]/90 text-white"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Iniciando sesión...
                          </>
                        ) : (
                          "Iniciar sesión"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Register Form */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#5d6d7c]">Nombre completo</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ingresa tu nombre completo" 
                                {...field} 
                                className="border-[#5d6d7c]/20 focus:border-[#e3a765]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#5d6d7c]">Usuario</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Crea un nombre de usuario" 
                                {...field} 
                                className="border-[#5d6d7c]/20 focus:border-[#e3a765]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#5d6d7c]">Contraseña</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Crea una contraseña segura"
                                  {...field}
                                  className="border-[#5d6d7c]/20 focus:border-[#e3a765] pr-10"
                                />
                              </FormControl>
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5d6d7c]"
                                onClick={togglePasswordVisibility}
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-[#e3a765] hover:bg-[#e3a765]/90 text-white"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creando cuenta...
                          </>
                        ) : (
                          "Crear cuenta"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <Button variant="link" asChild className="text-[#5d6d7c]">
                <a href="/">Volver al sitio web</a>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
      
      {/* Right side - Hero image */}
      <div className="hidden md:block md:w-1/2 bg-[#5d6d7c] p-12 flex items-center">
        <motion.div 
          className="max-w-lg mx-auto text-white"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-6">
            <h2 className="text-4xl font-bold mb-6 font-['Playfair_Display']">Panel de Administración</h2>
            <p className="text-lg mb-8 text-white/80">
              Gestiona tus productos, ventas, clientes y más desde un solo lugar.
              Mantén el control total de tu negocio con nuestro sistema intuitivo.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-[#e3a765] p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Control de Inventario</h3>
                  <p className="text-white/70 text-sm">Gestiona los productos y su disponibilidad</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-[#e3a765] p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Gestión de Vendedores</h3>
                  <p className="text-white/70 text-sm">Administra a los miembros de tu equipo</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-[#e3a765] p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Seguimiento de Pedidos</h3>
                  <p className="text-white/70 text-sm">Visualiza y procesa órdenes en tiempo real</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-[#e3a765] p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Comunicación con Clientes</h3>
                  <p className="text-white/70 text-sm">Chatea y mantén registro de conversaciones</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-white/60 text-sm">
              "Nuestra plataforma de administración nos ha permitido optimizar procesos y aumentar nuestras ventas en un 35% durante el último año."
            </p>
            <div className="flex items-center mt-4">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full bg-[#e3a765] flex items-center justify-center text-white font-medium">
                  MG
                </div>
              </div>
              <div>
                <h4 className="text-white font-medium">Martina González</h4>
                <p className="text-white/60 text-sm">Fundadora, Le Unique</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
