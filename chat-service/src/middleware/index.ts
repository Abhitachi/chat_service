import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { ApiError } from '../utils';


interface TokenPayload {
    id: string;
    name: string;
    email: string;
    iat: number;
    exp: number;
}

interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthRequest extends Request {
    user: {
      _id: string;
      email: string;
      createdAt: Date;
      updatedAt: Date;
      name: string;
      password: string;
    };
  }

const jwtSecret = config.JWT_SECRET as string;

const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
)=> {
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return next(new ApiError(401, "Missing authorization header"));
    }

    const [, token] = authHeader.split(" ");
    try{
        const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
        req.user = {
            _id: decoded.id,
            email: decoded.email,
            createdAt: new Date(decoded.iat * 1000),
            updatedAt: new Date(decoded.iat * 1000),
            name: decoded.name,
            password: "",
        }
        return next();
    }catch(error){
        console.error(error);
        return next(new ApiError(401, "invalid token"))
    }
}

const errorConverter: ErrorRequestHandler = (err, req, res, next) => {
    let error =err;
    if(! (error instanceof ApiError)){
        const statuscode = error.statusCode || (
            error instanceof Error ? 400 : 500
        );
        const message = error.message || (
            statuscode === 400 ? "Bad Request" : "Internal server Error"
        );
        error = new ApiError(statuscode, message, false, err.stack.toString())
    }
    next(error);
}

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let {statusCode, message} = err;
    if(process.env.NODE_ENV === "production" && !err.isOperational){
        statusCode = 500;
        message = "Internal server Error";
    }

    res.locals.errorMessage = err.message;

    const response = {
        code: statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && {stack: err.stack}),
    }

    if(process.env.NODE_ENV === 'development'){
        console.error(err);
    }

    res.status(statusCode).json(response);
    next();
}

export { authMiddleware, errorConverter, errorHandler };
