import { JsonObject } from '@app/library/json/decorators/json-object';
import { JsonProperty } from '@app/library/json/decorators/json-property';

@JsonObject()
export class SpotifyArtist {
    @JsonProperty('id')
    public id: string = null!;

    @JsonProperty('name')
    public name: string = null!;

    @JsonProperty('type')
    public type: string = 'artist';

    @JsonProperty('href')
    public href: string = null!;

    @JsonProperty('uri')
    public uri: string = null!;
}
