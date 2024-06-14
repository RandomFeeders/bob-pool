import { DiscordVoiceService } from '@app/services/discord/discord-voice';
import { LocaleService } from '@app/services/locale/locale.service';
import { Colors, EmbedBuilder } from 'discord.js';
import { DiscordInteraction } from '../discord/discord-command';
import { DiscordVoiceQuery } from '../discord/discord-voice-query';

export abstract class BasePlayCommand {
    public constructor(
        protected localeService: LocaleService,
        protected voiceService: DiscordVoiceService
    ) {}

    protected getResponseEmbed(interaction: DiscordInteraction, query: DiscordVoiceQuery): EmbedBuilder {
        const titleKey = query.subtype === 'track' ? 'embed_track_title' : 'embed_playlist_title';
        const embedBuilder = new EmbedBuilder({
            title: this.localeService.translate(`commands.play.data.${titleKey}`, interaction.member.locale),
            color: Colors.Green,
            footer: {
                text: this.localeService.translate('commands.play.data.embed_footer', interaction.member.locale, {
                    tag: interaction.member.user.tag,
                }),
                iconURL: interaction.member.user.avatarURL({ forceStatic: true })!,
            },
        });

        if (query.subtype === 'track') {
            embedBuilder.setDescription(query.toString());
            return embedBuilder;
        }

        embedBuilder.setDescription(
            this.localeService.translate(`commands.play.data.embed_playlist_description`, interaction.member.locale, {
                playlist: query.toString(),
                count: query.trackCount,
            })
        );

        return embedBuilder;
    }
}
