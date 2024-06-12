import { JsonProperty } from '@library/json/decorators/json-property';
import { SpotifyTrack } from './spotify-track';
import { JsonObject } from '@library/json/decorators/json-object';

@JsonObject()
export class SpotifyPlaylistTrack {
    @JsonProperty('added_at')
    public addedAt: Date = new Date();

    @JsonProperty('is_local')
    public isLocal: boolean = false;

    @JsonProperty('track')
    public track: SpotifyTrack = null!;
}
