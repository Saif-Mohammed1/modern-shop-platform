/** 
 * pre code connection first javaScript version


import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
  } catch (error) {
    throw error;
  }
};

const disconnectDB = async () => {
  if (!isConnected) {
    return;
  }
  try {
    await mongoose.disconnect();
    isConnected = false;
  } catch (error) {
    throw error;
  }
};

const getDB = () => {
  if (!isConnected) {
    throw new Error("No active connection to MongoDB");
  }
  return mongoose.connection;
};

export { connectDB, disconnectDB, getDB };
*/

/**
 *   pre code connection  typeScript version
 
import mongoose, { Connection } from "mongoose";

let isConnected = false;

const connectDB = async (): Promise<void> => {
  if (isConnected) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    isConnected = true;
  } catch (error) {
    throw new Error(
      `Failed to connect to MongoDB: ${(error as Error).message}`
    );
  }
};

const disconnectDB = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }
  try {
    await mongoose.disconnect();
    isConnected = false;
  } catch (error) {
    throw new Error(
      `Failed to disconnect from MongoDB: ${(error as Error).message}`
    );
  }
};

const getDB = (): Connection => {
  if (!isConnected) {
    throw new Error("No active connection to MongoDB");
  }
  return mongoose.connection;
};

export { connectDB, disconnectDB, getDB };
*/
/**
 *  update pre code connection second typeScript version
 * */
import mongoose, { Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

// Extend the global object
let cached = global.mongoose as {
  conn: Connection | null;
  promise: Promise<Connection> | null;
};

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async (): Promise<Connection> => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // No longer need useNewUrlParser and useUnifiedTopology options
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw new Error(
      `Failed to connect to MongoDB: ${(error as Error).message}`
    );
  }

  return cached.conn;
};

export default connectDB;

const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return; // Already disconnected
  }
  try {
    await mongoose.disconnect();
  } catch (error) {
    throw new Error(
      `Failed to disconnect from MongoDB: ${(error as Error).message}`
    );
  }
};

export { connectDB, disconnectDB };
