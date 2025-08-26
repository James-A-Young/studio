import mongoose, { Connection } from 'mongoose';

const uri = process.env.MONGODB_URI || 'mongodb://root:example@localhost:27017/shootingmatch';

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, {
      // Add options here if needed, e.g. useNewUrlParser, useUnifiedTopology
    });
  }
  return mongoose;
}
