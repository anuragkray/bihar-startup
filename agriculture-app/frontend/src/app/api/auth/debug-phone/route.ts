import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/auth/debug-phone - Debug endpoint to check phone numbers in database
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all users with their phone numbers
    const users = await User.find({}, { phone: 1, name: 1, email: 1, _id: 1 });

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      })),
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    }, { status: 500 });
  }
}
