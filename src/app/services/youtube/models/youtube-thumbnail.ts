import { thumbnail } from 'ytdl-core';
import { Image } from 'ytsr';

export class YoutubeThumbnail {
    public url: string = null!;
    public width: number = 0;
    public height: number = 0;

    public constructor(thumb: thumbnail | Image) {
        this.url = thumb.url!;
        this.width = thumb.width;
        this.height = thumb.height;
    }
}
