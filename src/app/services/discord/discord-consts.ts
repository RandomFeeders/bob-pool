import { GatewayIntentBits } from 'discord.js';

export const DISCORD_BOT_INTENTS =
    GatewayIntentBits.DirectMessages |
    GatewayIntentBits.DirectMessageTyping |
    GatewayIntentBits.DirectMessageReactions |
    GatewayIntentBits.GuildEmojisAndStickers |
    GatewayIntentBits.GuildInvites |
    GatewayIntentBits.GuildMembers |
    GatewayIntentBits.GuildMessageReactions |
    GatewayIntentBits.GuildMessageTyping |
    GatewayIntentBits.GuildMessages |
    GatewayIntentBits.GuildModeration |
    GatewayIntentBits.GuildPresences |
    GatewayIntentBits.GuildVoiceStates |
    GatewayIntentBits.Guilds |
    GatewayIntentBits.MessageContent;
