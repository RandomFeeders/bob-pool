import { Module } from '@nestjs/common';
import { CommandHandler } from './command-handler';
import { DebugEvent } from './debug';
import { ReadyEvent } from './ready';
import { VoiceStateUpdateEvent } from './voice-state-update';
import { DiscordBot } from '../services/discord/discord-bot';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from '../services/database/entities/activity.entity';
import { ServicesModule } from '../services/services.module';

const events = [CommandHandler, DebugEvent, ReadyEvent, VoiceStateUpdateEvent];

@Module({
    imports: [TypeOrmModule.forFeature([Activity]), ServicesModule],
    providers: [...events],
    exports: [...events, TypeOrmModule],
})
export class EventsModule {
    public constructor(
        private commandHandler: CommandHandler,
        private debugEvent: DebugEvent,
        private readyEvent: ReadyEvent,
        private voiceStateUpdateEvent: VoiceStateUpdateEvent
    ) {}

    public async initialize(discordBot: DiscordBot): Promise<void> {
        discordBot.on('debug', (...args) => this.debugEvent.execute(...args));
        discordBot.on('ready', (...args) => this.readyEvent.execute(...args));
        discordBot.on('interactionCreate', (...args) => this.commandHandler.execute(...args));
        discordBot.on('voiceStateUpdate', (...args) => this.voiceStateUpdateEvent.execute(...args));
    }
}
