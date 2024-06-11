import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/models/discord/discord-command';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class TestCommand implements DiscordCommand {
    public name: string = 'test';
    public category = DiscordCommandCategory.INFORMATIVE;

    public constructor() {}

    public async execute(interaction: DiscordInteraction): Promise<void> {
        await interaction.reply({ content: 'Banana!' });
    }
}
