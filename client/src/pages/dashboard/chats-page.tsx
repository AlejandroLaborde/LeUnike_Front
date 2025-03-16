import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/use-auth";
import { useToast } from "../../hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { 
  Loader2, 
  MessageSquare,
  Send,
  User,
  ChevronRight,
  Phone,
  ArrowLeft
} from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Badge } from "../../components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useLocation } from "wouter";

import { Switch } from "../../components/ui/switch"; // Importamos el switch

type Client = {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  vendorId: number | null;
};

type Chat = {
  id: number;
  clientId: number;
  message: string;
  fromClient: boolean;
  createdAt: string;
};

export default function ChatsPage() {
  // Estado para controlar si el bot está activado para el cliente seleccionado
  const [isBotEnabled, setIsBotEnabled] = useState(true); // Por defecto activado
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const searchParams = new URLSearchParams(location.split('?')[1]);
  const initialClientId = searchParams.get('client') 
    ? parseInt(searchParams.get('client') as string) 
    : null;

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [message, setMessage] = useState("");
  const [showClientList, setShowClientList] = useState(!initialClientId);

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/clients');
      return await res.json() as Client[];
    }
  });
  
  // Función para cambiar el estado del bot
  const toggleBot = async () => {
    if (!selectedClient) return;

    const newStatus = !isBotEnabled;
    setIsBotEnabled(newStatus);

    try {
      const response = await fetch(`http://localhost:3000/api/bot-users/${selectedClient.phone}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enableBot: newStatus }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado del bot");
      }
    } catch (error) {
      console.error("Error al actualizar el estado del bot:", error);
      setIsBotEnabled(!newStatus); // Revertir cambio si falla
    }
  };

  const { data: chats, isLoading: isLoadingChats, refetch: refetchChats } = useQuery({
    queryKey: ["/api/messages/conversation", selectedClient?.phone],
    queryFn: async () => {
      if (!selectedClient) return [];
      const res = await fetch(`http://localhost:3000/api/messages/conversation/${selectedClient.phone}`);
      if (!res.ok) throw new Error(`Error al obtener mensajes: ${res.statusText}`);
      const data = await res.json();
      return data.messages;
    },
    enabled: !!selectedClient,
  });

  useEffect(() => {
    if (!selectedClient) return;
    const interval = setInterval(() => {
      refetchChats();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedClient, refetchChats]);

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { clientId: number; message: string }) => {
      if (!selectedClient) return;
      const senderPhone = "5491158100725";
      const receiverPhone = selectedClient.phone;
      if (!receiverPhone) {
        throw new Error("El cliente no tiene un número de teléfono asignado.");
      }
      const payload = {
        from: senderPhone,
        to: receiverPhone,
        body: data.message,
        type: "text",
        deviceType: "mobile"
      };
      const res = await fetch("http://localhost:3000/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorMessage = `Error en la API (${res.status}): ${await res.text()}`;
        throw new Error(errorMessage);
      }
      return await res.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversation", selectedClient?.phone] });
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    onError: (error) => {
      toast({
        title: "Error al enviar el mensaje",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !message.trim()) return;
    
    sendMessageMutation.mutate({
      clientId: selectedClient.id,
      message: message.trim()
    });
  };
  
  const formatMessageTime = (timestamp: string) => {
    if (!timestamp) return "Fecha no disponible"; // Manejo de errores
  
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      console.error("Invalid timestamp:", timestamp);
      return "Fecha inválida";
    }
  
    return format(date, "HH:mm", { locale: es });
  };
  
  const handleBackToClientList = () => {
    setShowClientList(true);
    setSelectedClient(null);
  };
  
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setShowClientList(false);
  };
  
    // Función para obtener las iniciales del nombre del cliente
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Chats</h1>
          <p className="text-[#5d6d7c]">
            {isAdmin 
              ? 'Gestiona las conversaciones con todos los clientes' 
              : 'Gestiona las conversaciones con tus clientes asignados'}
          </p>
        </div>
        
        {!showClientList && selectedClient && (
          <Button 
            variant="outline"
            onClick={handleBackToClientList}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ver todos los clientes
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-4rem)]">
        {/* Client List (Hidden on mobile when a chat is selected) */}
        {(showClientList || !selectedClient) && (
          <motion.div 
            className="md:col-span-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-[#e3a765]" />
                  Clientes
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {isLoadingClients ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#e3a765]" />
                  </div>
                ) : !clients || clients.length === 0 ? (
                  <div className="text-center py-10">
                    <User className="h-10 w-10 text-[#5d6d7c] mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-black mb-1">Sin clientes</h3>
                    <p className="text-[#5d6d7c] text-sm mb-4">
                      {isAdmin 
                        ? "No hay clientes registrados en el sistema." 
                        : "No tienes clientes asignados."}
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/dashboard/clients'}
                    >
                      Ir a Clientes
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[calc(100vh-14rem)]">
                    <div className="space-y-2 pr-4">
                      {clients.map((client, index) => (
                        <motion.div
                          key={client.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Button
                            variant="ghost"
                            className={`w-full justify-start p-3 h-auto ${
                              selectedClient?.id === client.id 
                                ? 'bg-[#e3a765]/10 border-l-4 border-[#e3a765]' 
                                : 'border-l-4 border-transparent'
                            }`}
                            onClick={() => handleSelectClient(client)}
                          >
                            <Avatar className="h-9 w-9 mr-3">
                              <AvatarFallback className="bg-[#e3a765]/20 text-[#e3a765]">
                                {getInitials(client.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex flex-col items-start text-left">
                              <span className="font-medium text-black">{client.name}</span>
                              <span className="text-xs text-[#5d6d7c]">{client.phone}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-[#5d6d7c]" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Chat Area */}
        {selectedClient && (!showClientList || !selectedClient) && (
          <motion.div 
            className="md:col-span-2 h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="pb-2 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden mr-2"
                      onClick={handleBackToClientList}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-9 w-9 mr-3">
                      <AvatarFallback className="bg-[#e3a765]/20 text-[#e3a765]">
                        {getInitials(selectedClient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedClient.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs font-normal bg-green-100 text-green-800 border-0">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                          En línea
                        </Badge>
                        <a 
                          href={`tel:${selectedClient.phone}`}
                          className="text-xs text-[#5d6d7c] hover:text-[#e3a765] flex items-center"
                        >
                          <Phone className="h-3 w-3 mr-1" /> {selectedClient.phone}
                        </a>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Bot activado:</span>
                          <Switch checked={isBotEnabled} onCheckedChange={toggleBot} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              {/* Messages Area */}
              <CardContent className="p-4 overflow-auto flex-grow">
                {isLoadingChats ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-[#e3a765]" />
                  </div>
                ) : !chats || chats.length === 0 ? (
                  <div className="text-center py-10 h-full flex flex-col justify-center">
                    <MessageSquare className="h-10 w-10 text-[#5d6d7c] mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-black mb-1">Sin mensajes</h3>
                    <p className="text-[#5d6d7c] text-sm mb-4">
                      Comienza a chatear con {selectedClient.name} enviando un mensaje.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[calc(100vh-22rem)]">
                    <div className="space-y-4">
                      {chats.map((chat, index) => {
                        const isMyMessage = chat.from=='5491171657922'; // Ajusta según cómo identificas los mensajes enviados

                        return (
                          <div 
                            key={chat.id}
                            className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[80%] rounded-lg p-3 ${
                                isMyMessage 
                                  ? 'bg-[#e3a765] text-white' // Mensajes enviados (derecha)
                                  : 'bg-gray-100 text-black' // Mensajes recibidos (izquierda)
                              }`}
                            >
                              <p className="text-sm">{chat.body}</p>
                              <p className={`text-xs mt-1 text-right ${
                                isMyMessage ? 'text-white/80' : 'text-gray-500'
                              }`}>
                                {formatMessageTime(chat.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                )}
              </CardContent>

              
              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Textarea
                    placeholder={`Escribe un mensaje para ${selectedClient.name}...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="resize-none flex-grow"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="bg-[#e3a765] hover:bg-[#e3a765]/90"
                    disabled={!message.trim() || sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
        
        {/* Empty state when no client is selected on desktop */}
        {!selectedClient && !showClientList && !isLoadingClients && (
          <motion.div 
            className="md:col-span-2 hidden md:flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full flex items-center justify-center">
              <div className="text-center py-10">
                <MessageSquare className="h-16 w-16 text-[#5d6d7c] mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-medium text-black mb-2">Selecciona un cliente</h3>
                <p className="text-[#5d6d7c] max-w-md">
                  Elige un cliente de la lista para ver su historial de conversación o iniciar un nuevo chat.
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
