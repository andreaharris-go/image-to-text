const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongodb:27017';
const DB_NAME = 'imageToText';

let db = null;

async function connect() {
  if (db) return db;
  
  try {
    const client = await MongoClient.connect(MONGO_URL);
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function saveResult(data) {
  const database = await connect();
  const collection = database.collection('results');
  const result = await collection.insertOne({
    ...data,
    createdAt: new Date()
  });
  return result;
}

async function getResults(limit = 10) {
  const database = await connect();
  const collection = database.collection('results');
  const results = await collection
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return results;
}

async function getResultById(id) {
  const database = await connect();
  const collection = database.collection('results');
  const result = await collection.findOne({ _id: new ObjectId(id) });
  return result;
}

module.exports = {
  connect,
  saveResult,
  getResults,
  getResultById
};
