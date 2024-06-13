import {
    CommandInteraction,
    GuildMember,
    Locale,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from 'discord.js';
import { DiscordBot } from '@app/services/discord/discord-bot';
import { User } from '@app/services/database/entities/user.entity';
import { DiscordCommandOptionBase } from './discord-command-options';

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
    options?: DiscordCommandOptionBase[];
    guildExclusive?: boolean;
    nsfw?: boolean;

    execute(interaction: DiscordInteraction): Promise<void>;
}

export interface DiscordSubCommand {
    name: string;
    parent: string;
    options?: DiscordCommandOptionBase[];

    execute(interaction: DiscordInteraction): Promise<void>;
}

export class DiscordCommandBuilder extends SlashCommandBuilder {
    public key: string;
    public guildExclusive?: boolean;

    public constructor(key: string) {
        super();

        this.key = key;
    }
}

export class DiscordSubCommandBuilder extends SlashCommandSubcommandBuilder {
    public key: string;
    public parent: string;

    public constructor(key: string, parent: string) {
        super();

        this.key = key;
        this.parent = parent;
    }
}
