import { Track } from '@app/app/services/database/entities/track.entity';
import { VoiceDataLoop } from '@app/app/services/database/entities/voice-data.entity';
import { AudioPlayer, VoiceConnection, createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
import { TextBasedChannel, VoiceBasedChannel } from 'discord.js';

export type VoiceDataType = 'none' | 'youtube' | 'radio' | 'host_audio' | 'spotify';
export class VoiceQueue extends Array<Track> {}

export class DiscordVoiceData {
    private type: VoiceDataType = 'none';
    private quotaExceededCount: number = 0;

    public readonly connection: VoiceConnection;
    public readonly player: AudioPlayer;
    public readonly voiceChannel: VoiceBasedChannel;
    public readonly textChannel: TextBasedChannel;
    public isPlaying: boolean;
    public volume: number;
    public queue: VoiceQueue;
    public loop: VoiceDataLoop;

    constructor(voiceChannel: VoiceBasedChannel, textChannel: TextBasedChannel) {
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;

        this.isPlaying = false;
        this.volume = 100;
        this.queue = new VoiceQueue();
        this.loop = VoiceDataLoop.None;

        this.player = createAudioPlayer();
        this.connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guildId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false,
        });
    }
}
