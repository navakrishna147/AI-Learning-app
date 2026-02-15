#!/usr/bin/env node

/**
 * ============================================================================
 * DATABASE SEEDING SCRIPT
 * ============================================================================
 * 
 * This script seeds the database with a test user for development/testing.
 * 
 * Usage:
 *   npm run seed
 * 
 * Test User Created:
 *   Email: testuser@example.com
 *   Password: Test@1234
 *   Role: student
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import User model
import User from '../models/User.js';

// Configuration
const TEST_USER = {
  username: 'testuser',
  email: 'testuser@example.com',
  password: 'Test@1234',
  fullName: 'Test User',
  role: 'student'
};

const seedDatabase = async () => {
  try {
    console.log('\n' + '═'.repeat(70));
    console.log('🌱 DATABASE SEEDING SCRIPT');
    console.log('═'.repeat(70) + '\n');

    // Check environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in .env file');
    }

    console.log('📍 MongoDB Connection Details:');
    console.log(`   URI: ${process.env.MONGODB_URI}`);
    console.log('');

    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Successfully connected to MongoDB\n');

    // Check if test user already exists
    console.log('🔍 Checking if test user already exists...');
    const existingUser = await User.findOne({ email: TEST_USER.email });

    if (existingUser) {
      console.log(`⚠️  Test user already exists: ${TEST_USER.email}`);
      console.log('   Skipping creation...\n');
      
      console.log('📋 Existing Test User:');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Username: ${existingUser.username}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Created: ${existingUser.createdAt}`);
      console.log('');
      
      await mongoose.connection.close();
      console.log('✅ Database connection closed\n');
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(TEST_USER.password, salt);
    console.log('✅ Password hashed successfully\n');

    // Create test user
    console.log('👤 Creating test user...');
    const newUser = await User.create({
      username: TEST_USER.username,
      email: TEST_USER.email,
      password: hashedPassword,
      fullName: TEST_USER.fullName,
      role: TEST_USER.role,
      isActive: true
    });
    console.log('✅ Test user created successfully\n');

    // Display created user information
    console.log('📋 Created Test User:');
    console.log(`   ID: ${newUser._id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Username: ${newUser.username}`);
    console.log(`   Full Name: ${newUser.fullName}`);
    console.log(`   Role: ${newUser.role}`);
    console.log(`   Active: ${newUser.isActive}`);
    console.log(`   Created: ${newUser.createdAt}`);
    console.log('');

    // Display login credentials
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log(`   Email: ${TEST_USER.email}`);
    console.log(`   Password: ${TEST_USER.password}`);
    console.log('');

    // Close database connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    console.log('\n' + '═'.repeat(70));
    console.log('✨ SEEDING COMPLETE');
    console.log('═'.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ SEEDING FAILED');
    console.error('═'.repeat(70));
    console.error(`Error: ${error.message}`);
    
    if (error.name === 'MongoNetworkError') {
      console.error('\n⚠️  MongoDB Connection Error');
      console.error('   Make sure MongoDB is running:');
      console.error('   - Local: mongod');
      console.error('   - Or check MongoDB Atlas connection string');
    } else if (error.name === 'ValidationError') {
      console.error('\n⚠️  Validation Error');
      console.error(`   ${error.message}`);
    }
    
    console.error('\n' + '═'.repeat(70) + '\n');
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
