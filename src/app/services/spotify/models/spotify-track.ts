import { JsonObject } from '@library/json/decorators/json-object';
import { JsonProperty } from '@library/json/decorators/json-property';
import { SpotifyArtist } from './spotify-artist';
import { SpotifyAlbum } from './spotify-album';

@JsonObject()
export class SpotifyTrack {
    @JsonProperty('id')
    public id: string = null!;

    @JsonProperty('type')
    public type: string = 'track';

    @JsonProperty('name')
    public name: string = null!;

    @JsonProperty('href')
    public href: string = null!;

    @JsonProperty('uri')
    public uri: string = null!;

    @JsonProperty('preview_url')
    public previewUrl?: string;

    @JsonProperty('explicit')
    public explicit: boolean = false;

    @JsonProperty('is_local')
    public isLocal: boolean = false;

    @JsonProperty('popularity')
    public popularity: number = 0;

    @JsonProperty('track_number')
    public track_number: number = 0;

    @JsonProperty('disc_number')
    public disc_number: number = 0;

    @JsonProperty('duration_ms')
    public duration_ms: number = 0;

    @JsonProperty('artists', { arrayType: SpotifyArtist })
    public artists: SpotifyArtist[] = [];

    @JsonProperty('album')
    public album: SpotifyAlbum = null!;
}
