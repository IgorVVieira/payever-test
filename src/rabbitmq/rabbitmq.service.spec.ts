import { RabbitMQService } from './rabbitmq.service';
import { connect, Connection, Channel } from 'amqplib';

jest.mock('amqplib');

describe('RabbitMQService', () => {
  let rabbitMQService: RabbitMQService;
  let mockConnection: Connection;
  let mockChannel: Channel;

  beforeEach(async () => {
    rabbitMQService = new RabbitMQService();
    mockChannel = {
      assertExchange: jest.fn(),
      publish: jest.fn(),
      close: jest.fn(),
    } as unknown as Channel;
    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn(),
    } as unknown as Connection;
    (connect as jest.Mock).mockImplementation(() =>
      Promise.resolve(mockConnection),
    );
    await rabbitMQService.initialize();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await rabbitMQService.closeConnection();
  });

  describe('sendEvent', () => {
    it('should send an event via RabbitMQ', async () => {
      const exchange = 'test_exchange';
      const routingKey = 'test_routing_key';
      const data = { message: 'Test message' };

      await rabbitMQService.sendEvent(exchange, routingKey, data);

      expect(connect).toHaveBeenCalledTimes(1);
      expect(mockConnection.createChannel).toHaveBeenCalledTimes(1);
      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        exchange,
        'direct',
        { durable: true },
      );
      expect(mockChannel.publish).toHaveBeenCalledWith(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(data)),
      );
      expect(mockChannel.close).toHaveBeenCalledTimes(1);
    });
  });
});
