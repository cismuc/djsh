import consola from "consola";
import { config } from "dotenv";
import mongoose from "mongoose";

config();

const InitializeMongoDB = async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        dbName: process.env.DATABASE_NAME || 'djshandler'
    });

    consola.success("Successfully Connected to the Database");
}

export default InitializeMongoDB