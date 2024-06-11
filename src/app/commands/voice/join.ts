import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/app/models/discord/discord-command';
import { LocalizedError } from '@app/app/models/locale/localized-error';
import { DiscordVoiceService } from '@app/app/services/discord/discord-voice';
import { LocaleService } from '@app/app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class JoinCommand implements DiscordCommand {
    public name: string = 'join';
    public category = DiscordCommandCategory.VOICE;

    public constructor(
        private localeService: LocaleService,
        private voiceService: DiscordVoiceService
    ) {}

    public async execute(interaction: DiscordInteraction): Promise<void> {
        if (this.voiceService.hasVoiceData(interaction.guildId!)) throw new LocalizedError('already_in_voice');

        this.voiceService.setVoiceData(interaction);

        await interaction.reply({
            content: this.localeService.translate('commands.join.data.join_message', interaction.member.locale),
            ephemeral: true,
        });
    }
}
