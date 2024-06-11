import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/app/models/discord/discord-command';
import { LocaleService } from '@app/app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';
import { Colors, EmbedBuilder } from 'discord.js';

@Injectable({ scope: Scope.TRANSIENT })
export class HelpCommand implements DiscordCommand {
    public name: string = 'help';
    public category = DiscordCommandCategory.INFORMATIVE;

    public constructor(private localeService: LocaleService) {}

    public async execute(interaction: DiscordInteraction): Promise<void> {
        const commands = Object.values(interaction.client.commands);

        const commandsByCategory = commands.reduce(
            (acc, value) => {
                acc[value.category] ??= [];
                acc[value.category].push(value);
                return acc;
            },
            {} as { [key: string]: DiscordCommand[] }
        );

        const embed = new EmbedBuilder({
            title: this.localeService.translate('commands.help.data.title', interaction.member.locale),
            description: this.localeService.translate('commands.help.data.description', interaction.member.locale),
            color: Colors.DarkRed,
        });

        for (const category in commandsByCategory) {
            const categoryName = this.localeService.translate(category, interaction.member.locale);

            embed.addFields({
                name: categoryName[0].toUpperCase() + categoryName.slice(1),
                value: commandsByCategory[category].map((command) => `\`${command.name}\``).join(', '),
            });
        }

        await interaction.reply({ embeds: [embed.data] });
    }
}
