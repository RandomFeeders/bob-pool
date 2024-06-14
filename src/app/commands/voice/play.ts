import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/models/discord/discord-command';
import { DiscordCommandStringOption } from '@app/models/discord/discord-command-options';
import { BasePlayCommand } from '@app/models/voice/base-play-command';
import { DiscordVoiceService } from '@app/services/discord/discord-voice';
import { LocaleService } from '@app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class PlayCommand extends BasePlayCommand implements DiscordCommand {
    public name: string = 'play';
    public category = DiscordCommandCategory.VOICE;
    public options = [new DiscordCommandStringOption('query', true)];

    public constructor(localeService: LocaleService, voiceService: DiscordVoiceService) {
        super(localeService, voiceService);
    }

    public async execute(interaction: DiscordInteraction): Promise<void> {
        const rawQuery = interaction.options.get('query')?.value;
        if (!rawQuery || typeof rawQuery !== 'string')
            throw new Error('Something went wrong while trying to get command options');

        const voiceData = await this.voiceService.setVoiceData(interaction);
        const query = await this.voiceService.identifyQuery(rawQuery);

        voiceData.enqueue(query, interaction.member.data);
        if (!voiceData.isPlaying)
            voiceData.play().catch((err) => {
                throw err;
            });

        await interaction.reply({
            embeds: [this.getResponseEmbed(interaction, query)],
            ephemeral: true,
        });
    }
}
