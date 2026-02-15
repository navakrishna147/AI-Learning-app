/**
 * ============================================================================
 * DATABASE SAMPLE DATA SEEDER
 * ============================================================================
 * 
 * Creates test users and sample data for testing all features
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-learning-assistant';

// Define User Schema (mimics backend model)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing test data
    await User.deleteMany({ email: { $in: ['test@example.com', 'admin@example.com'] } });
    console.log('✅ Cleared existing test data');

    // Hash password
    const hashedPassword = await bcrypt.hash('Test123456!', 10);

    // Create test users
    const users = await User.insertMany([
      {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user'
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      }
    ]);

    console.log('\n✅ Sample Users Created:');
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
      console.log(`     Password: Test123456!`);
      console.log(`     Role: ${user.role}\n`);
    });

    // Close connection
    await mongoose.disconnect();
    console.log('✅ Database seeding complete!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
