import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/models/discord/discord-command';
import { DiscordCommandIntegerOption } from '@app/models/discord/discord-command-options';
import { LocalizedError } from '@app/models/locale/localized-error';
import { DiscordVoiceService } from '@app/services/discord/discord-voice';
import { LocaleService } from '@app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class RemoveCommand implements DiscordCommand {
    public name: string = 'remove';
    public category = DiscordCommandCategory.VOICE;
    public options = [new DiscordCommandIntegerOption('position', true)];

    public constructor(
        private localeService: LocaleService,
        private voiceService: DiscordVoiceService
    ) {}

    public async execute(interaction: DiscordInteraction): Promise<void> {
        if (!this.voiceService.hasVoiceData(interaction.guildId!)) throw new LocalizedError('not_in_voice_yet');

        const positionOption = interaction.options.get('position')?.value;
        if (typeof positionOption !== 'number') throw new LocalizedError('invalid_command_option');

        const voiceData = this.voiceService.getVoiceData(interaction.guildId!)!;

        if (positionOption < -voiceData.queue.length || positionOption > voiceData.queue.length)
            throw new LocalizedError('invalid_command_option');

        const queueIndex = positionOption > 0 ? positionOption - 1 : positionOption;

        if (queueIndex === 0 || queueIndex === -voiceData.queue.length) voiceData.skip(true);
        else voiceData.queue.splice(positionOption, 1);

        await interaction.reply({
            content: this.localeService.translate('commands.remove.data.success_message', interaction.member.locale, {
                position: queueIndex < 0 ? voiceData.queue.length + queueIndex + 1 : queueIndex + 1,
            }),
            ephemeral: true,
        });
    }
}
