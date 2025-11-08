import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { SendOTPRequest, ApiResponse } from '@/types/user';

// POST /api/auth/otp/send - Send OTP to phone number
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: SendOTPRequest = await request.json();

    // Clean and validate phone number (remove spaces, dashes, etc.)
    const cleanPhone = body.phone?.replace(/\D/g, '').trim();

    if (!cleanPhone || !/^[0-9]{10}$/.test(cleanPhone)) {
      const response: ApiResponse = {
        success: false,
        message: 'Please provide a valid 10-digit phone number',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if user exists with cleaned phone number
    const user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      console.log('User not found for phone:', cleanPhone);
      const response: ApiResponse = {
        success: false,
        message: 'User not found. Please register first.',
      };
      return NextResponse.json(response, { status: 404 });
    }

    console.log('User found:', { id: user._id, phone: user.phone });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiry to 5 minutes from now
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    console.log('Generated OTP:', { otp, expiry: otpExpiry });

    // Update user with OTP and expiry using findByIdAndUpdate to ensure fields are saved
    await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          otp: otp,
          otpExpiry: otpExpiry
        }
      },
      { new: true }
    );

    // Verify it was saved by fetching again
    const verifyUser = await User.findById(user._id);
    console.log('Verification after update - otp:', verifyUser?.otp, 'otpExpiry:', verifyUser?.otpExpiry);

    // TODO: In production, send OTP via SMS service (Twilio, AWS SNS, etc.)
    console.log(`OTP for ${cleanPhone}: ${otp}`);

    const response: ApiResponse = {
      success: true,
      message: 'OTP sent successfully to your phone number. Valid for 5 minutes.',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to send OTP',
      error: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
