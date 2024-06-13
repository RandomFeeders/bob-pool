import { VoiceState } from 'discord.js';
import { DiscordEvent } from '@app/models/discord/discord-event';
import { Injectable } from '@nestjs/common';
import { DiscordVoiceService } from '@app/services/discord/discord-voice';
import { LocaleService } from '@app/services/locale/locale.service';

const VOICE_IDLE_TIMEOUT = 120000;

@Injectable()
@DiscordEvent('voiceStateUpdate')
export class VoiceStateUpdateEvent implements DiscordEvent<'voiceStateUpdate'> {
    public constructor(
        private localeService: LocaleService,
        private voiceService: DiscordVoiceService
    ) {}

    private async handleIdleTimeout(oldState: VoiceState, newState: VoiceState): Promise<void> {
        if (!this.voiceService.hasVoiceData(oldState.guild.id)) return;
        const voiceData = this.voiceService.getVoiceData(oldState.guild.id)!;

        if (oldState.channelId !== voiceData.voiceChannel.id || newState.channelId === voiceData.voiceChannel.id)
            return;

        if (!voiceData.voiceChannel.members.every((member) => member.user.bot)) return;

        setTimeout(async () => {
            if (!voiceData.voiceChannel.members.every((member) => member.user.bot)) return;

            this.localeService.translate('messages.idle_voice_timeout', oldState.guild.preferredLocale);
            await voiceData.textChannel.send('Eu vou embora! Já faz 2 minutos que estou sozinho 😭');
            voiceData.stop();
        }, VOICE_IDLE_TIMEOUT);
    }

    public async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
        await this.handleIdleTimeout(oldState, newState);
    }
}
