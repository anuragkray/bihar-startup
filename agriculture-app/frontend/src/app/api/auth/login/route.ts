import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// POST /api/auth/login - Login with email/phone and password
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: LoginRequest = await request.json();
    const { email, phone, password } = body;

    // Validate that password is provided
    if (!password || !password.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'Password is required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate that either email or phone is provided (but not both)
    if (!email && !phone) {
      const response: ApiResponse = {
        success: false,
        message: 'Please provide either email or phone number',
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (email && phone) {
      const response: ApiResponse = {
        success: false,
        message: 'Please provide either email or phone number, not both',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Build query based on what was provided
    let query: any = {};
    
    if (email) {
      // Validate email format
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        const response: ApiResponse = {
          success: false,
          message: 'Please provide a valid email address',
        };
        return NextResponse.json(response, { status: 400 });
      }
      query.email = email.toLowerCase().trim();
    }

    if (phone) {
      // Clean and validate phone number
      const cleanPhone = phone.replace(/\D/g, '').trim();
      if (!/^[0-9]{10}$/.test(cleanPhone)) {
        const response: ApiResponse = {
          success: false,
          message: 'Please provide a valid 10-digit phone number',
        };
        return NextResponse.json(response, { status: 400 });
      }
      query.phone = cleanPhone;
    }

    // Find user
    const user = await User.findOne(query);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid credentials',
      };
      return NextResponse.json(response, { status: 401 });
    }

    // TODO: Implement proper password verification
    // In production, you should:
    // 1. Store password hashes (using bcrypt) in the User model
    // 2. Compare the provided password with the stored hash
    // 3. Use secure session management (JWT tokens, etc.)
    // 
    // Example with bcrypt:
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (!isPasswordValid) {
    //   return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    // }

    // For now, we're returning the user without actual password verification
    // This is NOT secure and should be replaced with proper authentication
    console.log('WARNING: Password verification not implemented. User logged in without password check.');

    const response: ApiResponse = {
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error during login:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Login failed',
      error: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
