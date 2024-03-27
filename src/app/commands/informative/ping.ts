import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/app/services/discord/discord-command';
import { LocaleService } from '@app/app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class PingCommand implements DiscordCommand {
    public name: string = 'ping';
    public category = DiscordCommandCategory.INFORMATIVE;

    public constructor(private localeService: LocaleService) {}

    public async execute(interaction: DiscordInteraction): Promise<void> {
        const initialContent = this.localeService.translate(
            'commands.ping.data.initial_message',
            interaction.member.locale
        );
        const reply = await interaction.reply({ content: initialContent, fetchReply: true, ephemeral: true });
        const latency = reply.createdTimestamp - interaction.createdTimestamp;

        const websocketMessage = this.localeService.translate(
            'commands.ping.data.websocket_ping',
            interaction.member.locale,
            { value: interaction.client.ws.ping }
        );

        const responseMessage = this.localeService.translate(
            'commands.ping.data.response_ping',
            interaction.member.locale,
            { value: latency }
        );

        await interaction.editReply({
            embeds: [
                {
                    title: ':ping_pong: Pong!',
                    description: websocketMessage + '\n' + responseMessage,
                },
            ],
        });
    }
}
