import { rabbitMQService } from '../services/RabbitMQService';
import { UserStatusStore } from './userStatusStore';

const userStatusStore = UserStatusStore.getInstance();

export const handleMessageReceived = async (
    senderName: string,
    senderEmail: string,
    receiverId: string,
    messageContent: string
) => {
    const receiverIsOffline = !userStatusStore.isUserOnline(receiverId);
    if(receiverIsOffline){
        await rabbitMQService.notifyReceiver(
            receiverId,
            messageContent,
            senderEmail,
            senderName,
        )
    }
}