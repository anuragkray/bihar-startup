import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { VerifyOTPRequest, ApiResponse } from '@/types/user';

// POST /api/auth/otp/verify - Verify OTP and login user
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: VerifyOTPRequest = await request.json();
    
    console.log('OTP Verify Request:', { phone: body.phone, otp: body.otp });

    // Clean and validate phone number (remove spaces, dashes, etc.)
    const cleanPhone = body.phone?.replace(/\D/g, '').trim();
    
    console.log('Cleaned phone:', cleanPhone);

    if (!cleanPhone || !/^[0-9]{10}$/.test(cleanPhone)) {
      console.log('Phone validation failed');
      const response: ApiResponse = {
        success: false,
        message: 'Please provide a valid 10-digit phone number',
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!body.otp || !/^[0-9]{6}$/.test(body.otp)) {
      console.log('OTP validation failed:', { otp: body.otp, length: body.otp?.length });
      const response: ApiResponse = {
        success: false,
        message: 'Please provide a valid 6-digit OTP',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Find user with OTP using cleaned phone number
    const user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      console.log('User not found for phone:', cleanPhone);
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    console.log('User found:', { phone: user.phone, hasOtp: !!user.otp, hasExpiry: !!user.otpExpiry });

    // Check if OTP exists
    if (!user.otp || !user.otpExpiry) {
      console.log('No OTP found in database');
      const response: ApiResponse = {
        success: false,
        message: 'No OTP found. Please request a new OTP.',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if OTP is expired
    const now = new Date();
    const expiry = new Date(user.otpExpiry);
    console.log('OTP expiry check:', { now, expiry, expired: now > expiry });
    
    if (now > expiry) {
      console.log('OTP has expired');
      const response: ApiResponse = {
        success: false,
        message: 'OTP has expired. Please request a new OTP.',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verify OTP
    console.log('Comparing OTPs:', { stored: user.otp, provided: body.otp, match: user.otp === body.otp });
    
    if (user.otp !== body.otp) {
      console.log('OTP mismatch');
      const response: ApiResponse = {
        success: false,
        message: 'Invalid OTP. Please try again.',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // OTP is valid - clear OTP fields and update last login
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.phoneVerified = true;
    user.lastLogin = new Date();
    await user.save();

    // Get user without sensitive fields
    const userResponse = await User.findById(user._id)
      .select('-password -refreshToken -otp -otpExpiry')
      .lean();

    const response: ApiResponse = {
      success: true,
      message: 'Login successful',
      data: userResponse,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to verify OTP',
      error: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
