import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

interface DbConnectionOptions {
  retryAttempts?: number;
  retryDelay?: number;
}

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(options: DbConnectionOptions = {}): Promise<void> {
    const { retryAttempts = 5, retryDelay = 5000 } = options;

    if (this.isConnected) {
      console.log('Already connected to MongoDB');
      return;
    }

    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
      throw new Error('MONGODB_URL environment variable is not defined');
    }

    let attempts = 0;
    
    while (attempts < retryAttempts) {
      try {
        console.log(`Connecting to MongoDB... (Attempt ${attempts + 1}/${retryAttempts})`);
        
        await mongoose.connect(mongoUrl, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });

        this.isConnected = true;
        console.log('✅ Connected to MongoDB successfully');
        
        // Handle connection events
        mongoose.connection.on('error', (error) => {
          console.error('MongoDB connection error:', error);
          this.isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
          console.warn('MongoDB disconnected');
          this.isConnected = false;
        });

        return;
      } catch (error) {
        attempts++;
        console.error(`Failed to connect to MongoDB (Attempt ${attempts}/${retryAttempts}):`, error);
        
        if (attempts >= retryAttempts) {
          throw new Error(`Could not connect to MongoDB after ${retryAttempts} attempts`);
        }
        
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  public async close(): Promise<void> {
    if (!this.isConnected) {
      console.log('No active MongoDB connection to close');
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

// Export singleton instance methods
export const db = Database.getInstance();
export const connect = db.connect.bind(db);
export const close = db.close.bind(db);
export const getConnectionStatus = db.getConnectionStatus.bind(db);
