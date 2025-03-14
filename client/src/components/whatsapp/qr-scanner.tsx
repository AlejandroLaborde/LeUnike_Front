
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function WhatsAppQRScanner() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("loading");
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  
  const fetchQrCode = async () => {
    
    setStatus("loading");
    try {
      // Conectar a la API local en localhost:3000
      const response = await fetch("http://localhost:3000/api/qr");
      if (response.ok) {
        console.log(response);
        const data = await response.json();
        console.log(data.qr);
        setQrCode(data.qr);
        setStatus("success");
        toast({
            title: "QR actualizado",
            description: "El código QR ha sido actualizado correctamente",
          });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
      setStatus("error");
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/status");
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.message);
      }
    } catch (error) {
     setIsConnected(false);
      console.error("Error checking connection status:", error);
    }
  };

  useEffect(() => {
    fetchQrCode();
    checkConnectionStatus();
    
    // Verificar estado de conexión cada 10 segundos
    const statusInterval = setInterval(checkConnectionStatus, 10000);
    
    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  return (
    
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-sm font-medium">
          {isConnected ? "Conectado a WhatsApp" : "Desconectado de WhatsApp"}
        </span>
      </div>
      
      {!isConnected && (
        <div className="border rounded-lg p-6 max-w-md w-full flex flex-col items-center space-y-4">
          {status === "loading" ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin">
              </div>
              <p>Cargando código QR...</p>
            </div>
          ) : (
            <>
              {qrCode && (
                <div className="flex flex-col items-center space-y-4">
                  <img 
                    src={`${qrCode}`} 
                    alt="WhatsApp QR Code" 
                    className="w-64 h-64"
                  />
                  <p className="text-center text-sm text-gray-600">
                    Escanea este código con tu teléfono para conectar WhatsApp Web
                  </p>
                </div>
              )}
            </>
          )}
          
          <Button onClick={fetchQrCode} className="mt-4">
            
            Actualizar código QR
          </Button>
          
        </div>
      )}
    </div>
  );
}
