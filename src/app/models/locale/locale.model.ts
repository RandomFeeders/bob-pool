import { JsonObject } from '@library/json/decorators/json-object';
import { DiscordCommandCategory } from '../discord/discord-command';
import { JsonProperty } from '@library/json/decorators/json-property';

export type LocaleDictionary<T> = { [key: string]: T };

export type LocaleNameDescription = { name: string; description: string };

export type LocaleCommand = LocaleNameDescription & {
    data?: LocaleDictionary<string>;
    options?: LocaleDictionary<LocaleNameDescription>;
};

@JsonObject()
export class Locale {
    @JsonProperty('categories')
    public category?: { [key in DiscordCommandCategory]: string };

    @JsonProperty('errors')
    public errors?: LocaleDictionary<string>;

    @JsonProperty('messages')
    public messages?: LocaleDictionary<string>;

    @JsonProperty('commands')
    public commands?: LocaleDictionary<LocaleCommand>;

    @JsonProperty('sub_commands')
    public subCommands?: LocaleDictionary<LocaleDictionary<LocaleCommand>>;
}
