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

    // Calculate cart total based on weight if available, otherwise quantity
    const cartTotal = user.cart.reduce(
      (total, item) => {
        if (item.weight) {
          return total + item.price * item.weight;
        }
        return total + item.price * item.quantity;
      },
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

    // Check if item already exists in cart with same weight
    const existingItemIndex = user.cart.findIndex(
      (item) => item.productId === body.productId && item.weight === body.weight
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists with same weight
      user.cart[existingItemIndex].quantity += body.quantity;
      user.cart[existingItemIndex].price = body.price; // Update price in case it changed
    } else {
      // Add new item to cart
      user.cart.push({
        productId: body.productId,
        productName: body.productName,
        quantity: body.quantity,
        price: body.price,
        weight: body.weight,
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

// PUT /api/users/cart/[id] - Update cart item quantity or weight
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

    const body: any = await request.json();

    // Validate required fields
    if (!body.productId) {
      const response: ApiResponse = {
        success: false,
        message: 'Product ID is required',
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

    // Find the item in cart - match by productId and oldWeight if provided
    const itemIndex = user.cart.findIndex(
      (item) => {
        if (body.oldWeight !== undefined) {
          return item.productId === body.productId && item.weight === body.oldWeight;
        }
        return item.productId === body.productId;
      }
    );

    if (itemIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: 'Item not found in cart',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Update weight if provided
    if (body.weight !== undefined) {
      if (body.weight <= 0 || body.weight > 50) {
        const response: ApiResponse = {
          success: false,
          message: 'Weight must be between 0 and 50 kg',
        };
        return NextResponse.json(response, { status: 400 });
      }
      user.cart[itemIndex].weight = body.weight;
    }

    // Update quantity if provided
    if (body.quantity !== undefined) {
      if (body.quantity <= 0) {
        user.cart.splice(itemIndex, 1);
      } else {
        user.cart[itemIndex].quantity = body.quantity;
      }
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
