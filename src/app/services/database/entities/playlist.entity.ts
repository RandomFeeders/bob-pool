import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Track } from './track.entity';
import { User } from './user.entity';

@Entity({
    name: 'playlist',
})
export class Playlist {
    @PrimaryGeneratedColumn({
        name: 'id',
    })
    public id?: number;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 128,
        nullable: false,
    })
    public name?: string;

    @OneToMany(() => Track, (track) => track.playlist, { eager: true })
    public tracks?: Track[];

    @ManyToOne(() => User, (user) => user.playlists, { eager: false, nullable: false })
    @JoinColumn({ name: 'user_id' })
    public owner?: User;
}
