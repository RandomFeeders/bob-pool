import ytpl from 'ytpl';
import ytsr from 'ytsr';
import ytdl, { getBasicInfo } from 'ytdl-core';
import { Injectable } from '@nestjs/common';
import { YoutubeVideo } from './models/youtube-video';
import { YoutubePlaylist } from './models/youtube-playlist';
import { AudioResource, StreamType, createAudioResource } from '@discordjs/voice';
import { Streamable } from '@app/library/interfaces/streamable.interface';

@Injectable()
export class YoutubeService implements Streamable {
    private static readonly AUDIO_VOLUME = 0.1;

    public constructor() {}

    private get requestOptions(): { [key: string]: object } & { headers?: { [key: string]: string } } {
        return {};
    }

    public async search(query: string, limit: number = 5, limitGrow: number = 1.4): Promise<YoutubeVideo[]> {
        const response = await ytsr(query, { limit: limit * limitGrow, requestOptions: this.requestOptions });
        if (!response) return [];
        return response.items
            .filter((item) => item.type === 'video')
            .map((item) => new YoutubeVideo({ ytsr: item }))
            .slice(0, limit);
    }

    public async getVideo(videoId: string): Promise<YoutubeVideo | undefined> {
        const response = await getBasicInfo(`https://youtube.com/watch?v=${videoId}`, {
            requestOptions: this.requestOptions,
        });
        if (!response) return;
        return new YoutubeVideo({ ytdl: response });
    }

    public async getPlaylist(playlistId: string, limit: number = Infinity): Promise<YoutubePlaylist | undefined> {
        const response = await ytpl(playlistId, { limit, requestOptions: this.requestOptions });
        if (!response) return;
        return new YoutubePlaylist(response);
    }

    public async getAudioResource(videoId: string, volume: number = 100): Promise<AudioResource> {
        const stream = ytdl(`https://youtube.com/watch?v=${videoId}`, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
            requestOptions: this.requestOptions,
        });

        const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });

        resource.volume?.setVolume(YoutubeService.AUDIO_VOLUME * (volume / 100));

        return resource;
    }
}
