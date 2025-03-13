import { 
  users, clients, products, chats, orders, orderItems, contactMessages, newsletterSubscriptions,
  type User, type InsertUser, type Product, type InsertProduct,
  type Client, type InsertClient, type Chat, type InsertChat,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type ContactMessage, type InsertContactMessage, type NewsletterSubscription, type InsertNewsletterSubscription
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const scryptAsync = promisify(scrypt);
const MemoryStore = createMemoryStore(session);

// Path to the data file
const DATA_FILE = path.join(__dirname, 'data.json');

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  
  // Client methods
  getClient(id: number): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  getClientsByVendorId(vendorId: number): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  
  // Chat methods
  getChat(id: number): Promise<Chat | undefined>;
  getChatsByClientId(clientId: number): Promise<Chat[]>;
  createChat(chat: InsertChat): Promise<Chat>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByVendorId(vendorId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  createOrderWithItems(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  
  // Contact methods
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  
  // Newsletter methods
  addNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private productsMap: Map<number, Product>;
  private clientsMap: Map<number, Client>;
  private chatsMap: Map<number, Chat>;
  private ordersMap: Map<number, Order>;
  private orderItemsMap: Map<number, OrderItem>;
  private contactMessagesMap: Map<number, ContactMessage>;
  private newsletterSubscriptionsMap: Map<number, NewsletterSubscription>;
  private userIdCounter: number;
  private productIdCounter: number;
  private clientIdCounter: number;
  private chatIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  private contactMessageIdCounter: number;
  private newsletterSubscriptionIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.usersMap = new Map();
    this.productsMap = new Map();
    this.clientsMap = new Map();
    this.chatsMap = new Map();
    this.ordersMap = new Map();
    this.orderItemsMap = new Map();
    this.contactMessagesMap = new Map();
    this.newsletterSubscriptionsMap = new Map();
    
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.clientIdCounter = 1;
    this.chatIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.contactMessageIdCounter = 1;
    this.newsletterSubscriptionIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Load data from file if it exists
    this.loadDataFromFile();
  }
  
  // Load data from JSON file
  private loadDataFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        
        // Load users
        if (data.users && Array.isArray(data.users)) {
          data.users.forEach(user => {
            this.usersMap.set(user.id, user);
            this.userIdCounter = Math.max(this.userIdCounter, user.id + 1);
          });
        }
        
        // Load products
        if (data.products && Array.isArray(data.products)) {
          data.products.forEach(product => {
            this.productsMap.set(product.id, product);
            this.productIdCounter = Math.max(this.productIdCounter, product.id + 1);
          });
        }
        
        // Load clients
        if (data.clients && Array.isArray(data.clients)) {
          data.clients.forEach(client => {
            this.clientsMap.set(client.id, client);
            this.clientIdCounter = Math.max(this.clientIdCounter, client.id + 1);
          });
        }
        
        // Load chats
        if (data.chats && Array.isArray(data.chats)) {
          data.chats.forEach(chat => {
            this.chatsMap.set(chat.id, chat);
            this.chatIdCounter = Math.max(this.chatIdCounter, chat.id + 1);
          });
        }
        
        // Load orders
        if (data.orders && Array.isArray(data.orders)) {
          data.orders.forEach(order => {
            this.ordersMap.set(order.id, order);
            this.orderIdCounter = Math.max(this.orderIdCounter, order.id + 1);
          });
        }
        
        // Load order items
        if (data.orderItems && Array.isArray(data.orderItems)) {
          data.orderItems.forEach(item => {
            this.orderItemsMap.set(item.id, item);
            this.orderItemIdCounter = Math.max(this.orderItemIdCounter, item.id + 1);
          });
        }
        
        // Load contact messages
        if (data.contactMessages && Array.isArray(data.contactMessages)) {
          data.contactMessages.forEach(message => {
            this.contactMessagesMap.set(message.id, message);
            this.contactMessageIdCounter = Math.max(this.contactMessageIdCounter, message.id + 1);
          });
        }
        
        // Load newsletter subscriptions
        if (data.newsletterSubscriptions && Array.isArray(data.newsletterSubscriptions)) {
          data.newsletterSubscriptions.forEach(subscription => {
            this.newsletterSubscriptionsMap.set(subscription.id, subscription);
            this.newsletterSubscriptionIdCounter = Math.max(
              this.newsletterSubscriptionIdCounter, subscription.id + 1
            );
          });
        }
        
        console.log("Data loaded successfully from file");
      } else {
        // If file doesn't exist, initialize with sample data
        this.initializeSampleData();
        this.saveDataToFile(); // Save initial data
      }
    } catch (error) {
      console.error("Error loading data from file:", error);
      // Initialize with sample data if there's an error
      this.initializeSampleData();
    }
  }
  
  // Save data to JSON file
  private saveDataToFile() {
    try {
      const data = {
        users: Array.from(this.usersMap.values()),
        products: Array.from(this.productsMap.values()),
        clients: Array.from(this.clientsMap.values()),
        chats: Array.from(this.chatsMap.values()),
        orders: Array.from(this.ordersMap.values()),
        orderItems: Array.from(this.orderItemsMap.values()),
        contactMessages: Array.from(this.contactMessagesMap.values()),
        newsletterSubscriptions: Array.from(this.newsletterSubscriptionsMap.values())
      };
      
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
      console.log("Data saved successfully to file");
    } catch (error) {
      console.error("Error saving data to file:", error);
    }
  }

  // Private helper method to hash passwords
  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  // Initialize sample data for development
  private async initializeSampleData() {
    // Create sample users
    const userSamples: InsertUser[] = [
      {
        username: "Admin",
        password: "Admin",
        name: "Super Administrador",
        role: "super_admin",
        active: true
      },
      {
        username: "admin_pasta",
        password: "password123",
        name: "Administrador Pastas",
        role: "admin",
        active: true
      },
      {
        username: "vendor1",
        password: "password123",
        name: "Laura Méndez",
        role: "vendor",
        active: true
      },
      {
        username: "vendor2",
        password: "password123",
        name: "Jorge Pérez",
        role: "vendor",
        active: true
      },
      {
        username: "vendor3",
        password: "password123",
        name: "María García",
        role: "vendor",
        active: true
      },
      {
        username: "inactive_vendor",
        password: "password123",
        name: "Diego Martínez",
        role: "vendor",
        active: false
      }
    ];

    for (const user of userSamples) {
      await this.createUser(user);
    }
    
    // Create sample products
    const productSamples: InsertProduct[] = [
      {
        name: "Sorrentinos de Queso y Jamón",
        description: "Deliciosos sorrentinos con relleno de queso mozzarella, jamón y hierbas.",
        price: 1800,
        category: "sorrentinos",
        imageUrl: "https://images.unsplash.com/photo-1587655424229-130916450ca4",
        isVegetarian: false,
        isFeatured: true,
        active: true,
        unitSize: "12 unid.",
        stock: 100
      },
      {
        name: "Sorrentinos de Ricota y Espinaca",
        description: "Masa verde rellena de ricota cremosa con espinaca salteada.",
        price: 1700,
        category: "sorrentinos",
        imageUrl: "https://images.unsplash.com/photo-1622973536968-3ead9e780960",
        isVegetarian: true,
        isFeatured: false,
        active: true,
        unitSize: "12 unid.",
        stock: 80
      },
      {
        name: "Ravioles de Carne",
        description: "Ravioles tradicionales rellenos de carne braseada con verduras.",
        price: 1900,
        category: "ravioles",
        imageUrl: "https://images.unsplash.com/photo-1611270629569-8b357cb88da9",
        isVegetarian: false,
        isFeatured: false,
        active: true,
        unitSize: "24 unid.",
        stock: 120
      }
    ];

    for (const product of productSamples) {
      await this.createProduct(product);
    }
    
    // Create sample clients
    const clientSamples: InsertClient[] = [
      {
        name: "Martín Gómez",
        email: "martin@example.com",
        phone: "11-2345-6789",
        address: "Av. Corrientes 1234, CABA",
        vendorId: 3 // Laura Méndez
      },
      {
        name: "Carolina Sánchez",
        email: "carolina@example.com",
        phone: "11-5678-1234",
        address: "Av. Santa Fe 567, CABA",
        vendorId: 4 // Jorge Pérez
      },
      {
        name: "Roberto Álvarez",
        email: "roberto@example.com",
        phone: "11-8765-4321",
        address: "Av. Cabildo 890, CABA",
        vendorId: 3 // Laura Méndez
      }
    ];
    
    for (const client of clientSamples) {
      await this.createClient(client);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    // Hash password if it's not already hashed
    let password = insertUser.password;
    if (!password.includes('.')) {
      password = await this.hashPassword(password);
    }
    
    const user: User = {
      ...insertUser,
      id,
      password,
      createdAt: now
    };
    
    this.usersMap.set(id, user);
    this.saveDataToFile(); // Save changes
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.usersMap.get(id);
    if (!user) return undefined;
    
    // Hash password if it's being updated and not already hashed
    if (userData.password && !userData.password.includes('.')) {
      userData.password = await this.hashPassword(userData.password);
    }
    
    const updatedUser: User = {
      ...user,
      ...userData
    };
    
    this.usersMap.set(id, updatedUser);
    this.saveDataToFile(); // Save changes
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.productsMap.get(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.productsMap.values()).filter(product => product.active);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const now = new Date();
    
    const newProduct: Product = {
      ...product,
      id,
      createdAt: now
    };
    
    this.productsMap.set(id, newProduct);
    this.saveDataToFile(); // Save changes
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.productsMap.get(id);
    if (!product) return undefined;
    
    const updatedProduct: Product = {
      ...product,
      ...productData
    };
    
    this.productsMap.set(id, updatedProduct);
    this.saveDataToFile(); // Save changes
    return updatedProduct;
  }

  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    return this.clientsMap.get(id);
  }

  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clientsMap.values());
  }

  async getClientsByVendorId(vendorId: number): Promise<Client[]> {
    return Array.from(this.clientsMap.values()).filter(
      client => client.vendorId === vendorId
    );
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = this.clientIdCounter++;
    const now = new Date();
    
    const newClient: Client = {
      ...client,
      id,
      createdAt: now
    };
    
    this.clientsMap.set(id, newClient);
    this.saveDataToFile(); // Save changes
    return newClient;
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clientsMap.get(id);
    if (!client) return undefined;
    
    const updatedClient: Client = {
      ...client,
      ...clientData
    };
    
    this.clientsMap.set(id, updatedClient);
    this.saveDataToFile(); // Save changes
    return updatedClient;
  }

  // Chat methods
  async getChat(id: number): Promise<Chat | undefined> {
    return this.chatsMap.get(id);
  }

  async getChatsByClientId(clientId: number): Promise<Chat[]> {
    return Array.from(this.chatsMap.values()).filter(
      chat => chat.clientId === clientId
    );
  }

  async createChat(chat: InsertChat): Promise<Chat> {
    const id = this.chatIdCounter++;
    const now = new Date();
    
    const newChat: Chat = {
      ...chat,
      id,
      createdAt: now
    };
    
    this.chatsMap.set(id, newChat);
    this.saveDataToFile(); // Save changes
    return newChat;
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.ordersMap.get(id);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.ordersMap.values());
  }

  async getOrdersByVendorId(vendorId: number): Promise<Order[]> {
    return Array.from(this.ordersMap.values()).filter(
      order => order.vendorId === vendorId
    );
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    
    const newOrder: Order = {
      ...order,
      id,
      createdAt: now
    };
    
    this.ordersMap.set(id, newOrder);
    this.saveDataToFile(); // Save changes
    return newOrder;
  }

  async updateOrder(id: number, orderData: Partial<InsertOrder>): Promise<Order | undefined> {
    const order = this.ordersMap.get(id);
    if (!order) return undefined;
    
    const updatedOrder: Order = {
      ...order,
      ...orderData
    };
    
    this.ordersMap.set(id, updatedOrder);
    this.saveDataToFile(); // Save changes
    return updatedOrder;
  }

  async createOrderWithItems(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Create the order first
    const newOrder = await this.createOrder(order);
    
    // Create each order item
    for (const item of items) {
      const id = this.orderItemIdCounter++;
      const newItem: OrderItem = {
        ...item,
        id,
        orderId: newOrder.id
      };
      
      this.orderItemsMap.set(id, newItem);
    }
    
    this.saveDataToFile(); // Save changes
    return newOrder;
  }

  // Contact methods
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.contactMessageIdCounter++;
    const now = new Date();
    
    const newMessage: ContactMessage = {
      ...message,
      id,
      createdAt: now
    };
    
    this.contactMessagesMap.set(id, newMessage);
    this.saveDataToFile(); // Save changes
    return newMessage;
  }

  // Newsletter methods
  async addNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const id = this.newsletterSubscriptionIdCounter++;
    const now = new Date();
    
    const newSubscription: NewsletterSubscription = {
      ...subscription,
      id,
      createdAt: now
    };
    
    this.newsletterSubscriptionsMap.set(id, newSubscription);
    this.saveDataToFile(); // Save changes
    return newSubscription;
  }
}

export const storage = new MemStorage();
