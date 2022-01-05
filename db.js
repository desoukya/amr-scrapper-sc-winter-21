
   
const { MongoClient } = require('mongodb');
const bluebird = require('bluebird');

bluebird.promisifyAll(MongoClient);

const MONGO_URI = 'mongodb://localhost:27017'
const MONGO_DB_NAME = 'sc';
let dbConnection;

const connect = async () => {
  try {
    const client = await MongoClient.connect(MONGO_URI);
    dbConnection = client.db(MONGO_DB_NAME);
  } catch (e) {
    throw new Error(`Could not establish database connection: ${e}`);
  }
};

const mongoClient = async collectionName => {
  if (!dbConnection) {
    await connect();
  }
  if (collectionName) {
    return dbConnection.collection(collectionName);
  }
  return dbConnection;
};

module.exports = {
  mongoClient
};