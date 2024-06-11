import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/models/discord/discord-command';
import { DiscordCommandOptionBase, DiscordCommandStringOption } from '@app/models/discord/discord-command-options';
import { LocalizedError } from '@app/models/locale/localized-error';
import { VoiceDataLoop } from '@app/services/database/entities/voice-data.entity';
import { DiscordVoiceService } from '@app/services/discord/discord-voice';
import { LocaleService } from '@app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LoopCommand implements DiscordCommand {
    public name: string = 'loop';
    public category = DiscordCommandCategory.VOICE;
    public options = [
        new DiscordCommandStringOption('type', true, { choices: { none: 'none', all: 'all', one: 'one' } }),
    ];

    public constructor(
        private localeService: LocaleService,
        private voiceService: DiscordVoiceService
    ) {}

    public async execute(interaction: DiscordInteraction): Promise<void> {
        if (!this.voiceService.hasVoiceData(interaction.guildId!)) throw new LocalizedError('not_in_voice_yet');

        const loopOption = interaction.options.get('type')?.value;
        if (typeof loopOption !== 'string') throw new LocalizedError('');

        const voiceData = this.voiceService.getVoiceData(interaction.guildId!)!;
        voiceData.loop = loopOption as VoiceDataLoop;

        await interaction.reply({
            content: this.localeService.translate('commands.loop.data.success_message', interaction.member.locale, {
                type: this.localeService.translate(
                    `commands.loop.options.type.choices.${loopOption}`,
                    interaction.member.locale
                ),
            }),
            ephemeral: true,
        });
    }
}
