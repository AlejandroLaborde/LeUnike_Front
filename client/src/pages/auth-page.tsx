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
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "El usuario es requerido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();
  const { user, isLoading, loginMutation } = useAuth();

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

  // Handle login submission
  function onLoginSubmit(values: LoginValues) {
    loginMutation.mutate(values);
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
                Accede a tu cuenta para gestionar tus productos y pedidos
              </CardDescription>
            </CardHeader>

            <CardContent>
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-[#5d6d7c]" />
                            ) : (
                              <Eye className="h-4 w-4 text-[#5d6d7c]" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-[#e3a765] hover:bg-[#d19655] text-white font-medium"
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
            </CardContent>

            <CardFooter className="flex justify-center">
              <Button 
                variant="link" 
                className="text-[#5d6d7c] hover:text-[#e3a765]"
                onClick={() => navigate("/")}
              >
                Volver al sitio web
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Right side - Information */}
      <div className="hidden md:flex md:w-1/2 bg-[#5d6d7c] text-white p-12 flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-4 font-['Playfair_Display']">Panel de Administración</h2>
          <p className="mb-8 text-white/80">
            Gestiona tus productos, ventas, clientes y más desde un solo lugar. Mantén el control total de tu negocio con nuestro sistema intuitivo.
          </p>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="mr-4 bg-[#e3a765] rounded-full p-2 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Control de Inventario</h3>
                <p className="text-white/70 text-sm">Gestiona tus productos y su disponibilidad</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 bg-[#e3a765] rounded-full p-2 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Gestión de Vendedores</h3>
                <p className="text-white/70 text-sm">Administra a los miembros de tu equipo</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 bg-[#e3a765] rounded-full p-2 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Seguimiento de Pedidos</h3>
                <p className="text-white/70 text-sm">Visualiza y procesa órdenes en tiempo real</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 bg-[#e3a765] rounded-full p-2 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Comunicación con Clientes</h3>
                <p className="text-white/70 text-sm">Chatea y mantén registros de conversaciones</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-white/70 italic mb-4">
              "Nuestra plataforma de administración nos ha permitido optimizar procesos y aumentar nuestras ventas en un 35% durante el último año."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#e3a765] flex items-center justify-center text-white font-bold mr-3">
                MG
              </div>
              <div>
                <p className="font-semibold">Martina González</p>
                <p className="text-white/70 text-sm">Fundadora, Le Unique</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}