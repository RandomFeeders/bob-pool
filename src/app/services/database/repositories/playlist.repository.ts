import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Playlist } from '../entities/playlist.entity';

@Injectable()
export class PlaylistRepository extends Repository<Playlist> {
    constructor(private dataSource: DataSource) {
        super(Playlist, dataSource.createEntityManager());
    }
}
