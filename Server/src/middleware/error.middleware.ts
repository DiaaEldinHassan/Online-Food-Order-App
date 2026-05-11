import {Request, Response, NextFunction} from "express";
import { env } from "../config";
import { IError } from "../common";

export const globalErrorHandler=(err:IError,_req:Request,res:Response,_next:NextFunction)=>{
const statusCode=err.statusCode || 500;
const message = err.message || "Internal Server Error";
return res.status(statusCode).json({
    success:false,
    message,
    stack:env.node_env ==="development"? err.stack:null,
    statusCode
})
}