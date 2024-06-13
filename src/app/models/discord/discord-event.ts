import { ClientEvents } from 'discord.js';

export const DISCORD_EVENT_METADATA: string = 'discord-event-name';

export interface DiscordEvent<K extends keyof ClientEvents> {
    execute(...args: ClientEvents[K]): Promise<void>;
}

export function DiscordEvent(type: keyof ClientEvents) {
    return function (target: Function) {
        const metadata = Reflect.getMetadata(DISCORD_EVENT_METADATA, target) ?? type;
        Reflect.defineMetadata(DISCORD_EVENT_METADATA, metadata, target);
    };
}