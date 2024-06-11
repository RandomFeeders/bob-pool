import { Track, TrackType } from '@app/services/database/entities/track.entity';
import { User } from '@app/services/database/entities/user.entity';
import { SpotifyPlaylist } from '@app/services/spotify/models/spotify-playlist';
import { SpotifyTrack } from '@app/services/spotify/models/spotify-track';
import { YoutubePlaylist } from '@app/services/youtube/models/youtube-playlist';
import { YoutubeVideo } from '@app/services/youtube/models/youtube-video';

type DiscordVoiceQueryType = 'youtube' | 'spotify';

export class DiscordVoiceQuery {
    public id?: string;
    public title?: string;
    public author?: string;
    public length?: number;
    public type?: DiscordVoiceQueryType;
    public url?: string;
    public subtype?: 'track' | 'playlist';

    public origin?: YoutubeVideo | YoutubePlaylist | SpotifyTrack | SpotifyPlaylist;

    private constructor() {}

    public static from(video: YoutubeVideo): DiscordVoiceQuery;
    public static from(playlist: YoutubePlaylist): DiscordVoiceQuery;
    public static from(track: SpotifyTrack): DiscordVoiceQuery;
    public static from(playlist: SpotifyPlaylist): DiscordVoiceQuery;
    public static from(
        value: YoutubeVideo | YoutubePlaylist | SpotifyTrack | SpotifyPlaylist
    ): DiscordVoiceQuery | null {
        const result = new DiscordVoiceQuery();
        result.origin = value;

        if (value instanceof YoutubeVideo) {
            result.type = 'youtube';
            result.subtype = 'track';
            result.id = value.id;
            result.title = value.title;
            result.author = value.channel?.name;
            result.length = value.length;
            result.url = value.url;

            return result;
        }

        if (value instanceof YoutubePlaylist) {
            result.type = 'youtube';
            result.subtype = 'playlist';
            result.id = value.id;
            result.title = value.title;
            result.author = value.author?.name;
            result.url = value.url;

            return result;
        }

        if (value instanceof SpotifyTrack) {
            result.type = 'spotify';
            result.subtype = 'track';
            result.id = value.id;
            result.title = value.name;
            result.author = value.artists[0]?.name;
            result.length = value.duration_ms;
            result.url = value.uri;

            return result;
        }

        if (value instanceof SpotifyPlaylist) {
            result.type = 'spotify';
            result.subtype = 'playlist';
            result.id = value.id;
            result.title = value.name;
            result.author = value.owner.name;
            result.url = value.uri;

            return result;
        }

        return null;
    }

    public toTrack(user: User): Track {
        if (this.subtype !== 'track') throw new Error('This query is not a track!');

        const track = new Track();

        const typeMapper = {
            youtube: TrackType.Youtube,
            spotify: TrackType.Spotify,
            unknown: TrackType.Unknown,
        };

        track.providerId = this.id;
        track.title = this.title;
        track.artist = this.author;
        track.length = this.length;
        track.url = this.url;
        track.requestedBy = user;
        track.type = typeMapper[this.type ?? 'unknown'] ?? TrackType.Unknown;

        return track;
    }

    public getTracks(user: User): Track[] {
        if (this.subtype === 'track') return [this.toTrack(user)];
        if (this.subtype !== 'playlist') throw new Error('Something went wrong trying to convert to track list!');

        if (this.type === 'youtube' && this.origin instanceof YoutubePlaylist)
            return this.origin.items.map((item) => DiscordVoiceQuery.from(item).toTrack(user));

        if (this.type === 'spotify' && this.origin instanceof SpotifyPlaylist)
            return this.origin.tracks.items.map((item) => DiscordVoiceQuery.from(item.track).toTrack(user));

        throw new Error('Something went wrong trying to convert to track list!');
    }

    public toString(): string {
        const length = this.length ?? 0;
        const min = Math.floor(length / 60);
        const sec = length - min * 60;
        const time = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        const title = this.type === 'youtube' ? this.title : `${this.author} - ${this.title}`;
        return `[${title}](${this.url}) \`${time}\``;
    }
}
