import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const dbConnect = async()=>{
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
       console.log("database connected succesfully");
    } catch (error) {
        console.log("ERROR while connecting to Database: ", error.message);
        process.exit();
    }
}

export {dbConnect};