import amqp, { Channel } from 'amqplib';
import config from '../config/config';
import { User } from '../database';
import { ApiError } from '../utils';

class RabbitMQService {
    private requestQueue = "USER_DETAILS_REQUEST";
    private responseQueue = "USER_DETAILS_RESPONSE";
    private connection: amqp.ChannelModel | undefined;
    private channel: Channel | null = null;

    constructor() {
        this.init().catch(console.error);
    }

    async init(): Promise<void> {
        try {
            // Correct connection - no type assertion needed
            this.connection = await amqp.connect(config.msgBrokerURL!);
            
            // Channel creation remains the same
            this.channel = await this.connection.createChannel();
            
            await this.channel.assertQueue(this.requestQueue);
            await this.channel.assertQueue(this.responseQueue);
            
            this.listenForRequests();
        } catch (error) {
            console.error('RabbitMQ initialization failed:', error);
            throw error;
        }
    }

    private listenForRequests(): void {
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }

        this.channel.consume(this.requestQueue, async (msg) => {
            if (!msg) return;

            try {
                const content = msg.content.toString();
                const { userId } = JSON.parse(content);
                
                const userDetails = await this.getUserDetails(userId);
                
                this.channel?.sendToQueue(
                    this.responseQueue,
                    Buffer.from(JSON.stringify(userDetails)),
                    { correlationId: msg.properties.correlationId }
                );
                
                if (this.channel) {
                    this.channel.ack(msg);
                }
            } catch (error) {
                console.error('Error processing message:', error);
                if (this.channel) {
                    this.channel.nack(msg); // Negative acknowledgement
                }
            }
        });
    }

    private async getUserDetails(userId: string) {
        const userDetails = await User.findById(userId).select("-password");
        if (!userDetails) {
            throw new ApiError(404, "User not found");
        }
        return userDetails;
    }
}

export const rabbitMQService = new RabbitMQService();