import { Track } from '@app/services/database/entities/track.entity';
import { VoiceDataLoop } from '@app/services/database/entities/voice-data.entity';
import { AudioPlayer, VoiceConnection, createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
import { TextBasedChannel, VoiceBasedChannel } from 'discord.js';
import { DiscordVoiceQuery } from './discord-voice-query';
import { User } from '@app/services/database/entities/user.entity';
import { DiscordVoiceService } from '@app/services/discord/discord-voice';

export type VoiceDataType = 'none' | 'youtube' | 'radio' | 'spotify';
export class VoiceQueue extends Array<Track> {}

export class DiscordVoiceData {
    private type: VoiceDataType = 'none';
    private quotaExceededCount: number = 0;
    private voiceService: DiscordVoiceService;

    public readonly connection: VoiceConnection;
    public readonly player: AudioPlayer;
    public readonly voiceChannel: VoiceBasedChannel;
    public readonly textChannel: TextBasedChannel;
    public isPlaying: boolean;
    public volume: number;
    public queue: VoiceQueue;
    public loop: VoiceDataLoop;
    public cacheSize: number;

    constructor(voiceChannel: VoiceBasedChannel, textChannel: TextBasedChannel, voiceService: DiscordVoiceService) {
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;
        this.voiceService = voiceService;

        this.isPlaying = false;
        this.volume = 100;
        this.queue = new VoiceQueue();
        this.loop = VoiceDataLoop.None;
        this.cacheSize = 3;

        this.player = createAudioPlayer();
        this.connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guildId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false,
        });
    }

    public initialize(onDisconnection: () => Promise<void>): void {
        this.connection.subscribe(this.player);
        this.connection.on('stateChange', (_, state) => {
            if (state.status == 'disconnected') {
                onDisconnection();
                this.connection.destroy();
                this.isPlaying = false;
            }
        });
        this.player.on('stateChange', (_, state) => {
            if (state.status == 'idle') {
                this.skip();
            }
        });
    }

    public enqueue(query: DiscordVoiceQuery, user: User, next: boolean = false): void {
        const tracks = query.getTracks(user);

        if (next) this.queue.splice(1, 0, ...tracks);
        else this.queue.push(...tracks);
    }

    public async play(): Promise<void> {
        if (this.queue.length === 0) return this.stop();

        const track = this.queue[0];
        const stream = await this.voiceService.getTrackStream(track, this.volume);

        this.voiceService.prepareNextTracks(this.queue.slice(1, this.cacheSize + 1)).catch((err) => {
            throw err;
        });

        this.player.play(stream);
    }

    public stop(): void {
        if (this.isPlaying) this.connection.disconnect();
    }

    public skip(removeSkippedTrack: boolean = false): void {
        const removedTrack = this.queue.shift();
        if (!removedTrack) return this.stop();

        if (this.loop === VoiceDataLoop.All && !removeSkippedTrack) this.queue.push(removedTrack);
        if (this.loop === VoiceDataLoop.One && !removeSkippedTrack) this.queue.unshift(removedTrack);

        if (this.queue.length === 0) return this.stop();

        this.play();
    }
}
