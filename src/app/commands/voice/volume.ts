import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/models/discord/discord-command';
import { DiscordCommandIntegerOption } from '@app/models/discord/discord-command-options';
import { LocalizedError } from '@app/models/locale/localized-error';
import { DiscordVoiceService } from '@app/services/discord/discord-voice';
import { LocaleService } from '@app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class VolumeCommand implements DiscordCommand {
    public name: string = 'volume';
    public category = DiscordCommandCategory.VOICE;
    public options = [new DiscordCommandIntegerOption('value', true, { min: 1, max: 200 })];

    public constructor(
        private localeService: LocaleService,
        private voiceService: DiscordVoiceService
    ) {}

    public async execute(interaction: DiscordInteraction): Promise<void> {
        if (!this.voiceService.hasVoiceData(interaction.guildId!)) throw new LocalizedError('not_in_voice_yet');

        const volumeOption = interaction.options.get('value')?.value;
        if (typeof volumeOption !== 'number' || volumeOption < 1 || volumeOption > 200)
            throw new LocalizedError('invalid_command_option');

        const voiceData = this.voiceService.getVoiceData(interaction.guildId!)!;

        voiceData.volume = volumeOption;

        await interaction.reply({
            content: this.localeService.translate('commands.volume.data.success_message', interaction.member.locale, {
                value: volumeOption,
            }),
            ephemeral: true,
        });
    }
}
