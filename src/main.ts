import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { CustomNestLogger } from '@library/log/nest/nest-logger.service';

(async function () {
    const app = await NestFactory.createApplicationContext(AppModule, { bufferLogs: true });
    app.useLogger(app.get(CustomNestLogger));

    const module = app.get<AppModule>(AppModule);
    module.initialize(app);
    await module.start();
})();
