const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log('Connecting to MongoDB Atlas / configured URI...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(` MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
      return conn;
    } catch (err) {
      console.warn(` Failed to connect to configured MONGODB_URI: ${err.message}`);
      console.warn(' Falling back to in-memory MongoDB for local evaluation...');
    }
  } else {
    console.log(' No MONGODB_URI configured in server/.env. Initializing in-memory MongoDB for demo/development...');
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(` In-Memory MongoDB Started & Connected: ${memUri}`);
    console.log(' To persist data across restarts, configure MONGODB_URI in server/.env with your MongoDB Atlas connection string.');
    return conn;
  } catch (memErr) {
    console.error(' Critical Error: Could not connect to either MongoDB Atlas or In-Memory MongoDB:', memErr.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, disconnectDB };
