import { DiscordInteraction, DiscordSubCommand } from '@app/models/discord/discord-command';
import { DiscordCommandStringOption } from '@app/models/discord/discord-command-options';
import { LocalizedError } from '@app/models/locale/localized-error';
import { BasePlayCommand } from '@app/models/voice/base-play-command';
import { DiscordVoiceService } from '@app/services/discord/discord-voice';
import { LocaleService } from '@app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class PlayNextCommand extends BasePlayCommand implements DiscordSubCommand {
    public name: string = 'next';
    public parent: string = 'play';
    public options = [new DiscordCommandStringOption('query', true)];

    public constructor(localeService: LocaleService, voiceService: DiscordVoiceService) {
        super(localeService, voiceService);
    }

    public async execute(interaction: DiscordInteraction): Promise<void> {
        if (!this.voiceService.hasVoiceData(interaction.guildId!)) throw new LocalizedError('not_in_voice_yet');

        const rawQuery = interaction.options.get('query')?.value;
        if (!rawQuery || typeof rawQuery !== 'string')
            throw new Error('Something went wrong while trying to get command options');

        const voiceData = this.voiceService.getVoiceData(interaction.guildId!)!;
        const query = await this.voiceService.identifyQuery(rawQuery);

        voiceData.enqueue(query, interaction.member.data, true);
        if (!voiceData.isPlaying)
            voiceData.play().catch((err) => {
                throw err;
            });

        await interaction.reply({
            embeds: [this.getResponseEmbed(interaction, query)],
            ephemeral: true,
        });
    }
}
