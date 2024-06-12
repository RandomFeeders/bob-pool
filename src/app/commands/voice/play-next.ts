import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/models/discord/discord-command';
import { DiscordCommandStringOption } from '@app/models/discord/discord-command-options';
import { LocalizedError } from '@app/models/locale/localized-error';
import { DiscordVoiceService } from '@app/services/discord/discord-voice';
import { LocaleService } from '@app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';
import { Colors, EmbedBuilder } from 'discord.js';

@Injectable({ scope: Scope.TRANSIENT })
export class PlayNextCommand implements DiscordCommand {
    public name: string = 'playnext';
    public category = DiscordCommandCategory.VOICE;
    public options = [new DiscordCommandStringOption('query', true)];

    public constructor(
        private localeService: LocaleService,
        private voiceService: DiscordVoiceService
    ) {}

    public async execute(interaction: DiscordInteraction): Promise<void> {
        if (!this.voiceService.hasVoiceData(interaction.guildId!)) throw new LocalizedError('not_in_voice_yet');
        
        const rawQuery = interaction.options.get('query')?.value;
        if (!rawQuery || typeof rawQuery !== 'string')
            throw new Error('Something went wrong while trying to get command options');

        const voiceData = this.voiceService.getVoiceData(interaction.guildId!)!;
        const query = await this.voiceService.identifyQuery(rawQuery);

        voiceData.enqueue(query, interaction.member.data, true);
        voiceData.play().catch((err) => {
            throw err;
        });

        const response = new EmbedBuilder({
            title: this.localeService.translate('commands.playnext.data.embed_title', interaction.member.locale),
            description: query.toString(),
            color: Colors.Green,
            footer: {
                text: this.localeService.translate('commands.playnext.data.embed_footer', interaction.member.locale, {
                    tag: interaction.member.user.tag,
                }),
                iconURL: interaction.member.user.avatarURL({ forceStatic: true })!,
            },
        });

        await interaction.reply({
            embeds: [response],
            ephemeral: true,
        });
    }
}
