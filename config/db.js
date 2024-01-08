import mongoose from "mongoose";

const connectarDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const url = `${connection.connection.host}:${connection.connection.port}`;
    console.log("====================================");
    console.log(`MongoDB Conectado en: ${url}`);
    console.log("====================================");
  } catch (error) {
    console.log("====================================");
    console.log(`error: ${error.message}`);
    console.log("====================================");
    process.exit(1);
  }
};

export default connectarDB;
