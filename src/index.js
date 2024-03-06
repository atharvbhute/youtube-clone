import { app } from "./app.js";
import { dbConnect } from "./db/index.js";
import dotenv from 'dotenv'

dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT;

dbConnect()
.then(()=>{
    app.listen(PORT, ()=>{
        console.log(`server is running on port ${PORT}`);
    });
    app.on("error", (err)=>{
        console.log("Error from database: ", err);
        throw err;
    }); // for error from database
})
.catch((err)=>{
    console.log("error from database:", err);
});