import { ErrorRequestHandler } from "express";
import { ApiError } from '../utils';

export const errorConverter : ErrorRequestHandler = (err, req, res, next) => {
    let error = err;
    if(!(error instanceof ApiError)){
        const statusCode = err.statusCode || (error instanceof Error ? 400: 500);
        const message = err.message || (statusCode === 400 ? "Bad Request" : "Internal Server Error");
        error = new ApiError(statusCode, message, false, err.stack.toString());
    }
    next(error);
}

export const errorHandler : ErrorRequestHandler = (err, req, res, next) => {
    let {statusCode, message} = err;
    if(process.env.NODE_ENV === "production" && !err.isOperational){
        statusCode = 500;
        message = "Internal Server Error";
    }

    res.locals.errorMessage = err.message;

    const response = {
        code : statusCode,
        message,
        ...(process.env.NODE_ENV === "development" && {stack: err.stack}),
    }

    if(process.env.NODE_ENV === "development"){
        console.log(err);
    }
    res.status(statusCode).json(response);
    next();
}