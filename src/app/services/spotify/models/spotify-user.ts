import { JsonProperty } from '@app/library/json/decorators/json-property';

export class SpotifyUser {
    @JsonProperty('id')
    public id: string = null!;

    @JsonProperty('type')
    public type: string = 'user';

    @JsonProperty('display_name')
    public name: string = null!;

    @JsonProperty('href')
    public href: string = null!;

    @JsonProperty('uri')
    public uri: string = null!;
}
