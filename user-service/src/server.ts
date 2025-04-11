import express, { Express } from 'express';
import { Server } from 'http';
import config from './config/config';
import { connectDB } from './database';
import { errorConverter, errorHandler } from './middleware';
import userRouter from './routes/authRoutes';
import { rabbitMQService } from './services/RabbitMQServices';

const app : Express = express();
let server : Server;
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(userRouter);
app.use(errorConverter);
app.use(errorHandler);

connectDB();

server = app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});

const initializeRabbitMQClient = async () => {
    try{
        await rabbitMQService.init();
        console.log("RabbitMQ client initialized");
    }catch(err){
        console.error("Error initializing RabbitMQ client", err);
    }
}

initializeRabbitMQClient();

const exitHandler = () => {
    if(server){
        server.close(() => {
            console.info("server closed");
            process.exit(1);
        })
    }else{
        process.exit(1);
    }
}

const unexpectedErrorHandler = (error: unknown) => {
    console.error("Unexpected error", error);
    exitHandler();
}
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);
process.on("SIGTERM", () => {
    console.info("SIGTERM signal received");
    if(server){
        server.close();
    }
})


