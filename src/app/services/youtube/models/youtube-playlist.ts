import { Result } from 'ytpl';
import { YoutubeThumbnail } from './youtube-thumbnail';
import { YoutubeChannel } from './youtube-channel';
import { YoutubeVideo } from './youtube-video';

export class YoutubePlaylist {
    public id: string = null!;
    public title: string = null!;
    public description?: string;
    public url: string = null!;
    public thumbnails: YoutubeThumbnail[] = [];
    public author: YoutubeChannel = null!;
    public items: YoutubeVideo[] = [];

    public constructor(result: Result) {
        this.id = result.id;
        this.title = result.title;
        this.url = result.url;
        this.description = result.description ?? undefined;
        this.thumbnails = result.thumbnails.map((thumbnail) => new YoutubeThumbnail(thumbnail));
        this.author = new YoutubeChannel(result.author);
        this.items = result.items.map((item) => new YoutubeVideo({ ytpl: item }));
    }
}
