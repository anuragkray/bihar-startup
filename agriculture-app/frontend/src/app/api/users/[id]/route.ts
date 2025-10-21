import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { UpdateUserRequest, ApiResponse } from '@/types/user';
import mongoose from 'mongoose';

// GET /api/users/[id] - Get user by ID
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

    const user = await User.findById(id).select('-password -refreshToken');

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: 'User fetched successfully',
      data: user,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user
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

    const body: UpdateUserRequest = await request.json();

    // Check if user exists
    const user = await User.findById(id);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Check if email or phone is being updated and already exists
    if (body.email && body.email !== user.email) {
      const existingEmail = await User.findOne({ email: body.email });
      if (existingEmail) {
        const response: ApiResponse = {
          success: false,
          message: 'Email already in use',
        };
        return NextResponse.json(response, { status: 409 });
      }
    }

    if (body.phone && body.phone !== user.phone) {
      const existingPhone = await User.findOne({ phone: body.phone });
      if (existingPhone) {
        const response: ApiResponse = {
          success: false,
          message: 'Phone number already in use',
        };
        return NextResponse.json(response, { status: 409 });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    const response: ApiResponse = {
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error updating user:', error);

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
      message: 'Failed to update user',
      error: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete user (soft delete by setting isActive to false)
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
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      // Permanent delete
      const user = await User.findByIdAndDelete(id);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found',
        };
        return NextResponse.json(response, { status: 404 });
      }

      const response: ApiResponse = {
        success: true,
        message: 'User permanently deleted',
      };

      return NextResponse.json(response, { status: 200 });
    } else {
      // Soft delete - set isActive to false
      const user = await User.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      ).select('-password -refreshToken');

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found',
        };
        return NextResponse.json(response, { status: 404 });
      }

      const response: ApiResponse = {
        success: true,
        message: 'User deactivated successfully',
        data: user,
      };

      return NextResponse.json(response, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error deleting user:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
