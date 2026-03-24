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
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

      // Check for exact match (localhost, main domain)
      const isWhitelisted = !origin || allowedOrigins.includes(origin);

      // Check for subdomain match (*.edusmartix.com)
      const isSubdomain =
        origin &&
        (origin.endsWith('.edusmartix.com') ||
          origin.endsWith('.edusmartix.com/')); // handle trailing slashes

      if (isWhitelisted || isSubdomain) {
        callback(null, true);
      } else {
        console.log('🚫 Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS policy'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Required because you're now using cookies for the Token!
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 API running on port ${port}`);
}
bootstrap();
