import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IAddress, ICartItem, IPurchaseHistory } from '@/types/user';

// Address Schema
const AddressSchema = new Schema<IAddress>(
  {
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      required: true,
      default: 'home',
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{6}$/,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// Cart Item Schema
const CartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    weight: {
      type: Number,
      min: 0,
      max: 50,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Purchase History Schema
const PurchaseHistorySchema = new Schema<IPurchaseHistory>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    products: [
      {
        productId: {
          type: String,
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      type: AddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
    },
    trackingNumber: {
      type: String,
    },
  },
  { _id: false }
);

// User Schema
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't return password by default
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'vendor'],
      default: 'customer',
    },
    addresses: {
      type: [AddressSchema],
      default: [],
    },
    cart: {
      type: [CartItemSchema],
      default: [],
    },
    purchaseHistory: {
      type: [PurchaseHistorySchema],
      default: [],
    },
    wishlist: {
      type: [String],
      default: [],
    },
    refreshToken: {
      type: String,
      select: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
// Note: email and phone indexes are already created by unique: true in schema
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

// Pre-save middleware to hash password and ensure only one default address
UserSchema.pre('save', async function (next) {
  // Hash password if it's modified
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Ensure only one default address
  if (this.addresses && this.addresses.length > 0) {
    const defaultAddresses = this.addresses.filter((addr) => addr.isDefault);
    if (defaultAddresses.length > 1) {
      // Keep only the first default address
      this.addresses.forEach((addr, index) => {
        if (index > 0 && addr.isDefault) {
          addr.isDefault = false;
        }
      });
    }
  }
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to add item to cart
UserSchema.methods.addToCart = function (item: ICartItem) {
  const existingItemIndex = this.cart.findIndex(
    (cartItem: ICartItem) => cartItem.productId === item.productId
  );

  if (existingItemIndex > -1) {
    // Update quantity if item already exists
    this.cart[existingItemIndex].quantity += item.quantity;
  } else {
    // Add new item to cart
    this.cart.push(item);
  }

  return this.save();
};

// Method to remove item from cart
UserSchema.methods.removeFromCart = function (productId: string) {
  this.cart = this.cart.filter(
    (item: ICartItem) => item.productId !== productId
  );
  return this.save();
};

// Method to clear cart
UserSchema.methods.clearCart = function () {
  this.cart = [];
  return this.save();
};

// Prevent model recompilation in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
