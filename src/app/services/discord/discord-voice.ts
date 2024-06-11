import { DiscordVoiceData, VoiceQueue } from '@app/app/models/discord/discord-voice-data';
import { Injectable } from '@nestjs/common';
import { DiscordBot } from './discord-bot';
import { Snowflake } from 'discord.js';
import { DiscordInteraction } from '../../models/discord/discord-command';
import { LocalizedError } from '@app/app/models/locale/localized-error';
import { VoiceDataRepository } from '../database/repositories/voice-data.repository';
import { VoiceData } from '../database/entities/voice-data.entity';

@Injectable()
export class DiscordVoiceService {
    private data: Map<Snowflake, DiscordVoiceData>;

    public constructor(
        private discordBot: DiscordBot,
        private voiceDataRepository: VoiceDataRepository
    ) {
        this.data = new Map<Snowflake, DiscordVoiceData>();
    }

    public hasVoiceData(guildId: Snowflake): boolean {
        return this.data.has(guildId);
    }

    public getVoiceData(guildId: Snowflake): DiscordVoiceData | undefined {
        return this.data.get(guildId);
    }

    public async setVoiceData(interaction: DiscordInteraction): Promise<DiscordVoiceData> {
        const guildId = interaction.guildId;
        if (!guildId) throw new Error('Something went wrong while trying to retrieve the guild id.');

        if (this.data.has(guildId)) return this.getVoiceData(guildId)!;

        if (!interaction.channel || !interaction.channel.isTextBased())
            throw new LocalizedError('invalid_text_channel');

        if (!interaction.member.voice.channel || !interaction.member.voice.channel.isVoiceBased())
            throw new LocalizedError('invalid_voice_channel');

        const voiceData = new DiscordVoiceData(interaction.member.voice.channel, interaction.channel);

        const dbVoiceData = await this.voiceDataRepository.findOneBy({ discordGuildId: guildId });
        if (!!dbVoiceData && !!dbVoiceData.tracks) {
            voiceData.queue = new VoiceQueue(...dbVoiceData.tracks);
            voiceData.volume = dbVoiceData.volume ?? voiceData.volume;
            voiceData.loop = dbVoiceData.loop ?? voiceData.loop;
        }

        this.data.set(guildId, voiceData);

        return voiceData;
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

        const dbVoiceData = await this.voiceDataRepository.findOneBy({ discordGuildId: guildId }) ?? new VoiceData();

        dbVoiceData.discordGuildId = guildId;
        dbVoiceData.loop = currentData.loop;
        dbVoiceData.volume = currentData.volume;
        dbVoiceData.tracks = currentData.queue;

        await this.voiceDataRepository.save(dbVoiceData);

        currentData.connection.disconnect();
        this.data.delete(guildId);
    }
}
