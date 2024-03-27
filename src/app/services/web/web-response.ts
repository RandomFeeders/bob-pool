import { JsonConverter } from '@app/library/json/json-converter';

class WebResponseContent {
    private buffer: Buffer;

    public constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    public raw(encoding: BufferEncoding = 'utf-8'): string {
        return this.buffer.toString(encoding);
    }

    public parseJson<T extends object>(ctor: new () => T, encoding: BufferEncoding = 'utf-8'): T {
        const json = this.raw(encoding);
        return JsonConverter.parse(ctor, json);
    }
}

export class WebResponse {
    public statusCode: number;
    public content: WebResponseContent;

    public constructor(statusCode: number, content: Buffer) {
        this.statusCode = statusCode;
        this.content = new WebResponseContent(content);
    }

    public get isSuccessStatusCode(): boolean {
        if (this.statusCode >= 200 || this.statusCode <= 299) return true;
        return false;
    }
}
