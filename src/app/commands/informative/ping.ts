import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/app/services/discord/discord-command';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class PingCommand implements DiscordCommand {
    public name: string = 'ping';
    public category = DiscordCommandCategory.INFORMATIVE;

    public async execute(interaction: DiscordInteraction): Promise<void> {
        const reply = await interaction.reply({ content: '〽️ Pinging...', fetchReply: true });
        const latency = reply.createdTimestamp - interaction.createdTimestamp;

        await interaction.editReply({
            embeds: [
                {
                    title: ':ping_pong: Pong!',
                    description:
                        `Ping do Websocket: \`${interaction.client.ws.ping} ms\`\n` +
                        `Ping de Resposta: \`${latency} ms\``,
                },
            ],
        });
    }
}
