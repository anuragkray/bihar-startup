import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

interface UserDoc {
  _id: mongoose.Types.ObjectId;
  email?: string;
  phone: string;
  password: string;
}

// POST /api/auth/fix-passwords - Fix all plain text passwords
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const usersCollection = db.collection('users');

    // Find all users
    const users = await usersCollection.find({}).toArray() as unknown as UserDoc[];
    console.log(`Found ${users.length} users`);

    let fixedCount = 0;
    let alreadyHashedCount = 0;
    const results: any[] = [];

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 chars)
      const isHashed = user.password && 
                       user.password.length === 60 && 
                       user.password.startsWith('$2');

      if (isHashed) {
        console.log(`User ${user.email || user.phone}: Password already hashed ✓`);
        alreadyHashedCount++;
        results.push({
          user: user.email || user.phone,
          status: 'already_hashed'
        });
      } else {
        console.log(`User ${user.email || user.phone}: Hashing password...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        
        console.log(`User ${user.email || user.phone}: Password hashed ✓`);
        fixedCount++;
        results.push({
          user: user.email || user.phone,
          status: 'fixed'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password fix completed',
      data: {
        totalUsers: users.length,
        alreadyHashed: alreadyHashedCount,
        fixed: fixedCount,
        results
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fixing passwords:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fix passwords',
      error: error.message
    }, { status: 500 });
  }
}
