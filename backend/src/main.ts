import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();
  app.setGlobalPrefix('api');

  // Enable global validation pipe for DTOs
  app.useGlobalPipes(new ValidationPipe());

  // Enable global serialization interceptor for `@Exclude` decorator
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Trinity API')
    .setDescription('Documentation of the Trinity API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);

  // Start the application
  await app.listen(process.env.PORT ?? 4000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 4000}`,
  );
}
bootstrap();
