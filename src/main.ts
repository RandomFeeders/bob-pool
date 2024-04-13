import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

(async function () {
    const app = await NestFactory.createApplicationContext(AppModule);
    const module = app.get<AppModule>(AppModule);
    module.initialize(app);
    await module.start();
})();
