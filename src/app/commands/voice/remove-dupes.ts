import { DiscordInteraction, DiscordSubCommand } from '@app/models/discord/discord-command';
import { LocalizedError } from '@app/models/locale/localized-error';
import { DiscordVoiceService } from '@app/services/discord/discord-voice';
import { LocaleService } from '@app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class RemoveDupesCommand implements DiscordSubCommand {
    public name: string = 'dupes';
    public parent: string = 'remove';

    public constructor(
        private localeService: LocaleService,
        private voiceService: DiscordVoiceService
    ) {}

    public async execute(interaction: DiscordInteraction): Promise<void> {
        if (!this.voiceService.hasVoiceData(interaction.guildId!)) throw new LocalizedError('not_in_voice_yet');

        const voiceData = this.voiceService.getVoiceData(interaction.guildId!)!;

        const dupesIndex = voiceData.queue.reduce<number[]>((dupes, track, index) => {
            const mappedDupes = voiceData.queue
                .map((secondTrack, secondIndex) => {
                    if (
                        index !== secondIndex &&
                        !dupes.includes(index) &&
                        !dupes.includes(secondIndex) &&
                        track.equivalent(secondTrack)
                    )
                        return secondIndex;
                    return -1;
                })
                .filter((dupe) => !!dupe && dupe !== -1);

            return [...dupes, ...mappedDupes];
        }, []);

        dupesIndex.sort((a, b) => b - a).forEach((index) => voiceData.queue.splice(index, 1));

        await interaction.reply({
            content: this.localeService.translate(
                'sub_commands.remove.dupes.data.success_message',
                interaction.member.locale
            ),
            ephemeral: true,
        });
    }
}
