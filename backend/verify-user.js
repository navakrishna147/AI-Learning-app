import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const mongoURI = 'mongodb://localhost:27017/ai-learning-assistant';

// User Schema (exact copy from models/User.js)
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true, select: false },
  fullName: String,
  role: { type: String, default: 'student' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function checkAndCreateUser() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Drop all indexes to remove unique constraint issues
    try {
      await User.collection.dropIndexes();
      console.log('🧹 Dropped old indexes');
    } catch (e) {
      // Ignore if no indexes
    }

    // Delete old user
    const result = await User.deleteMany({ $or: [{ email: 'testuser@example.com' }, { username: 'testuser' }] });
    if (result.deletedCount > 0) {
      console.log(`🗑️ Deleted ${result.deletedCount} old test user(s)`);
    }

    // Create new user
    console.log('🔐 Creating test user...');
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('Test@1234', salt);
    
    const newUser = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: hashedPassword,
      fullName: 'Test User',
      role: 'student',
      isActive: true
    });
    
    await newUser.save();
    console.log('✅ Test user created successfully');
    console.log(`   Email: testuser@example.com`);
    console.log(`   Password: Test@1234`);
    console.log(`   Hashed: ${hashedPassword.substring(0, 20)}...`);

    // Verify the user
    const createdUser = await User.findOne({ email: 'testuser@example.com' }).select('+password');
    console.log('\n✅ User verified in database:');
    console.log(`   Email: ${createdUser.email}`);
    console.log(`   Username: ${createdUser.username}`);
    console.log(`   Role: ${createdUser.role}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndCreateUser();
