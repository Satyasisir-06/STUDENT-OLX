import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    console.error(`⚠️  Server will continue running but database features won't work.`);
    console.error(`💡 Make sure MongoDB is running or update MONGO_URI in .env`);
  }
};

export default connectDB;
