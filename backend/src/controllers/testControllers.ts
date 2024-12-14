import { Request, Response, NextFunction} from "express";



export const test = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({message: "api works"});
  } catch (error) {
    next(error);
  }
}