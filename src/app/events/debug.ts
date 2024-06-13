import { Injectable } from '@nestjs/common';
import { DiscordEvent } from '@app/models/discord/discord-event';
import { Logger } from '@library/log/logger';

@Injectable()
@DiscordEvent('debug')
export class DebugEvent implements DiscordEvent<'debug'> {
    public async execute(message: string): Promise<void> {
        Logger.debug(message, 'Discord');
    }
}
