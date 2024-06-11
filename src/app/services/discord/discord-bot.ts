import { Injectable } from '@nestjs/common';
import { Client, Routes, SlashCommandBuilder } from 'discord.js';
import { DiscordCache } from '../../models/discord/discord-cache';
import { DISCORD_BOT_INTENTS } from './discord-consts';
import { DiscordCommand, DiscordCommandBuilder } from '../../models/discord/discord-command';
import { LocaleService } from '../locale/locale.service';

@Injectable()
export class DiscordBot extends Client {
    private availableLocales: string[] = [];

    public cache: DiscordCache;
    public commands: { [key: string]: DiscordCommand };

    public constructor(private localeService: LocaleService) {
        super({ intents: DISCORD_BOT_INTENTS });

        this.cache = new DiscordCache();
        this.commands = {};
    }

    private getLocalizedData(key: string): { [key: string]: string } {
        return this.availableLocales.reduce(
            (acc, locale) => {
                acc[locale] = this.localeService.translate(key, locale);
                return acc;
            },
            {} as { [key: string]: string }
        );
    }

    public async flushCommands(): Promise<void> {
        this.availableLocales = this.localeService.availableLocales;

        const slashCommands = [];
        for (const commandKey in this.commands) {
            const slashCommand = new DiscordCommandBuilder();

            const localizedNames = this.getLocalizedData(`commands.${commandKey}.name`);
            const localizedDescriptions = this.getLocalizedData(`commands.${commandKey}.description`);

            slashCommand.setName(localizedNames['en-US']);
            slashCommand.setNameLocalizations(localizedNames);
            slashCommand.setDescription(localizedDescriptions['en-US']);
            slashCommand.setDescriptionLocalizations(localizedDescriptions);

            slashCommand.guildExclusive = this.commands[commandKey].guildExclusive ?? true;

            slashCommands.push(slashCommand);
        }

        const guildExclusiveCommands = slashCommands.filter(slashCommand => !!slashCommand.guildExclusive);
        const otherCommands = slashCommands.filter(slashCommand => !slashCommand.guildExclusive);

        await this.application?.commands.set(otherCommands);

        for (const [, guild] of this.guilds.cache) {
            await guild.commands.set([...guildExclusiveCommands, ...otherCommands]);
        }
    }

    public async start(): Promise<string> {
        return await this.login(process.env.DISCORD_TOKEN);
    }
}
