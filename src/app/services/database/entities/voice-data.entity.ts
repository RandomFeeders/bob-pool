import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Track } from './track.entity';

export enum VoiceDataLoop {
    None = 'none',
    One = 'one',
    All = 'all',
}

@Entity({
    name: 'voice_data',
})
export class VoiceData {
    @PrimaryGeneratedColumn({
        name: 'id',
    })
    public id?: number;

    @Column({
        name: 'discord_guild_id',
        type: 'varchar',
        length: 24,
        nullable: false,
    })
    public discordGuildId?: string;

    @OneToMany(() => Track, (track) => track.voiceData, { eager: true })
    public tracks?: Track[];

    @Column({
        name: 'loop',
        type: 'enum',
        enum: VoiceDataLoop,
        default: VoiceDataLoop.None,
        nullable: false,
    })
    public loop?: VoiceDataLoop;

    @Column({
        name: 'volume',
        type: 'integer',
        default: 100,
        nullable: false,
    })
    public volume?: number;
}
