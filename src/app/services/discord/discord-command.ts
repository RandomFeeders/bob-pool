import { CommandInteraction, GuildMember, Locale } from 'discord.js';
import { DiscordBot } from './discord-bot';
import { User } from '../database/entities/user.entity';

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

    execute(interaction: DiscordInteraction): Promise<void>;
}
