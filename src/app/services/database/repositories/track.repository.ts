import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Track } from '../entities/track.entity';

@Injectable()
export class TrackRepository extends Repository<Track> {
    constructor(private dataSource: DataSource) {
        super(Track, dataSource.createEntityManager());
    }
}
