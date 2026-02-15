import mongoose from 'mongoose';

let connectionAttempts = 0;
const MAX_RETRIES = 3;

/**
 * ============================================================================
 * PRODUCTION-GRADE DATABASE CONNECTION
 * ============================================================================
 * 
 * Features:
 * - Blocks startup if DB fails in production
 * - Allows fallback in development for testing
 * - Exponential backoff retry logic
 * - Comprehensive error classification
 * - Health check function
 */
const connectDB = async (options = {}) => {
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';
  const allowFailure = isDevelopment && options.allowFailure !== false;

  try {
    console.log(`\n📍 MongoDB Connection Attempt #${connectionAttempts + 1}/${MAX_RETRIES}`);
    console.log(`   URI: ${process.env.MONGODB_URI}`);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    });

    connectionAttempts = 0;

    console.log(`\n✅ MongoDB Connected Successfully!`);
    console.log(`   Host: ${conn.connection.host}:${conn.connection.port}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Ready: Yes\n`);

    return conn;

  } catch (error) {
    connectionAttempts++;

    console.error(`\n❌ MongoDB Connection Failed (Attempt ${connectionAttempts}/${MAX_RETRIES})`);
    console.error(`   Error: ${error.message}`);

    // Classify error type
    if (error.name === 'MongoServerError') {
      console.error('   Type: MongoDB Server Error');
      console.error('   Tip: Is MongoDB server running?');
      console.error('        mongod (local) or check MongoDB Atlas');
    } else if (error.name === 'MongoNetworkError' || error.code === 'ECONNREFUSED') {
      console.error('   Type: Network Connection Failed');
      console.error('   Tip: Check if MongoDB is running on:', process.env.MONGODB_URI);
    } else if (error.name === 'MongoParseError') {
      console.error('   Type: Invalid Connection String');
      console.error('   Tip: Fix MONGODB_URI format in .env');
      console.error('   Example: mongodb://localhost:27017/lmsproject');
    } else if (error.name === 'MongoAuthenticationError') {
      console.error('   Type: Authentication Failed');
      console.error('   Tip: Check database username and password');
    }

    // Retry logic with exponential backoff
    if (connectionAttempts < MAX_RETRIES) {
      const delayMS = 3000 * connectionAttempts;
      console.log(`\n🔄 Retrying in ${delayMS / 1000} seconds...\n`);

      await new Promise(resolve => setTimeout(resolve, delayMS));
      return connectDB(options);

    } else {
      // All retries exhausted
      const errorMsg = `MongoDB connection failed after ${MAX_RETRIES} attempts`;

      if (allowFailure) {
        // Development mode - allow server to continue
        console.error('\n⚠️  All connection attempts failed!');
        console.error('   Proceeding in DEVELOPMENT mode without database');
        console.error('   Database operations will FAIL\n');
        return null;
      } else {
        // Production mode - fail immediately
        console.error('\n' + '═'.repeat(60));
        console.error('❌ CRITICAL: Cannot connect to MongoDB in production mode');
        console.error('═'.repeat(60));
        console.error('\nThe server CANNOT run without a database in production.');
        console.error('\nVerify:');
        console.error('  1. MongoDB is running and accessible');
        console.error('  2. MONGODB_URI in .env is correct');
        console.error('  3. Network connectivity to MongoDB');
        console.error('  4. Authentication credentials (if using password)\n');
        console.error('Environment: ' + process.env.NODE_ENV);
        console.error('URI: ' + process.env.MONGODB_URI + '\n');

        throw new Error(errorMsg);
      }
    }
  }
};

/**
 * Check database health status
 * Returns object with connection details
 */
export const checkDBHealth = async () => {
  try {
    if (!mongoose.connection) {
      return {
        connected: false,
        message: 'No connection object',
        state: 'Not initialized'
      };
    }

    const state = mongoose.connection.readyState;
    const states = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };

    // Try to ping the database
    try {
      if (state === 1) {
        await mongoose.connection.db.admin().ping();
      }
    } catch (e) {
      // Ping failed but connection state exists
    }

    return {
      connected: state === 1,
      state: states[state] || 'Unknown',
      readyState: state,
      host: mongoose.connection.host || 'Not connected',
      port: mongoose.connection.port || 'N/A',
      database: mongoose.connection.name || 'Not connected'
    };
  } catch (error) {
    return {
      connected: false,
      message: error.message,
      state: 'Error'
    };
  }
};

/**
 * Get current database connection
 */
export const getDB = () => mongoose;

/**
 * Disconnect from database (for cleanup)
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};

export default connectDB;
