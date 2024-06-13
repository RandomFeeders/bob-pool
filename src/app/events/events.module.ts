import { DynamicModule, INestApplicationContext, Module, Provider } from '@nestjs/common';
import { DiscordBot } from '@app/services/discord/discord-bot';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from '@app/services/database/entities/activity.entity';
import { ServicesModule } from '@app/services/services.module';
import { resolve } from 'path';
import { glob } from 'glob';
import { DISCORD_EVENT_METADATA, DiscordEvent } from '@app/models/discord/discord-event';

@Module({})
export class EventsModule {
    private static async getEvents(): Promise<Provider[]> {
        const globEvents = await glob('./**/*{.ts,.js}', { cwd: __dirname });
        const result: Provider[] = [];

        for (const globEvent of globEvents) {
            const eventPath = resolve(__dirname, globEvent);
            const event: { [key: string]: Provider } = await import(eventPath);
            result.push(...Object.values(event));
        }

        return result.filter((command) => command != EventsModule);
    }

    public async initialize(app: INestApplicationContext, discordBot: DiscordBot): Promise<void> {
        const events = await EventsModule.getEvents();

        for (const event of events) {
            const metadata = Reflect.getMetadata(DISCORD_EVENT_METADATA, event);
            const instance: DiscordEvent<any> = await app.resolve(event as any);
            discordBot.on(metadata, (...args) => instance.execute(...args));
        }
    }

    public static async register(): Promise<DynamicModule> {
        const events = await this.getEvents();

        return {
            module: EventsModule,
            imports: [TypeOrmModule.forFeature([Activity]), ServicesModule],
            providers: [...events],
            exports: [...events, TypeOrmModule],
        };
    }
}
