import mongoose from "mongoose";

type connectionObject = {
  isConnected?: number;
};

const connection: connectionObject = {};

export async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Db already connected");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});
    console.log("Db connected", db);

    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    console.log("Db connection error", error);
    process.exit(1);
  }
}
