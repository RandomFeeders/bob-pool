import { JsonObject } from '@library/json/decorators/json-object';
import { JsonProperty } from '@library/json/decorators/json-property';

@JsonObject()
export class SpotifyImage {
    @JsonProperty('width')
    public width: number = 0;

    @JsonProperty('height')
    public height: number = 0;

    @JsonProperty('url')
    public url: string = null!;
}
