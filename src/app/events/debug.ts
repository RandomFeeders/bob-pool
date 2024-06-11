import { Injectable } from '@nestjs/common';
import { DiscordEvent } from '../models/discord/discord-event';
import { Logger } from '../services/logger';

@Injectable()
export class DebugEvent implements DiscordEvent<'debug'> {
    public async execute(message: string): Promise<void> {
        Logger.debug(message, 'Discord');
    }
}
