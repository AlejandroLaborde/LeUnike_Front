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

const scryptAsync = promisify(scrypt);
const MemoryStore = createMemoryStore(session);

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
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // Private helper method to hash passwords
  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  // Initialize sample data for development
  private async initializeSampleData() {
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
        unitSize: "12 unid."
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
        unitSize: "12 unid."
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
        unitSize: "24 unid."
      }
    ];

    for (const product of productSamples) {
      await this.createProduct(product);
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
    return newSubscription;
  }
}

export const storage = new MemStorage();
