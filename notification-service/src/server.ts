import express, {Express} from 'express';
import {Server} from 'http';
import {errorConvertor, errorHandler} from './middleware';
import config from './config/config';
import {rabbitMQService} from './services/RabbitMQService';
import { error } from 'console';

const app: Express = express();
let server: Server;
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(errorConvertor);
app.use(errorHandler);

server = app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
})

const initializeRabbitMQ = async () => {
    try{
        await rabbitMQService.init();
        console.log("RabbitMQ initialized successfully");
    }catch(error){
        console.error("Error initializing RabbitMQ", error);
    }
}
initializeRabbitMQ();

