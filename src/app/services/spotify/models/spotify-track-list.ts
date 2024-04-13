import { JsonProperty } from '@app/library/json/decorators/json-property';
import { SpotifyPlaylistTrack } from './spotify-playlist-track';

export class SpotifyTrackList {
    @JsonProperty('limit')
    public limit: number = 20;

    @JsonProperty('offset')
    public offset: number = 0;

    @JsonProperty('total')
    public total: number = 0;

    @JsonProperty('items', { arrayType: SpotifyPlaylistTrack })
    public items: SpotifyPlaylistTrack[] = [];
}
