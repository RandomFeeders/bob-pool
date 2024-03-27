import { JsonObject } from '@app/library/json/decorators/json-object';
import { DiscordCommandCategory } from '../discord/discord-command';
import { JsonProperty } from '@app/library/json/decorators/json-property';

@JsonObject()
export class Locale {
    @JsonProperty('categories')
    public category?: { [key in DiscordCommandCategory]: string };

    @JsonProperty('errors')
    public errors?: { [key: string]: string };

    @JsonProperty('help_command')
    public helpCommand?: { title: string };
}
