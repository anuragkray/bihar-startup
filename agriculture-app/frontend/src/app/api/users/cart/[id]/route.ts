import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { AddToCartRequest, UpdateCartItemRequest, ApiResponse } from '@/types/user';
import mongoose from 'mongoose';

// GET /api/users/cart/[id] - Get user's cart
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid user ID',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const user = await User.findById(id).select('cart');

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Calculate cart total
    const cartTotal = user.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const response: ApiResponse = {
      success: true,
      message: 'Cart fetched successfully',
      data: {
        cart: user.cart,
        itemCount: user.cart.length,
        totalAmount: cartTotal,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch cart',
      error: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/users/cart/[id] - Add item to cart
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid user ID',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body: AddToCartRequest = await request.json();

    // Validate required fields
    if (!body.productId || !body.productName || !body.quantity || !body.price) {
      const response: ApiResponse = {
        success: false,
        message: 'Product ID, name, quantity, and price are required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const user = await User.findById(id);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Check if item already exists in cart
    const existingItemIndex = user.cart.findIndex(
      (item) => item.productId === body.productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      user.cart[existingItemIndex].quantity += body.quantity;
      user.cart[existingItemIndex].price = body.price; // Update price in case it changed
    } else {
      // Add new item to cart
      user.cart.push({
        productId: body.productId,
        productName: body.productName,
        quantity: body.quantity,
        price: body.price,
        addedAt: new Date(),
      });
    }

    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Item added to cart successfully',
      data: user.cart,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to add item to cart',
      error: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/users/cart/[id] - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid user ID',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body: UpdateCartItemRequest = await request.json();

    // Validate required fields
    if (!body.productId || body.quantity === undefined) {
      const response: ApiResponse = {
        success: false,
        message: 'Product ID and quantity are required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const user = await User.findById(id);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Find the item in cart
    const itemIndex = user.cart.findIndex(
      (item) => item.productId === body.productId
    );

    if (itemIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: 'Item not found in cart',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Update quantity or remove if quantity is 0
    if (body.quantity <= 0) {
      user.cart.splice(itemIndex, 1);
    } else {
      user.cart[itemIndex].quantity = body.quantity;
    }

    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Cart updated successfully',
      data: user.cart,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error updating cart:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to update cart',
      error: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/users/cart/[id] - Remove item from cart or clear cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid user ID',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const clearAll = searchParams.get('clearAll') === 'true';

    const user = await User.findById(id);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (clearAll) {
      // Clear entire cart
      user.cart = [];
      await user.save();

      const response: ApiResponse = {
        success: true,
        message: 'Cart cleared successfully',
        data: user.cart,
      };

      return NextResponse.json(response, { status: 200 });
    } else if (productId) {
      // Remove specific item
      const itemIndex = user.cart.findIndex(
        (item) => item.productId === productId
      );

      if (itemIndex === -1) {
        const response: ApiResponse = {
          success: false,
          message: 'Item not found in cart',
        };
        return NextResponse.json(response, { status: 404 });
      }

      user.cart.splice(itemIndex, 1);
      await user.save();

      const response: ApiResponse = {
        success: true,
        message: 'Item removed from cart successfully',
        data: user.cart,
      };

      return NextResponse.json(response, { status: 200 });
    } else {
      const response: ApiResponse = {
        success: false,
        message: 'Please provide productId or set clearAll=true',
      };
      return NextResponse.json(response, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
