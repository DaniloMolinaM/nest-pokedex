import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Se asigna un pre fijo a la URL a Invocar: ejemplo http://localhost:3000/api/pokemon
  app.setGlobalPrefix('api/v2')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, 
      transformOptions:{
        enableImplicitConversion:true,
      }

    })
  );
  
  await app.listen( process.env.PORT );
  console.log(`App runnig on port ${process.env.PORT}`)
}
bootstrap();
