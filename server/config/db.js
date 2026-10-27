import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export async function connectDB() {
  const customUri = process.env.MONGODB_URI;

  // 1. If explicit URI provided in environment, attempt connection
  if (customUri) {
    try {
      console.log(`[MongoDB] Connecting to configured URI: ${customUri.replace(/:([^@]+)@/, ':****@')}`);
      const conn = await mongoose.connect(customUri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`[MongoDB] Connected to database: ${conn.connection.name} on ${conn.connection.host}`);
      return true;
    } catch (err) {
      console.warn(`[MongoDB Warning] Could not connect to configured MONGODB_URI: ${err.message}`);
    }
  }

  // 2. Try default local MongoDB daemon
  try {
    const localUri = 'mongodb://127.0.0.1:27017/civicfix';
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`[MongoDB] Connected to local MongoDB daemon: ${conn.connection.host}`);
    return true;
  } catch (err) {
    // Local daemon not active, fallback to in-memory MongoDB
    console.log('[MongoDB Notice] Local MongoDB daemon not detected.');
    console.log('[MongoDB Notice] Initializing automatic in-memory MongoDB server for instant zero-configuration evaluation...');
  }

  // 3. Fallback to automated MongoMemoryServer
  try {
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'civicfix',
      },
    });
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[MongoDB Engine] Embedded in-memory MongoDB active at: ${conn.connection.host}`);
    console.log('[MongoDB Engine] Real Mongoose schemas, queries, validation, and indexes are 100% functional!');
    return true;
  } catch (error) {
    console.error('[MongoDB Error] Failed to start embedded database:', error);
    return false;
  }
}
