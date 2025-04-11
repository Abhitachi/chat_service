import express, { Express } from 'express';
import { errorConverter, errorHandler } from './middleware';
import messageRoutes from './routes/messageRoutes';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(messageRoutes);
app.use(errorConverter);
app.use(errorHandler);

export default app;