import mongoose from "mongoose";
import { env } from "../config";
import { NotFoundError } from "../common/utils";


export const dbConnect=async ()=>{
   try {
    await mongoose.connect(env.db_uri,{timeoutMS:5000});
    console.log("DB Connected Successfully 👌👌👌");
   } catch (error) {
    throw new NotFoundError("DB Connection Error");
   }
}