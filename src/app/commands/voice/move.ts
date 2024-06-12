import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/models/discord/discord-command';
import { DiscordCommandIntegerOption, DiscordCommandStringOption } from '@app/models/discord/discord-command-options';
import { LocalizedError } from '@app/models/locale/localized-error';
import { VoiceDataLoop } from '@app/services/database/entities/voice-data.entity';
import { DiscordVoiceService } from '@app/services/discord/discord-voice';
import { LocaleService } from '@app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class MoveCommand implements DiscordCommand {
    public name: string = 'move';
    public category = DiscordCommandCategory.VOICE;
    public options = [
        new DiscordCommandIntegerOption('from', true),
        new DiscordCommandIntegerOption('to', true),
    ];

    public constructor(
        private localeService: LocaleService,
        private voiceService: DiscordVoiceService
    ) {}

    public async execute(interaction: DiscordInteraction): Promise<void> {
        if (!this.voiceService.hasVoiceData(interaction.guildId!)) throw new LocalizedError('not_in_voice_yet');

        const fromOption = interaction.options.get('from')?.value;
        const toOption = interaction.options.get('to')?.value;
        if (typeof fromOption !== 'number' || typeof toOption !== 'number') throw new LocalizedError('invalid_command_option');
        
        const voiceData = this.voiceService.getVoiceData(interaction.guildId!)!;

        if (fromOption === toOption) throw new LocalizedError('invalid_command_option');
        if (fromOption < -voiceData.queue.length || fromOption > voiceData.queue.length) throw new LocalizedError('invalid_command_option');
        if (toOption < -voiceData.queue.length || toOption > voiceData.queue.length) throw new LocalizedError('invalid_command_option');

        const initialIndex = fromOption > 0 ? fromOption - 1 : fromOption;
        const finalIndex = toOption > 0 ? toOption - 1 : toOption;

        const removedTrack = voiceData.queue.splice(initialIndex, 1)[0];
        voiceData.queue.splice(finalIndex, 0, removedTrack);

        if (finalIndex === 0 || finalIndex === -voiceData.queue.length) {
            voiceData.play();
        }

        await interaction.reply({
            content: this.localeService.translate('commands.move.data.success_message', interaction.member.locale, {
                from: initialIndex < 0 ? voiceData.queue.length + initialIndex : initialIndex + 1,
                to: finalIndex < 0 ? voiceData.queue.length + finalIndex : finalIndex + 1
            }),
            ephemeral: true,
        });
    }
}
