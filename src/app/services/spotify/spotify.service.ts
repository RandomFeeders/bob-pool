import dayjs from 'dayjs';
import { Injectable } from '@nestjs/common';
import { SpotifyTrack } from './models/spotify-track';
import { SpotifyPlaylist } from './models/spotify-playlist';
import { SpotifyTrackList } from './models/spotify-track-list';
import { SpotifyAuthResponse } from './models/spotify-auth-response';
import { WebRequest } from '../web/web-request';
import { SPOTIFY_URL_PATH_REGEX, SPOTIFY_URL_REGEX } from '@library/regex';
import { LocalizedError } from '@app/models/locale/localized-error';
import { AudioResource } from '@discordjs/voice';
import { YoutubeService } from '../youtube/youtube.service';
import { Track } from '../database/entities/track.entity';

const SPOTIFY_API_ENDPOINT = 'https://api.spotify.com';
const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com';

export type SpotifyUrl = { id: string; type: SpotifyUrlType };
export type SpotifyUrlType = 'track' | 'playlist';

@Injectable()
export class SpotifyService {
    private auth?: SpotifyAuthResponse;
    private cache: Map<string, string>;

    public constructor(private youtubeService: YoutubeService) {
        this.cache = new Map<string, string>();
    }

    public identifyUrl(url: string): SpotifyUrl | null {
        const urlRegex = new RegExp(SPOTIFY_URL_REGEX);
        if (!url.match(urlRegex)) return null;

        const spotifyUrl = new URL(url);
        const pathRegex = new RegExp(SPOTIFY_URL_PATH_REGEX);
        const pathMatch = spotifyUrl.pathname.match(pathRegex);
        if (!pathMatch) return null;

        if (pathMatch[1] === 'track') return { id: pathMatch[2], type: 'track' };
        if (pathMatch[1] === 'playlist') return { id: pathMatch[2], type: 'playlist' };

        return null;
    }

    public async login(): Promise<SpotifyAuthResponse> {
        if (this.auth && dayjs().isBefore(dayjs.unix(this.auth.expiresIn))) return this.auth;

        const response = await WebRequest.create(SPOTIFY_AUTH_ENDPOINT)
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
        const response = await WebRequest.create(SPOTIFY_API_ENDPOINT)
            .withPath('v1', 'tracks', trackId)
            .withAuth(auth.tokenType, auth.accessToken)
            .execute('GET');

        if (!response.isSuccessStatusCode) throw new LocalizedError('invalid_spotify_url');

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
        const result = await WebRequest.create(SPOTIFY_API_ENDPOINT)
            .withPath('v1', 'playlists', playlist.id, 'tracks')
            .withQuery({ limit, offset: offset ?? 0 })
            .withAuth(auth.tokenType, auth.accessToken)
            .execute('GET');

        if (!result.isSuccessStatusCode) throw new LocalizedError('invalid_spotify_url');

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
        const result = await WebRequest.create(SPOTIFY_API_ENDPOINT)
            .withPath('v1', 'playlists', playlistId)
            .withQuery({
                fields: 'id,name,description,type,public,collaborative,href,uri,snapshot_id,images,owner(id,type,display_name,href,uri)',
            })
            .withAuth(auth.tokenType, auth.accessToken)
            .execute('GET');

        if (!result.isSuccessStatusCode) throw new LocalizedError('invalid_spotify_url');

        const playlist = result.content.parseJson(SpotifyPlaylist);

        return await this.getPlaylistRecurssive({ limit: chunkSize, playlist });
    }

    public async getAudioResource(track: Track, volume: number = 100): Promise<AudioResource> {
        if (!track.providerId) throw new Error("The next track doesn't have a valid id!");

        const youtubeEquivalent = this.cache.get(track.providerId);

        if (!!youtubeEquivalent) return await this.youtubeService.getAudioResource(youtubeEquivalent, volume);

        const searchResult = await this.youtubeService.search(`${track.artist} - ${track.title}`);

        if (!searchResult || searchResult.length === 0)
            throw new LocalizedError('Unable to find a track equivalent on youtube.');

        this.cache.set(track.providerId, searchResult[0].id);

        return await this.youtubeService.getAudioResource(searchResult[0].id, volume);
    }

    public async cacheTrack(track: Track): Promise<void> {
        if (!track.providerId) return;

        const youtubeEquivalent = this.cache.get(track.providerId);
        if (!!youtubeEquivalent) return;

        const searchResult = await this.youtubeService.search(`${track.artist} - ${track.title}`);
        if (!searchResult || searchResult.length === 0) return;

        this.cache.set(track.providerId, searchResult[0].id);
    }
}
