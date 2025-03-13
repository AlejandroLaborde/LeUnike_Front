import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertContactMessageSchema, insertUserSchema, insertProductSchema, insertClientSchema, insertChatSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  const { isAuthenticated, isAdmin, isSuperAdmin } = setupAuth(app);

  // Initialize default super admin user
  try {
    const existingAdmin = await storage.getUserByUsername("Admin");
    if (!existingAdmin) {
      const adminUser = await storage.createUser({
        username: "Admin",
        password: "Admin", // Will be hashed in createUser
        name: "Super Administrador",
        role: "super_admin",
        active: true
      });
      console.log("Default super admin user created:", adminUser.id);
    } else {
      console.log("Admin user already exists:", existingAdmin.id);
    }
  } catch (error) {
    console.error("Error creating default admin user:", error);
  }

  // Public API routes

  // Contact form submission
  app.post("/api/contact", async (req, res, next) => {
    try {
      const contactData = insertContactMessageSchema.parse(req.body);
      const newContact = await storage.createContactMessage(contactData);

      // If newsletter opt-in is true, also add to newsletter subscription
      if (contactData.newsletterOptIn) {
        await storage.addNewsletterSubscription({
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone
        });
      }

      res.status(201).json(newContact);
    } catch (error) {
      next(error);
    }
  });

  // Dashboard API routes

  // Users/Vendors routes
  app.get("/api/users", isAuthenticated, isAdmin, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      console.log("Retrieved all users:", users.length, users); // Logging para depuración
      // Make sure we're returning a valid JSON array
      return res.status(200).json(users || []);
    } catch (error) {
      console.error("Error getting all users:", error);
      return res.status(500).json({ message: "Error al obtener usuarios", error: (error as Error).message });
    }
  });

  app.post("/api/users", isAuthenticated, isSuperAdmin, async (req, res, next) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/users/:id", isAuthenticated, isSuperAdmin, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(userId, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/users/:id", isAuthenticated, isSuperAdmin, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      const deleted = await storage.deleteUser(userId); // Assuming deleteUser function exists in storage
      if (!deleted) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.status(200).json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  });

  // Get only vendor users (for client assignment)
  app.get("/api/users/vendors", isAuthenticated, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      const vendors = users.filter(user => user.role === 'vendor' && user.active);
      console.log("Retrieved vendors:", vendors); // Logging para depuración
      res.json(vendors);
    } catch (error) {
      console.error("Error getting vendors:", error);
      next(error);
    }
  });

  // Products routes
  app.get("/api/products", isAuthenticated, async (req, res, next) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/products", isAuthenticated, isAdmin, async (req, res, next) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/products/:id", isAuthenticated, isAdmin, async (req, res, next) => {
    try {
      const productId = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(productId, productData);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.json(updatedProduct);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/products/:id", isAuthenticated, isAdmin, async (req, res, next) => {
    try {
      const productId = parseInt(req.params.id);
      // Set product as inactive instead of deleting
      const deactivated = await storage.updateProduct(productId, { active: false });
      if (!deactivated) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.json({ message: "Producto desactivado correctamente" });
    } catch (error) {
      next(error);
    }
  });

  // Clients routes
  app.get("/api/clients", isAuthenticated, async (req, res, next) => {
    try {
      const isAdminUser = req.user?.role === "admin" || req.user?.role === "super_admin";
      const clients = isAdminUser 
        ? await storage.getAllClients()
        : await storage.getClientsByVendorId(req.user?.id || 0);

      res.json(clients);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/clients", isAuthenticated, async (req, res, next) => {
    try {
      const isAdminUser = req.user?.role === "admin" || req.user?.role === "super_admin";

      // If user is admin/super_admin, use the vendorId from the request
      // Otherwise, set the vendorId to the current user's ID
      const clientData = insertClientSchema.parse({
        ...req.body,
        vendorId: isAdminUser && req.body.vendorId 
          ? parseInt(req.body.vendorId) 
          : req.user?.id
      });

      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/clients/:id", isAuthenticated, async (req, res, next) => {
    try {
      const clientId = parseInt(req.params.id);
      const isAdminUser = req.user?.role === "admin" || req.user?.role === "super_admin";

      // Check if vendor owns this client
      if (!isAdminUser) {
        const client = await storage.getClient(clientId);
        if (!client || client.vendorId !== req.user?.id) {
          return res.status(403).json({ message: "No tienes permiso para modificar este cliente" });
        }
      }

      // Process vendorId - only admins can change it
      const dataToUpdate = { ...req.body };
      if (isAdminUser && dataToUpdate.vendorId) {
        dataToUpdate.vendorId = parseInt(dataToUpdate.vendorId);
      } else if (!isAdminUser) {
        // Non-admins cannot change vendorId
        delete dataToUpdate.vendorId;
      }

      const clientData = insertClientSchema.partial().parse(dataToUpdate);
      const updatedClient = await storage.updateClient(clientId, clientData);
      if (!updatedClient) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }
      res.json(updatedClient);
    } catch (error) {
      next(error);
    }
  });

  // Chats routes
  app.get("/api/chats/:clientId", isAuthenticated, async (req, res, next) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const isAdminUser = req.user?.role === "admin" || req.user?.role === "super_admin";

      // Check if vendor has access to this client's chats
      if (!isAdminUser) {
        const client = await storage.getClient(clientId);
        if (!client || client.vendorId !== req.user?.id) {
          return res.status(403).json({ message: "No tienes permiso para ver estos chats" });
        }
      }

      const chats = await storage.getChatsByClientId(clientId);
      res.json(chats);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/chats", isAuthenticated, async (req, res, next) => {
    try {
      const chatData = insertChatSchema.parse(req.body);
      const isAdminUser = req.user?.role === "admin" || req.user?.role === "super_admin";

      // Check if vendor has access to send messages to this client
      if (!isAdminUser) {
        const client = await storage.getClient(chatData.clientId);
        if (!client || client.vendorId !== req.user?.id) {
          return res.status(403).json({ message: "No tienes permiso para enviar mensajes a este cliente" });
        }
      }

      const chat = await storage.createChat(chatData);
      res.status(201).json(chat);
    } catch (error) {
      next(error);
    }
  });

  // Orders routes
  app.get("/api/orders", isAuthenticated, async (req, res, next) => {
    try {
      const isAdminUser = req.user?.role === "admin" || req.user?.role === "super_admin";
      let orders = isAdminUser 
        ? await storage.getAllOrders()
        : await storage.getOrdersByVendorId(req.user?.id || 0);

      // If admin, include vendor name for each order
      if (isAdminUser && orders.length > 0) {
        const users = await storage.getAllUsers();

        // Add vendor name to each order
        orders = orders.map(order => {
          const vendor = users.find(user => user.id === order.vendorId);
          return {
            ...order,
            vendorName: vendor ? vendor.name : null
          };
        });
      }

      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res, next) => {
    try {
      const { items, ...orderData } = req.body;
      const parsedOrderData = insertOrderSchema.parse({
        ...orderData,
        vendorId: req.user?.id
      });

      // Check if vendor has access to create orders for this client
      if (req.user?.role === "vendor") {
        const client = await storage.getClient(parsedOrderData.clientId);
        if (!client || client.vendorId !== req.user?.id) {
          return res.status(403).json({ message: "No tienes permiso para crear órdenes para este cliente" });
        }
      }

      // Verificar stock disponible para cada producto
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Producto con ID ${item.productId} no encontrado` });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            message: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}` 
          });
        }
      }

      // Create order with items and actualizar stock
      const order = await storage.createOrderWithItems(parsedOrderData, items);

      // Actualizar stock de cada producto
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          await storage.updateProduct(item.productId, { 
            stock: product.stock - item.quantity 
          });
        }
      }

      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/orders/:id", isAuthenticated, isAdmin, async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.id);
      const orderData = insertOrderSchema.partial().parse(req.body);
      const updatedOrder = await storage.updateOrder(orderId, orderData);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Pedido no encontrado" });
      }
      res.json(updatedOrder);
    } catch (error) {
      next(error);
    }
  });

  // Nota: La ruta /api/register ya está definida en setupAuth

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}