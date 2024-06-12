import { JsonObject } from '@library/json/decorators/json-object';
import { JsonProperty } from '@library/json/decorators/json-property';
import { SpotifyImage } from './spotify-image';
import { SpotifyTrackList } from './spotify-track-list';
import { SpotifyUser } from './spotify-user';

@JsonObject()
export class SpotifyPlaylist {
    @JsonProperty('id')
    public id: string = null!;

    @JsonProperty('name')
    public name: string = null!;

    @JsonProperty('description')
    public description: string = null!;

    @JsonProperty('type')
    public type: string = 'playlist';

    @JsonProperty('public')
    public public: boolean = false;

    @JsonProperty('collaborative')
    public collaborative: boolean = false;

    @JsonProperty('href')
    public href: string = null!;

    @JsonProperty('uri')
    public uri: string = null!;

    @JsonProperty('snapshot_id')
    public snapshotId?: string;

    @JsonProperty('images', { arrayType: SpotifyImage })
    public images: SpotifyImage[] = [];

    @JsonProperty('tracks')
    public tracks: SpotifyTrackList = null!;

    @JsonProperty('owner')
    public owner: SpotifyUser = null!;
}
