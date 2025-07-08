// This is a standalone script to be run with ts-node or similar
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import amqp from 'amqplib';
import dbConnect from '../lib/mongodb';
import UserModel from '../models/User';
import mongoose from 'mongoose';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const ACTIVITY_LOG_QUEUE = 'activity_log_queue';

async function startConsumer() {
  console.log('Starting activity log consumer...');
  
  try {
    await dbConnect();
    console.log('Database connected.');

    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(ACTIVITY_LOG_QUEUE, { durable: true });

    console.log(`[*] Waiting for messages in ${ACTIVITY_LOG_QUEUE}. To exit press CTRL+C`);

    channel.consume(ACTIVITY_LOG_QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          const messageContent = msg.content.toString();
          console.log(`[x] Received '${messageContent}'`);
          const { userId, durationInSeconds } = JSON.parse(messageContent);

          if (!userId || typeof durationInSeconds !== 'number' || durationInSeconds <= 0) {
            console.error('Invalid message format, skipping:', messageContent);
            channel.ack(msg); // Acknowledge to remove from queue
            return;
          }

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const updateResult = await UserModel.updateOne(
            { _id: userId, "dailyActivity.date": today },
            { $inc: { "dailyActivity.$.durationInSeconds": durationInSeconds } }
          );

          if (updateResult.matchedCount === 0) {
            await UserModel.updateOne(
              { _id: userId },
              { 
                $push: { 
                  dailyActivity: { 
                    date: today, 
                    durationInSeconds: durationInSeconds 
                  } 
                } 
              }
            );
          }
          console.log(`Activity log for user ${userId} updated successfully.`);
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          // In a real-world scenario, you might want to nack(msg, false, true) to requeue
          // or send to a dead-letter queue. For simplicity, we'll just ack it.
          if (msg) {
            channel.ack(msg);
          }
        }
      }
    }, { noAck: false }); // Manual acknowledgment

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Caught interrupt signal, shutting down...');
      await channel.close();
      await connection.close();
      await mongoose.disconnect();
      console.log('Consumer shut down gracefully.');
      process.exit(0);
    });

  } catch (error) {
    console.error('Consumer failed to start:', error);
    process.exit(1);
  }
}

startConsumer();
