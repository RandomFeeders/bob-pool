import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Playlist } from './playlist.entity';

@Entity({
    name: 'user',
})
export class User {
    @PrimaryGeneratedColumn({
        name: 'id',
    })
    public id?: number;

    @Column({
        name: 'discord_id',
        type: 'varchar',
        length: 24,
        nullable: false,
    })
    public discordId?: string;

    @OneToMany(() => Playlist, (playlist) => playlist.owner)
    public playlists?: Playlist[];
}
