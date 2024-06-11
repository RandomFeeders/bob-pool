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
    name: 'playlist',
})
export class Track {
    @PrimaryGeneratedColumn({
        name: 'id',
    })
    public id?: number;

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
}
