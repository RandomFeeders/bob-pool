import { Injectable } from '@nestjs/common';
import { Client } from 'discord.js';
import { DiscordCache } from '@app/models/discord/discord-cache';
import { DISCORD_BOT_INTENTS } from './discord-consts';
import { DiscordCommand, DiscordCommandBuilder } from '@app/models/discord/discord-command';
import { LocaleService } from '../locale/locale.service';

@Injectable()
export class DiscordBot extends Client {
    public cache: DiscordCache;
    public commands: { [key: string]: DiscordCommand };

    public constructor(private localeService: LocaleService) {
        super({ intents: DISCORD_BOT_INTENTS });

        this.cache = new DiscordCache();
        this.commands = {};
    }

    public async flushCommands(): Promise<void> {
        const slashCommands = [];
        for (const commandKey in this.commands) {
            const slashCommand = new DiscordCommandBuilder(commandKey);

            const localizedNames = this.localeService.getAllTranslations(`commands.${commandKey}.name`);
            const localizedDescriptions = this.localeService.getAllTranslations(`commands.${commandKey}.description`);

            slashCommand.setName(localizedNames['en-US']);
            slashCommand.setNameLocalizations(localizedNames);
            slashCommand.setDescription(localizedDescriptions['en-US']);
            slashCommand.setDescriptionLocalizations(localizedDescriptions);

            slashCommand.setNSFW(this.commands[commandKey].nsfw ?? false);

            this.commands[commandKey].options?.forEach((option) => option.apply(slashCommand, this.localeService));

            slashCommand.guildExclusive = this.commands[commandKey].guildExclusive ?? true;

            slashCommands.push(slashCommand);
        }

        const guildExclusiveCommands = slashCommands.filter((slashCommand) => !!slashCommand.guildExclusive);
        const otherCommands = slashCommands.filter((slashCommand) => !slashCommand.guildExclusive);

        await this.application?.commands.set(otherCommands);

        for (const [, guild] of this.guilds.cache) {
            await guild.commands.set([...guildExclusiveCommands, ...otherCommands]);
        }
    }

    public async start(): Promise<string> {
        return await this.login(process.env.DISCORD_TOKEN);
    }
}
