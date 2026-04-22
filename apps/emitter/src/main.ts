import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'jokes_commands',
      queueOptions: { durable: false },
    },
  });
  await app.listen();
  console.log('Emitter listening on jokes_commands queue');
}

bootstrap();
