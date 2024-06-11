import dayjs from 'dayjs';
import { Injectable } from '@nestjs/common';
import { SpotifyTrack } from './models/spotify-track';
import { SpotifyPlaylist } from './models/spotify-playlist';
import { SpotifyTrackList } from './models/spotify-track-list';
import { SpotifyAuthResponse } from './models/spotify-auth-response';

const SPOTIFY_ENDPOINT = 'https://api.spotify.com';

@Injectable()
export class SpotifyService {
    private auth?: SpotifyAuthResponse;

    public constructor() {}

    public async login(): Promise<SpotifyAuthResponse> {
        if (this.auth && dayjs().isBefore(dayjs.unix(this.auth.expiresIn))) return this.auth;

        const response = await WebRequest.create('https://accounts.spotify.com')
            .withPath('api', 'token')
            .withBasicAuth(process.env.SPOTIFY_CLIENT, process.env.SPOTIFY_SECRET)
            .withForm({
                grant_type: 'client_credentials',
            })
            .execute('POST');

        this.auth = response.content.parseJson(SpotifyAuthResponse);
        this.auth.expiresIn = dayjs()
            .add(this.auth.expiresIn - 5, 'seconds')
            .unix();

        return this.auth;
    }

    public async getTrack(trackId: string): Promise<SpotifyTrack> {
        const auth = await this.login();
        const response = await WebRequest.create(SPOTIFY_ENDPOINT)
            .withPath('v1', 'tracks', trackId)
            .withAuth(auth.tokenType, auth.accessToken)
            .execute('GET');
        return response.content.parseJson(SpotifyTrack);
    }

    private async getPlaylistRecurssive({
        limit,
        offset,
        playlist,
    }: {
        limit: number;
        offset?: number;
        playlist: SpotifyPlaylist;
    }): Promise<SpotifyPlaylist> {
        const auth = await this.login();
        const result = await WebRequest.create(SPOTIFY_ENDPOINT)
            .withPath('v1', 'playlists', playlist.id, 'tracks')
            .withQuery({ limit, offset: offset ?? 0 })
            .withAuth(auth.tokenType, auth.accessToken)
            .execute('GET');

        if (!result.isSuccessStatusCode) throw result;

        const parsedResult = result.content.parseJson(SpotifyTrackList);

        playlist.tracks ??= new SpotifyTrackList();
        playlist.tracks.offset = 0;
        playlist.tracks.limit = 0;
        playlist.tracks.total = parsedResult.total;
        playlist.tracks.items ??= [];
        playlist.tracks.items = [...playlist.tracks.items, ...parsedResult.items];

        if (playlist.tracks.items.length < playlist.tracks.total)
            return await this.getPlaylistRecurssive({ limit, offset: (offset ?? 0) + limit, playlist });

        return playlist;
    }

    public async getPlaylist(playlistId: string, chunkSize: number = 100): Promise<SpotifyPlaylist> {
        const auth = await this.login();
        const result = await WebRequest.create(SPOTIFY_ENDPOINT)
            .withPath('v1', 'playlists', playlistId)
            .withQuery({
                fields: 'id,name,description,type,public,collaborative,href,uri,snapshot_id,images,owner(id,type,display_name,href,uri)',
            })
            .withAuth(auth.tokenType, auth.accessToken)
            .execute('GET');

        if (!result.isSuccessStatusCode) throw result;

        const playlist = result.content.parseJson(SpotifyPlaylist);

        return await this.getPlaylistRecurssive({ limit: chunkSize, playlist });
    }
}
