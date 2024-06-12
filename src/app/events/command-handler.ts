import { Interaction, Locale } from 'discord.js';
import { DiscordEvent } from '@app/models/discord/discord-event';
import { Injectable } from '@nestjs/common';
import { DiscordBot } from '@app/services/discord/discord-bot';
import { DiscordInteraction } from '@app/models/discord/discord-command';
import { UserRepository } from '@app/services/database/repositories/user.repository';
import { LocalizedError } from '@app/models/locale/localized-error';
import { LocaleService } from '@app/services/locale/locale.service';
import { User } from '@app/services/database/entities/user.entity';
import { Logger } from '@library/log/logger';

@Injectable()
export class CommandHandler implements DiscordEvent<'interactionCreate'> {
    public constructor(
        private userRepository: UserRepository,
        private localeService: LocaleService
    ) {}

    private async getUserData(userDiscordId: string): Promise<User> {
        const foundUser = await this.userRepository.findOneBy({ discordId: userDiscordId });
        if (!!foundUser) return foundUser;

        const newUser = this.userRepository.create({
            discordId: userDiscordId,
        });

        await this.userRepository.insert(newUser);

        return newUser;
    }

    public async execute(interaction: Interaction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const bot = interaction.client as DiscordBot;
        const subCommand = interaction.options.getSubcommand(false);
        const commandName = !!subCommand ? interaction.commandName.replace('sc_', '') : interaction.commandName;        
        const command = !!subCommand ? bot.subCommands[commandName][subCommand] : bot.commands[commandName];

        if (!command) return;

        const extendedInteraction = interaction as DiscordInteraction;
        const interactionLocale = this.localeService.availableLocales.includes(interaction.locale)
            ? interaction.locale
            : interaction.guildLocale ?? Locale.EnglishUS;

        extendedInteraction.member.locale = interactionLocale;
        extendedInteraction.member.data = await this.getUserData(extendedInteraction.member.id);

        try {
            await command.execute(extendedInteraction);
        } catch (error: unknown) {
            if (error instanceof LocalizedError) {
                const message = this.localeService.translate(`errors.${error.message}`, interactionLocale);
                const reply = extendedInteraction.replied
                    ? (msg: string) => extendedInteraction.editReply(msg)
                    : (msg: string) => extendedInteraction.reply({ content: msg, ephemeral: true });

                await reply(message);
                return;
            }

            if (error instanceof Error) {
                Logger.error(error.message, 'Discord');
                return;
            }

            throw error;
        }
    }
}
