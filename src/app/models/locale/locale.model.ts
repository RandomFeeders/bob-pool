import { JsonObject } from '@library/json/decorators/json-object';
import { DiscordCommandCategory } from '../discord/discord-command';
import { JsonProperty } from '@library/json/decorators/json-property';

export type LocaleNameDescription = { name: string; description: string };

export type LocaleCommand = LocaleNameDescription & {
    data?: { [key: string]: string };
    options?: { [key: string]: LocaleNameDescription };
};

@JsonObject()
export class Locale {
    @JsonProperty('categories')
    public category?: { [key in DiscordCommandCategory]: string };

    @JsonProperty('errors')
    public errors?: { [key: string]: string };

    @JsonProperty('commands')
    public commands?: { [key: string]: LocaleCommand };
}
