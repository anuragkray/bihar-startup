import { Document } from 'mongoose';

// Address Interface
export interface IAddress {
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

// Cart Item Interface
export interface ICartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  addedAt: Date;
}

// Order/Purchase History Interface
export interface IPurchaseHistory {
  orderId: string;
  products: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  orderDate: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: IAddress;
  paymentMethod?: string;
  trackingNumber?: string;
}

// User Interface
export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string; // Optional for now, will be used later with authentication
  profilePhoto?: string;
  role: 'customer' | 'admin' | 'vendor';
  addresses: IAddress[];
  cart: ICartItem[];
  purchaseHistory: IPurchaseHistory[];
  wishlist: string[]; // Array of product IDs
  refreshToken?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Request Body Types
export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role?: 'customer' | 'admin' | 'vendor';
  address?: IAddress;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  profilePhoto?: string;
  addresses?: IAddress[];
  role?: 'customer' | 'admin' | 'vendor';
}

export interface AddToCartRequest {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface UpdateCartItemRequest {
  productId: string;
  quantity: number;
}
