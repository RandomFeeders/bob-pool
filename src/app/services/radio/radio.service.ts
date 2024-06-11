import { Streamable } from '@library/interfaces/streamable.interface';
import { AudioResource, StreamType, createAudioResource } from '@discordjs/voice';
import { Injectable } from '@nestjs/common';
import { Radio } from './models/radio';

@Injectable()
export class RadioService implements Streamable {
    private static readonly AUDIO_VOLUME = 0.1;
    private static readonly RADIOS: Radio[] = [
        new Radio({
            name: 'veronica',
            displayName: 'Veronica Rock Radio',
            url: 'https://25353.live.streamtheworld.com/SRGSTR11.mp3',
        }),
    ];

    public constructor() {}

    public async getAudioResource(radioId: string, volume: number = 100): Promise<AudioResource> {
        const radio = RadioService.RADIOS.find((radio) => radio.id === radioId);
        if (!radio) throw 'Radio not found!';

        const resource = createAudioResource(radio.url, { inputType: StreamType.Arbitrary, inlineVolume: true });
        resource.volume?.setVolume(RadioService.AUDIO_VOLUME * (volume / 100));

        return resource;
    }
}
