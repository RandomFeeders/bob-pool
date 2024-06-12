import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/models/discord/discord-command';
import { LocalizedError } from '@app/models/locale/localized-error';
import { DiscordVoiceService } from '@app/services/discord/discord-voice';
import { LocaleService } from '@app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class ContinueCommand implements DiscordCommand {
    public name: string = 'continue';
    public category = DiscordCommandCategory.VOICE;

    public constructor(
        private localeService: LocaleService,
        private voiceService: DiscordVoiceService
    ) {}

    public async execute(interaction: DiscordInteraction): Promise<void> {
        const hasVoiceData = this.voiceService.hasVoiceData(interaction.guildId!);
        const voiceData = hasVoiceData
            ? this.voiceService.getVoiceData(interaction.guildId!)!
            : await this.voiceService.setVoiceData(interaction);

        voiceData.play().catch((err) => {
            throw err;
        });

        await interaction.reply({
            content: this.localeService.translate('commands.continue.data.success_message', interaction.member.locale),
            ephemeral: true,
        });
    }
}
