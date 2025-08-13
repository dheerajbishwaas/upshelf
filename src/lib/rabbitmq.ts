// import amqp from 'amqplib';

// let channel: amqp.Channel | null = null;

// export async function connectRabbitMQ() {
//   if (channel) return channel;

//   const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
//   channel = await connection.createChannel();
//   console.log('✅ RabbitMQ connected');
//   return channel;
// }

// export async function publishToQueue(queueName: string, message: any) {
//   const ch = await connectRabbitMQ();
//   await ch.assertQueue(queueName, { durable: true });
//   ch.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
// }
