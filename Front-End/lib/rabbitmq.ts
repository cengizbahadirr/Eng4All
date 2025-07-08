import * as amqp from 'amqplib';

// Helper types to infer connection and channel from the library itself
type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;
type AmqpChannel = Awaited<ReturnType<AmqpConnection['createChannel']>>;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

let connection: AmqpConnection | null = null;
let channel: AmqpChannel | null = null;

export async function connectToRabbitMQ() {
  if (connection && channel) {
    return { connection, channel };
  }
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
    return { connection, channel };
  } catch (error) {
    console.error('Failed to connect to RabbitMQ', error);
    connection = null;
    channel = null;
    throw error;
  }
}

export async function sendMessage(queue: string, message: string) {
  if (!channel) {
    await connectToRabbitMQ();
  }
  if (channel) {
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
    console.log(`Sent message to queue ${queue}: ${message}`);
  } else {
    throw new Error('RabbitMQ channel is not available.');
  }
}

export async function closeRabbitMQConnection() {
    if (channel) {
        await channel.close();
        channel = null;
    }
    if (connection) {
        await connection.close();
        connection = null;
    }
    console.log('RabbitMQ connection closed.');
}
