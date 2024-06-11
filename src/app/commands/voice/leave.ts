import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/models/discord/discord-command';
import { DiscordVoiceService } from '@app/services/discord/discord-voice';
import { LocaleService } from '@app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LeaveCommand implements DiscordCommand {
    public name: string = 'leave';
    public category = DiscordCommandCategory.VOICE;

    public constructor(
        private localeService: LocaleService,
        private voiceService: DiscordVoiceService
    ) {}

    public async execute(interaction: DiscordInteraction): Promise<void> {
        this.voiceService.clearVoiceData(interaction);

        await interaction.reply({
            content: this.localeService.translate('commands.leave.data.leave_message', interaction.member.locale),
            ephemeral: true,
        });
    }
}
