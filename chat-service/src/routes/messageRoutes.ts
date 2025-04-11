import { RequestHandler, Router } from 'express';
import { getConversation, send } from '../controllers/MessageControllers';
import { authMiddleware } from '../middleware';

const messageRoutes = Router();

messageRoutes.post("/send", authMiddleware as unknown as RequestHandler, send  as unknown as RequestHandler);
messageRoutes.get("/get/:receiverId", authMiddleware as unknown as RequestHandler, getConversation as unknown as RequestHandler);

export default messageRoutes;