import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/models/discord/discord-command';
import { DiscordCommandStringOption } from '@app/models/discord/discord-command-options';
import { DiscordVoiceService } from '@app/services/discord/discord-voice';
import { LocaleService } from '@app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';
import { Colors, EmbedBuilder } from 'discord.js';

@Injectable({ scope: Scope.TRANSIENT })
export class PlayCommand implements DiscordCommand {
    public name: string = 'play';
    public category = DiscordCommandCategory.VOICE;
    public options = [new DiscordCommandStringOption('query', true)];

    public constructor(
        private localeService: LocaleService,
        private voiceService: DiscordVoiceService
    ) {}

    public async execute(interaction: DiscordInteraction): Promise<void> {
        const rawQuery = interaction.options.get('query')?.value;
        if (!rawQuery || typeof rawQuery !== 'string')
            throw new Error('Something went wrong while trying to get command options');

        const voiceData = await this.voiceService.setVoiceData(interaction);
        const query = await this.voiceService.identifyQuery(rawQuery);

        voiceData.enqueue(query, interaction.member.data);
        voiceData.play().catch((err) => {
            throw err;
        });

        const response = new EmbedBuilder({
            title: this.localeService.translate('commands.play.data.embed_title', interaction.member.locale),
            description: query.toString(),
            color: Colors.Green,
            footer: {
                text: this.localeService.translate('commands.play.data.embed_footer', interaction.member.locale, {
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
