import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { VoiceData } from '../entities/voice-data.entity';

@Injectable()
export class VoiceDataRepository extends Repository<VoiceData> {
    constructor(private dataSource: DataSource) {
        super(VoiceData, dataSource.createEntityManager());
    }
}
