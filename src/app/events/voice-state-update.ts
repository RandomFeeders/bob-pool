import { VoiceState } from 'discord.js';
import { DiscordEvent } from '../services/discord/discord-event';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VoiceStateUpdateEvent implements DiscordEvent<'voiceStateUpdate'> {
    execute(oldState: VoiceState, newState: VoiceState): Promise<void> {}
}
