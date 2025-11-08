import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agriculture-app';

interface UserDoc {
  _id: mongoose.Types.ObjectId;
  email?: string;
  phone: string;
  password: string;
}

async function fixPasswords() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

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

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 chars)
      const isHashed = user.password && 
                       user.password.length === 60 && 
                       user.password.startsWith('$2');

      if (isHashed) {
        console.log(`User ${user.email || user.phone}: Password already hashed ✓`);
        alreadyHashedCount++;
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
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total users: ${users.length}`);
    console.log(`Already hashed: ${alreadyHashedCount}`);
    console.log(`Fixed: ${fixedCount}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing passwords:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixPasswords();
