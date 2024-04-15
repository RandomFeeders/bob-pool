import { videoInfo } from 'ytdl-core';
import { Item as ytsrItem } from 'ytsr';
import { Item as ytplItem } from 'ytpl';
import { YoutubeChannel } from './youtube-channel';
import { YoutubeThumbnail } from './youtube-thumbnail';

export class YoutubeVideo {
    public id: string = null!;
    public title: string = null!;
    public length: number = 0;
    public url: string = null!;
    public channel?: YoutubeChannel = null!;
    public thumbnails: YoutubeThumbnail[] = [];

    public constructor({ ytdl, ytsr, ytpl }: { ytdl?: videoInfo; ytsr?: ytsrItem; ytpl?: ytplItem }) {
        if (ytdl) {
            this.id = ytdl.videoDetails.videoId;
            this.title = ytdl.videoDetails.title;
            this.length = +ytdl.videoDetails.lengthSeconds;
            this.url = ytdl.videoDetails.video_url;
            this.thumbnails = ytdl.videoDetails.thumbnails.map((thumbnail) => new YoutubeThumbnail(thumbnail));
            this.channel = new YoutubeChannel({
                name: ytdl.videoDetails.ownerChannelName,
                url: ytdl.videoDetails.ownerProfileUrl,
            });

            return;
        }

        if (ytpl) {
            const durationConvertions = [1, 60, 3600];
            const durationInSeconds = ytpl.duration
                ?.split(':')
                .reverse()
                .map((component, index) => +component * durationConvertions[index])
                .reduce((acc, value) => acc + value, 0);

            this.id = ytpl.id;
            this.title = ytpl.title;
            this.length = durationInSeconds ?? 0;
            this.url = ytpl.url;
            this.channel = ytpl.author == null ? undefined : new YoutubeChannel(ytpl.author);
            this.thumbnails = ytpl.thumbnails.map((thumbnail) => new YoutubeThumbnail(thumbnail));

            return;
        }

        if (ytsr?.type !== 'video') throw 'Result must be a video';

        const durationConvertions = [1, 60, 3600];
        const durationInSeconds = ytsr.duration
            ?.split(':')
            .reverse()
            .map((component, index) => +component * durationConvertions[index])
            .reduce((acc, value) => acc + value, 0);

        this.id = ytsr.id;
        this.title = ytsr.title;
        this.length = durationInSeconds ?? 0;
        this.url = ytsr.url;
        this.channel = ytsr.author == null ? undefined : new YoutubeChannel(ytsr.author);
        this.thumbnails = ytsr.thumbnails.map((thumbnail) => new YoutubeThumbnail(thumbnail));
    }
}
