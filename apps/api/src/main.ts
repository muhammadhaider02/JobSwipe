import 'dotenv/config';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
    methods: 'GET,POST,PATCH,DELETE,OPTIONS',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const flat = errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
          children: e.children?.length
            ? e.children.map((c) => ({
                property: c.property,
                constraints: c.constraints,
              }))
            : undefined,
        }));
        console.error('[ValidationError]', JSON.stringify(flat, null, 2));
        return new BadRequestException({
          message: 'Validation failed',
          errors: flat,
        });
      },
    }),
  );
  const port = process.env.PORT ? Number(process.env.PORT) : 3002;
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
}
void bootstrap();

// import 'dotenv/config';
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
//   app.enableCors({
//     origin: ['http://localhost:3000'],
//     methods: 'GET,POST,PATCH,DELETE,OPTIONS',
//     allowedHeaders: 'Content-Type,Authorization',
//     credentials: false,
//   });
//   await app.listen(process.env.PORT ?? 3002);
// }
// void bootstrap();
