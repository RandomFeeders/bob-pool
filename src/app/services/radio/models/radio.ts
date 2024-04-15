import { v4 as uuid } from 'uuid';

export class Radio {
    public id: string = null!;
    public name: string = null!;
    public displayName: string = null!;
    public url: string = null!;

    public constructor({ name, displayName, url }: { name: string; displayName: string; url: string }) {
        this.id = uuid();
        this.name = name;
        this.displayName = displayName;
        this.url = url;
    }
}
