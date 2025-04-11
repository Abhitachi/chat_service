class ApiError extends Error{
    statusCode: number;
    isOperational: boolean;

    constructor(
        statusCode: number,
        message: string | undefined,
        isOperational = true,
        stack = ""
    ){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if(stack){
            this.stack = stack;
        }else {
            /**Error.captureStackTrace(targetObject[, constructorOpt]) */
            //creates a stack property on targetObj(i.e this(ApiError))
            //constructorOpt arguments is useful for hiding the implemention
            //details of error generating from the user.
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
