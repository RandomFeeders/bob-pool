import { JsonObject } from '@library/json/decorators/json-object';
import { JsonProperty } from '@library/json/decorators/json-property';
import { SpotifyImage } from './spotify-image';

@JsonObject()
export class SpotifyAlbum {
    @JsonProperty('id')
    public id: string = null!;

    @JsonProperty('name')
    public name: string = null!;

    @JsonProperty('type')
    public type: string = 'album';

    @JsonProperty('album_type')
    public albumType: string = 'album';

    @JsonProperty('href')
    public href: string = null!;

    @JsonProperty('uri')
    public uri: string = null!;

    @JsonProperty('total_tracks')
    public totalTracks: number = 0;

    @JsonProperty('images', { arrayType: SpotifyImage })
    public images: SpotifyImage[] = [];
}
