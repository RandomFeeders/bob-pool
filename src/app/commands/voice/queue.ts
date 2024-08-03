import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/models/discord/discord-command';
import { LocalizedError } from '@app/models/locale/localized-error';
import { DiscordVoiceService } from '@app/services/discord/discord-voice';
import { LocaleService } from '@app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, ComponentType, EmbedBuilder } from 'discord.js';

const MAX_EMBED_DESCRIPTION_LENGTH = 4096;
const COLLECTOR_TIMEOUT = 120000;

@Injectable({ scope: Scope.TRANSIENT })
export class QueueCommand implements DiscordCommand {
    public name: string = 'queue';
    public category = DiscordCommandCategory.VOICE;

    public constructor(
        private localeService: LocaleService,
        private voiceService: DiscordVoiceService
    ) {}

    private getBackButton(locale: string): ButtonBuilder {
        return new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel(this.localeService.translate('commands.queue.data.button_back', locale))
            .setEmoji('⬅️')
            .setCustomId('back');
    }

    private getForwardButton(locale: string): ButtonBuilder {
        return new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel(this.localeService.translate('commands.queue.data.button_forward', locale))
            .setEmoji('➡️')
            .setCustomId('forward');
    }

    public async execute(interaction: DiscordInteraction): Promise<void> {
        if (!this.voiceService.hasVoiceData(interaction.guildId!)) throw new LocalizedError('not_in_voice_yet');

        const voiceData = this.voiceService.getVoiceData(interaction.guildId!)!;

        const queueEmbed = new EmbedBuilder({
            title: this.localeService.translate('commands.queue.data.embed_title', interaction.member.locale),
            color: Colors.Grey,
        });

        if (voiceData.queue.length === 0) {
            queueEmbed.setDescription(
                this.localeService.translate('commands.queue.data.embed_description', interaction.member.locale)
            );

            await interaction.reply({
                embeds: [queueEmbed],
                ephemeral: true,
            });

            return;
        }

        const paddingSize = voiceData.queue.length.toString().length;
        const pages = voiceData.queue.reduce<string[]>(
            (acc, track, index) => {
                const line = `\`${(index + 1).toString().padStart(paddingSize, '0')}\`. ${track}\n`;

                if (acc[acc.length - 1].length + line.length > MAX_EMBED_DESCRIPTION_LENGTH) {
                    acc[acc.length - 1] = acc[acc.length - 1].slice(0, -1);
                    acc.push(line);
                    return acc;
                }

                acc[acc.length - 1] += line;
                return acc;
            },
            ['']
        );

        queueEmbed.setDescription(pages[0]);

        if (pages.length === 1) {
            await interaction.reply({
                embeds: [queueEmbed],
                ephemeral: true,
            });

            return;
        }

        const actionRowBuilder = new ActionRowBuilder<ButtonBuilder>().addComponents(
            this.getForwardButton(interaction.member.locale)
        );

        const sentMessage = await interaction.reply({
            embeds: [queueEmbed],
            components: [actionRowBuilder],
            ephemeral: true,
        });

        const responseCollector = sentMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: COLLECTOR_TIMEOUT,
            filter: (buttonInteraction) => buttonInteraction.user.id === interaction.user.id,
        });

        let currentPageIndex = 0;
        responseCollector.on('collect', async (buttonInteraction) => {
            buttonInteraction.customId === 'back' ? currentPageIndex-- : currentPageIndex++;

            queueEmbed.setDescription(pages[currentPageIndex]);
            const newActionRowBuilder = new ActionRowBuilder<ButtonBuilder>();

            if (currentPageIndex > 0) newActionRowBuilder.addComponents(this.getBackButton(interaction.member.locale));
            if (currentPageIndex < pages.length - 1)
                newActionRowBuilder.addComponents(this.getForwardButton(interaction.member.locale));

            await buttonInteraction.update({
                embeds: [queueEmbed],
                components: [newActionRowBuilder],
            });
        });
    }
}
