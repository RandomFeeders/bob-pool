import { CommandInteraction, GuildMember, Locale, SlashCommandBuilder } from 'discord.js';
import { DiscordBot } from '../../services/discord/discord-bot';
import { User } from '../../services/database/entities/user.entity';

export type DiscordInteractionMember = GuildMember & { data: User; locale: Locale };
export type DiscordInteraction = CommandInteraction & { client: DiscordBot; member: DiscordInteractionMember };

export enum DiscordCommandCategory {
    'ADMINISTRATIVE' = 'categories.administrative',
    'CONFIGURATION' = 'categories.configuration',
    'FUNNY' = 'categories.funny',
    'INFORMATIVE' = 'categories.informative',
    'LEWD' = 'categories.lewd',
    'VOICE' = 'categories.voice',
}

export interface DiscordCommand {
    name: string;
    category: DiscordCommandCategory;
    guildExclusive?: boolean;

    execute(interaction: DiscordInteraction): Promise<void>;
}

export class DiscordCommandBuilder extends SlashCommandBuilder {
    public guildExclusive?: boolean;

    public constructor() {
        super();
    }
}