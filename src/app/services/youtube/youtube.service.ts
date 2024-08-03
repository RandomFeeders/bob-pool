import ytpl from 'ytpl';
import ytsr from 'ytsr';
import ytdl, { getBasicInfo } from '@distube/ytdl-core';
import { Injectable } from '@nestjs/common';
import { YoutubeVideo } from './models/youtube-video';
import { YoutubePlaylist } from './models/youtube-playlist';
import { AudioResource, StreamType, createAudioResource } from '@discordjs/voice';
import { Streamable } from '@library/interfaces/streamable.interface';
import { YOUTUBE_URL_REGEX } from '@library/regex';
import { LocalizedError } from '@app/models/locale/localized-error';
import { Track } from '../database/entities/track.entity';

export type YoutubeUrl = { id: string; type: YoutubeUrlType };
export type YoutubeUrlType = 'video' | 'playlist';

@Injectable()
export class YoutubeService implements Streamable {
    private static readonly AUDIO_VOLUME = 0.1;

    public constructor() {}

    private get requestOptions(): { [key: string]: object } & { headers?: { [key: string]: string } } {
        return {};
    }

    public identifyUrl(url: string): YoutubeUrl | null {
        const urlRegex = new RegExp(YOUTUBE_URL_REGEX);
        if (!url.match(urlRegex)) return null;

        const youtubeUrl = new URL(url);

        if (youtubeUrl.pathname === '/watch') return { id: youtubeUrl.searchParams.get('v')!, type: 'video' };
        if (youtubeUrl.pathname === '/playlist') return { id: youtubeUrl.searchParams.get('list')!, type: 'playlist' };
        if (youtubeUrl.hostname === 'youtu.be')
            return { id: youtubeUrl.pathname.replace(/^\/+|\/+$/, ''), type: 'video' };

        return null;
    }

    public async search(query: string, limit: number = 5, limitGrow: number = 1.4): Promise<YoutubeVideo[]> {
        const response = await ytsr(query, { limit: limit * limitGrow, requestOptions: this.requestOptions });
        if (!response) return [];
        return response.items
            .filter((item) => item.type === 'video')
            .map((item) => new YoutubeVideo({ ytsr: item }))
            .slice(0, limit);
    }

    public async getVideo(videoId: string): Promise<YoutubeVideo> {
        try {
            const response = await getBasicInfo(`https://youtube.com/watch?v=${videoId}`, {
                requestOptions: this.requestOptions,
            });
            if (!response) throw new LocalizedError('youtube_video_unavailable');
            return new YoutubeVideo({ ytdl: response });
        } catch (err: unknown) {
            if (err instanceof Error && err.message.includes('unavailable'))
                throw new LocalizedError('youtube_video_unavailable');
            if (err instanceof Error && err.message.includes('404'))
                throw new LocalizedError('youtube_video_unavailable');
            if (err instanceof Error && err.message.includes('does not match expected format'))
                throw new LocalizedError('invalid_youtube_url');
            throw err;
        }
    }

    public async getPlaylist(playlistId: string, limit: number = Infinity): Promise<YoutubePlaylist> {
        try {
            const response = await ytpl(playlistId, { limit, requestOptions: this.requestOptions });
            if (!response) throw new LocalizedError('invalid_youtube_playlist');
            return new YoutubePlaylist(response);
        } catch (err: unknown) {
            if (err instanceof Error && err.message.includes('does not exist'))
                throw new LocalizedError('invalid_youtube_playlist');
            if (err instanceof Error && err.message.includes('404'))
                throw new LocalizedError('invalid_youtube_playlist');
            if (err instanceof Error && err.message.includes('find a id in'))
                throw new LocalizedError('invalid_youtube_playlist');
            throw err;
        }
    }

    public async getAudioResource(track: Track, volume: number = 100): Promise<AudioResource> {
        if (!track.providerId) throw new Error("The next track doesn't have a valid id!");

        const stream = ytdl(`https://youtube.com/watch?v=${track.providerId}`, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
            requestOptions: this.requestOptions,
        });

        const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
        resource.volume?.setVolume(YoutubeService.AUDIO_VOLUME * (volume / 100));

        return resource;
    }

    public async cacheTrack(_track: Track): Promise<void> {}
}
