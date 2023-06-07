import { Injectable } from '@nestjs/common';
import { connect, Connection, Channel } from 'amqplib';
import 'dotenv/config';

@Injectable()
export class RabbitMQService {
  private connection: Connection;
  private channel: Channel;

  async initialize(): Promise<void> {
    try {
      this.connection = await connect(process.env.RABBITMQ_URI);
      this.channel = await this.connection.createChannel();
    } catch (error) {
      console.error('Error connecting to RabbitMQ', error);
    }
  }

  async sendEvent(
    exchange: string,
    routingKey: string,
    data: any,
  ): Promise<void> {
    try {
      if (!this.channel) await this.initialize();
      await this.channel.assertExchange(exchange, 'direct', { durable: true });
      this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(data)),
      );
    } catch (error) {
      console.error('Error sending event to RabbitMQ', error);
    }
  }

  async closeConnection(): Promise<void> {
    try {
      await this.channel.close();
      await this.connection.close();
    } catch (error) {
      console.error('Error closing RabbitMQ connection', error);
    }
  }
}
