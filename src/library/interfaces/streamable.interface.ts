import { Track } from '@app/services/database/entities/track.entity';
import { AudioResource } from '@discordjs/voice';

export interface Streamable {
    getAudioResource(track: Track, volume: number): Promise<AudioResource>;
}
