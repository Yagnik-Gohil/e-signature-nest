import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AllExceptionsFilter } from './shared/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 3000;
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.setGlobalPrefix('api');
  app.enableCors();
  app.enable('trust proxy', true);

  // Apply the filter globally
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(+port);
}
bootstrap();
