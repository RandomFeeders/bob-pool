import { AudioResource } from '@discordjs/voice';

export interface Streamable {
    getAudioResource(resourceId: string, volume: number): Promise<AudioResource>;
}
