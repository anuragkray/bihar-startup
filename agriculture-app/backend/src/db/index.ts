import mongoose from "mongoose";
import { DB_NAME } from "../constant";

const connectDB = async () => {
  try {
    const instanceDB = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log("DATABASE Conneted :-", instanceDB.connection.host);
  } catch (error) {
    console.log("Error while Database connection !", error);
    process.exit(1);
  }
};

export default connectDB;
