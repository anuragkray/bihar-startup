import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { CreateUserRequest, ApiResponse, PaginatedResponse } from '@/types/user';

// GET /api/users - Get all users with pagination and filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');

    // Build query
    const query: any = {};
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Fetch users
    const users = await User.find(query)
      .select('-password -refreshToken')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const response: PaginatedResponse<any> = {
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: CreateUserRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.phone) {
      const response: ApiResponse = {
        success: false,
        message: 'Name, email, and phone are required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: body.email }, { phone: body.phone }],
    });

    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        message: 'User with this email or phone already exists',
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Create user data
    const userData: any = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role || 'customer',
    };

    // Add password if provided (will be hashed later when implementing auth)
    if (body.password) {
      userData.password = body.password;
    }

    // Add address if provided
    if (body.address) {
      userData.addresses = [{ ...body.address, isDefault: true }];
    }

    // Create new user
    const user = await User.create(userData);

    // Remove sensitive fields from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    const response: ApiResponse = {
      success: true,
      message: 'User created successfully',
      data: userResponse,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const response: ApiResponse = {
        success: false,
        message: 'Validation error',
        error: error.message,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const response: ApiResponse = {
      success: false,
      message: 'Failed to create user',
      error: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
