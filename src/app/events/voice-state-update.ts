import { VoiceState } from 'discord.js';
import { DiscordEvent } from '@app/models/discord/discord-event';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VoiceStateUpdateEvent implements DiscordEvent<'voiceStateUpdate'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {}
}
