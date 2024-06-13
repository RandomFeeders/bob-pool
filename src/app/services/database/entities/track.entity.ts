import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Playlist } from './playlist.entity';
import { VoiceData } from './voice-data.entity';

export enum TrackType {
    Unknown = 'unknown',
    Youtube = 'youtube',
    Spotify = 'spotify',
}

@Entity({
    name: 'track',
})
export class Track {
    @PrimaryGeneratedColumn({
        name: 'id',
    })
    public id?: number;

    @Column({
        name: 'provider_id',
        type: 'varchar',
        length: 256,
        nullable: false,
    })
    public providerId?: string;

    @ManyToOne(() => User, { eager: true, nullable: false })
    @JoinColumn({ name: 'user_id' })
    public requestedBy?: User;

    @ManyToOne(() => Playlist, (playlist) => playlist.tracks, { eager: false, nullable: true })
    @JoinColumn({ name: 'playlist_id' })
    public playlist?: Playlist;

    @ManyToOne(() => VoiceData, (voiceData) => voiceData.tracks, { eager: false, nullable: true })
    @JoinColumn({ name: 'voice_data_id' })
    public voiceData?: VoiceData;

    @Column({
        name: 'title',
        type: 'varchar',
        length: 256,
        nullable: false,
    })
    public title?: string;

    @Column({
        name: 'type',
        type: 'enum',
        enum: TrackType,
        default: TrackType.Unknown,
    })
    public type?: TrackType;

    @Column({
        name: 'length',
        type: 'integer',
    })
    public length?: number;

    @Column({
        name: 'url',
        type: 'varchar',
        length: 256,
        nullable: false,
    })
    public url?: string;

    @Column({
        name: 'artist',
        type: 'varchar',
        length: 64,
        nullable: false,
    })
    public artist?: string;

    public toString(): string {
        const length = this.length ?? 0;
        const min = Math.floor(length / 60);
        const sec = length - min * 60;
        const time = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        const title = this.type === 'youtube' ? this.title : `${this.artist} - ${this.title}`;
        return `[${title}](${this.url}) \`${time}\``;
    }

    public equivalent(otherTrack: Track): boolean {
        const normalize = (value?: string) => value?.normalize().trim().toLowerCase();
        const compare = (left?: string, right?: string) => normalize(left) === normalize(right);
        return (
            this.id === otherTrack.id ||
            compare(this.url, otherTrack.url) ||
            (compare(this.title, otherTrack.title) && compare(this.artist, otherTrack.artist))
        );
    }
}
