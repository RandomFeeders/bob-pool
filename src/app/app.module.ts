import typeOrmOptions from './services/database/database-config';
import { INestApplicationContext, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandsModule } from './commands/commands.module';
import { EventsModule } from './events/events.module';
import { DiscordBot } from './services/discord/discord-bot';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ServicesModule } from './services/services.module';
import { LocaleService } from './services/locale/locale.service';
import { LoggerModule } from '@library/log/nest/nest-logger.module';

@Module({
    imports: [
        LoggerModule,
        CommandsModule.register(),
        EventsModule,
        ServicesModule,
        TypeOrmModule.forRootAsync({
            useFactory: () => typeOrmOptions,
            dataSourceFactory: async (options) => {
                const dataSource = await new DataSource(options as DataSourceOptions).initialize();
                return dataSource;
            },
        }),
    ],
    providers: [],
    exports: [TypeOrmModule],
})
export class AppModule implements NestModule {
    private app?: INestApplicationContext;

    public constructor(
        private discordBot: DiscordBot,
        private localeService: LocaleService
    ) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async configure(consumer: MiddlewareConsumer) {}

    public initialize(app: INestApplicationContext): void {
        if (!this.app) this.app = app;
    }

    public async start(): Promise<void> {
        if (!this.app) return;

        const commandsModule = this.app.get<CommandsModule>(CommandsModule);
        await commandsModule.initialize(this.app, this.discordBot);

        const eventsModule = this.app.get<EventsModule>(EventsModule);
        await eventsModule.initialize(this.discordBot);

        await this.discordBot.start();
    }
}
