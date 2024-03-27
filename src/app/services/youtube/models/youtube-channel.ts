export class YoutubeChannel {
    public name: string = null!;
    public url: string = null!;

    public constructor({ name, url }: { name: string; url: string }) {
        this.name = name;
        this.url = url;
    }
}
