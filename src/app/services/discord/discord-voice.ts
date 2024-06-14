import { DiscordVoiceData, VoiceQueue } from '@app/models/discord/discord-voice-data';
import { Injectable } from '@nestjs/common';
import { DiscordBot } from './discord-bot';
import { Snowflake } from 'discord.js';
import { DiscordInteraction } from '../../models/discord/discord-command';
import { LocalizedError } from '@app/models/locale/localized-error';
import { VoiceDataRepository } from '../database/repositories/voice-data.repository';
import { VoiceData } from '../database/entities/voice-data.entity';
import { DiscordVoiceQuery } from '@app/models/discord/discord-voice-query';
import { URL_REGEX } from '@library/regex';
import { YoutubeService } from '../youtube/youtube.service';
import { SpotifyService } from '../spotify/spotify.service';
import { Track, TrackType } from '../database/entities/track.entity';
import { AudioResource } from '@discordjs/voice';

@Injectable()
export class DiscordVoiceService {
    private data: Map<Snowflake, DiscordVoiceData>;

    public constructor(
        private discordBot: DiscordBot,
        private voiceDataRepository: VoiceDataRepository,
        private youtubeService: YoutubeService,
        private spotifyService: SpotifyService
    ) {
        this.data = new Map<Snowflake, DiscordVoiceData>();
    }

    public hasVoiceData(guildId: Snowflake): boolean {
        return this.data.has(guildId);
    }

    public getVoiceData(guildId: Snowflake): DiscordVoiceData | undefined {
        return this.data.get(guildId);
    }

    public async identifyQuery(query: string): Promise<DiscordVoiceQuery> {
        const urlRegex = new RegExp(URL_REGEX);

        if (!query.match(urlRegex)) {
            const result = await this.youtubeService.search(query);
            return DiscordVoiceQuery.from(result[0]);
        }

        const youtubeUrl = this.youtubeService.identifyUrl(query);

        if (!!youtubeUrl && youtubeUrl.type === 'video') {
            const result = await this.youtubeService.getVideo(youtubeUrl.id);
            return DiscordVoiceQuery.from(result);
        }

        if (!!youtubeUrl && youtubeUrl.type === 'playlist') {
            const result = await this.youtubeService.getPlaylist(youtubeUrl.id);
            return DiscordVoiceQuery.from(result);
        }

        const spotifyUrl = this.spotifyService.identifyUrl(query);

        if (!!spotifyUrl && spotifyUrl.type === 'track') {
            const result = await this.spotifyService.getTrack(spotifyUrl.id);
            return DiscordVoiceQuery.from(result);
        }

        if (!!spotifyUrl && spotifyUrl.type === 'playlist') {
            const result = await this.spotifyService.getPlaylist(spotifyUrl.id);
            return DiscordVoiceQuery.from(result);
        }

        throw new LocalizedError('unsupported_track_url');
    }

    public async setVoiceData(interaction: DiscordInteraction): Promise<DiscordVoiceData> {
        const guildId = interaction.guildId;
        if (!guildId) throw new Error('Something went wrong while trying to retrieve the guild id.');

        if (this.data.has(guildId)) return this.getVoiceData(guildId)!;

        if (!interaction.channel || !interaction.channel.isTextBased())
            throw new LocalizedError('invalid_text_channel');

        if (!interaction.member.voice.channel || !interaction.member.voice.channel.isVoiceBased())
            throw new LocalizedError('invalid_voice_channel');

        const voiceData = new DiscordVoiceData(interaction.member.voice.channel, interaction.channel, this);

        const dbVoiceData = await this.voiceDataRepository.findOneBy({ discordGuildId: guildId });
        if (!!dbVoiceData && !!dbVoiceData.tracks) {
            const dbTrackList = dbVoiceData.tracks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            voiceData.queue = new VoiceQueue(...dbTrackList);
            voiceData.volume = dbVoiceData.volume ?? voiceData.volume;
            voiceData.loop = dbVoiceData.loop ?? voiceData.loop;
        }

        voiceData.initialize(async () => {
            await this.flushVoiceData(guildId);
            this.data.delete(guildId);
        });

        this.data.set(guildId, voiceData);

        return voiceData;
    }

    public async flushVoiceData(guildId?: string): Promise<void> {
        if (!!guildId) {
            const localData = this.data.get(guildId)!;
            const dbVoiceData =
                (await this.voiceDataRepository.findOneBy({ discordGuildId: guildId })) ?? new VoiceData();

            dbVoiceData.discordGuildId = guildId;
            dbVoiceData.loop = localData.loop;
            dbVoiceData.volume = localData.volume;
            dbVoiceData.tracks = localData.queue.map((track, index) => {
                track.order = index;
                return track;
            });

            await this.voiceDataRepository.save(dbVoiceData);

            return;
        }

        for (const guildId of this.data.keys()) {
            await this.flushVoiceData(guildId);
        }
    }

    public async clearVoiceData(interaction: DiscordInteraction): Promise<void> {
        const guildId = interaction.guildId;
        if (!guildId) throw new Error('Something went wrong while trying to retrieve the guild id.');

        if (!this.data.has(guildId)) return;

        const currentData = this.data.get(guildId);

        if (!currentData) {
            this.data.delete(guildId);
            return;
        }

        if (!interaction.channel || !interaction.channel.isTextBased())
            throw new LocalizedError('invalid_text_channel');

        if (!interaction.member.voice.channel || !interaction.member.voice.channel.isVoiceBased())
            throw new LocalizedError('invalid_voice_channel');

        if (interaction.member.voice.channel.id !== currentData.voiceChannel.id)
            throw new LocalizedError('not_same_voice_channel');

        currentData.connection.disconnect();
    }

    public async getTrackStream(track: Track, volume: number = 100): Promise<AudioResource> {
        if (track.type === TrackType.Youtube) return await this.youtubeService.getAudioResource(track, volume);

        if (track.type === TrackType.Spotify) return await this.spotifyService.getAudioResource(track, volume);

        throw new LocalizedError('The track has an invalid type.');
    }

    public async prepareNextTracks(tracks: Track[]): Promise<void> {
        if (tracks.length === 0) return;

        for (const track of tracks) {
            if (track.type === TrackType.Youtube) await this.youtubeService.cacheTrack(track);

            if (track.type === TrackType.Spotify) await this.spotifyService.cacheTrack(track);
        }
    }
}
