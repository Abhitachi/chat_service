import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { IUser, User } from '../database';
import { ApiError, encryptPassword, isPasswordMatch } from '../utils';
const jwtSecret = config.JWT_SECRET as string;
const COOKIE_EXPIRATION_DAYS = 90;
const expirationDate = new Date(
    Date.now() + COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
);
const cookieOptions = {
    expires: expirationDate,
    secure: false,
    httpOnly: true,
}

export const register = async (req: Request, res: Response) : Promise<void>  => {
    try{
        const {name, email, password} = req.body;
        console.log(req.body, 'here is the body');
        const userExist = await User.findOne({email});
        if(userExist){
            throw new ApiError(400, "User already exists");
        }
        const user = await User.create({
            name, 
            email,
            password: await encryptPassword(password),
        });

        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
        }
        res.json({
            status: 200,
            message: "User created successfully",
            data: userData,
        })
    }catch(error : any){
        console.error(error);
        res.json({
            status: 500,
            message: error.message,
        });
    }
}

const createSendToken = async (user: IUser, res: Response) => {
    const {name, email, id} = user;
    const token = jwt.sign({name, email, id}, jwtSecret, {
        expiresIn: "1d",
    })
    if(config.env === "production") cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);

    return token;
}

export const login = async (req: Request, res: Response) : Promise<void> => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email}).select("+password");
        if(!user || !(await isPasswordMatch(password, user.password as string))){
            throw new ApiError(401, "Incorrect email or password");
        }
        const token = await createSendToken(user!, res);
        res.json({
            status: 200,
            message: "user logged in successfully",
            token,
        })
    }catch(error : any){
        console.error(error);
        res.json({
            status: 500,
            message: error.message,
        })
    }
}


