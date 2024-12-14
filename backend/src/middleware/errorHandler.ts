import { Request, Response, NextFunction } from "express";
import { CustomError } from "../types";



const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.log(`${err.stack || 'No stack trace'}`.red);
  res.status(err.statusCode || 500).json({error: err.message || `Server error`});
}

export default errorHandler;