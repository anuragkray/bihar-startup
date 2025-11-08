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

    // Validate required fields (name and phone are required, email is optional)
    if (!body.name || !body.phone) {
      const response: ApiResponse = {
        success: false,
        message: 'Name and phone are required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate phone format
    if (!/^[0-9]{10}$/.test(body.phone)) {
      const response: ApiResponse = {
        success: false,
        message: 'Please provide a valid 10-digit phone number',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate email format if provided
    if (body.email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(body.email)) {
      const response: ApiResponse = {
        success: false,
        message: 'Please provide a valid email address',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if user already exists by phone
    const existingUserByPhone = await User.findOne({ phone: body.phone });
    if (existingUserByPhone) {
      const response: ApiResponse = {
        success: false,
        message: 'User with this phone number already exists',
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Check if user already exists by email (if email provided)
    if (body.email) {
      const existingUserByEmail = await User.findOne({ email: body.email });
      if (existingUserByEmail) {
        const response: ApiResponse = {
          success: false,
          message: 'User with this email already exists',
        };
        return NextResponse.json(response, { status: 409 });
      }
    }

    // Create user data
    const userData: any = {
      name: body.name,
      phone: body.phone,
      role: body.role || 'customer',
    };

    // Add email if provided
    if (body.email) {
      userData.email = body.email;
    }

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
    delete userResponse.otp;
    delete userResponse.otpExpiry;

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
