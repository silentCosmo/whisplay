// src/lib/db.js

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env");
}

if (process.env.NODE_ENV === "development") {
  // In dev mode, use a global variable so we don't create multiple clients
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, it's safe to create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDB() {
  const client = await clientPromise;
  const db = client.db("musicDB"); // 🔁 you can name it anything
  return db;
}
