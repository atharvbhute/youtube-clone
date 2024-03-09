import  express  from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,  // whitelisting origin currently * from all origin
    credentials: true
})) //

app.use(express.urlencoded({extended: true, limit: "16kb"}));
// in above code if we recieve any nested objects in URL then we can take as well. and limit is 16kb

app.use(express.json({limit: "16kb"})); // whichever data is comming in JSON format limmiting that data to 16KB

app.use(express.static("public"));
//to store some static assets like images/ png/ pdfs in public folder.


app.use(cookieParser()); // for now this only.



// router imports
import { userRouter } from "./routes/user.routes.js";


// declaration of router
app.use("/api/v1/user", userRouter);

export {app};