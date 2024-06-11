import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/models/discord/discord-command';
import { LocalizedError } from '@app/models/locale/localized-error';
import { DiscordVoiceService } from '@app/services/discord/discord-voice';
import { LocaleService } from '@app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class RestartCommand implements DiscordCommand {
    public name: string = 'restart';
    public category = DiscordCommandCategory.VOICE;

    public constructor(
        private localeService: LocaleService,
        private voiceService: DiscordVoiceService
    ) {}

    public async execute(interaction: DiscordInteraction): Promise<void> {
        if (!this.voiceService.hasVoiceData(interaction.guildId!)) throw new LocalizedError('not_in_voice_yet');

        const voiceData = this.voiceService.getVoiceData(interaction.guildId!)!;
        voiceData.play();

        await interaction.reply({
            content: this.localeService.translate('commands.restart.data.success_message', interaction.member.locale),
            ephemeral: true,
        });
    }
}
