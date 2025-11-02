import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { ApiResponse } from '@/types/user';
import mongoose from 'mongoose';

// GET /api/users/orders/[id] - Get user's purchase history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid user ID',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    const user = await User.findById(id).select('purchaseHistory');

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    let orders = user.purchaseHistory;

    // Filter by status if provided
    if (status) {
      orders = orders.filter((order) => order.status === status);
    }

    // Sort by order date (newest first)
    orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());

    // Pagination
    const total = orders.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedOrders = orders.slice(skip, skip + limit);

    // Calculate total spent
    const totalSpent = user.purchaseHistory.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const response: ApiResponse = {
      success: true,
      message: 'Purchase history fetched successfully',
      data: {
        orders: paginatedOrders,
        totalOrders: total,
        totalSpent,
        pagination: {
          page,
          limit,
          totalPages,
          total,
        },
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching purchase history:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch purchase history',
      error: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/users/orders/[id] - Add order to purchase history
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid user ID',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.orderId || !body.products || !body.totalAmount || !body.shippingAddress) {
      const response: ApiResponse = {
        success: false,
        message: 'Order ID, products, total amount, and shipping address are required',
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

    // Check if order ID already exists
    const existingOrder = user.purchaseHistory.find(
      (order) => order.orderId === body.orderId
    );

    if (existingOrder) {
      const response: ApiResponse = {
        success: false,
        message: 'Order with this ID already exists',
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Add order to purchase history
    const newOrder = {
      orderId: body.orderId,
      products: body.products,
      totalAmount: body.totalAmount,
      orderDate: body.orderDate || new Date(),
      status: body.status || 'pending',
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      trackingNumber: body.trackingNumber,
    };

    user.purchaseHistory.push(newOrder);
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Order added to purchase history successfully',
      data: newOrder,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error adding order:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to add order to purchase history',
      error: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/users/orders/[id] - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid user ID',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.orderId) {
      const response: ApiResponse = {
        success: false,
        message: 'Order ID is required',
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

    // Find the order
    const orderIndex = user.purchaseHistory.findIndex(
      (order) => order.orderId === body.orderId
    );

    if (orderIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: 'Order not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Update order fields
    if (body.status) {
      user.purchaseHistory[orderIndex].status = body.status;
    }
    if (body.trackingNumber) {
      user.purchaseHistory[orderIndex].trackingNumber = body.trackingNumber;
    }

    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Order updated successfully',
      data: user.purchaseHistory[orderIndex],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error updating order:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to update order',
      error: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
