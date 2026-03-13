import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Proxy & Security
  app.set('trust proxy', 1);

  // 2. Global Prefix & Versioning
  // This makes your URLs look like: https://api.com/api/v1/users
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 3. Global Validation (ONLY NEEDED ONCE)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 4. CORS Configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

  app.enableCors({
    origin: (origin, callback) => {
      // Logic: Allow if no origin (server-to-server) or if in our whitelist
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Helpful for debugging: tells you which origin was blocked
        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS policy'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 API running on port ${port}`);
}
bootstrap();
