import { Interaction, Locale } from 'discord.js';
import { DiscordEvent } from '../models/discord/discord-event';
import { Injectable } from '@nestjs/common';
import { DiscordBot } from '../services/discord/discord-bot';
import { DiscordInteraction } from '../models/discord/discord-command';
import { UserRepository } from '../services/database/repositories/user.repository';
import { LocalizedError } from '../models/locale/localized-error';
import { LocaleService } from '../services/locale/locale.service';
import { User } from '../services/database/entities/user.entity';
import { Logger } from '../services/logger';

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
        if (!interaction.isCommand()) return;

        const bot = interaction.client as DiscordBot;
        const command = bot.commands[interaction.commandName];
        if (!command) return;

        const injectedInteraction = interaction as DiscordInteraction;
        const interactionLocale = this.localeService.availableLocales.includes(interaction.locale)
            ? interaction.locale
            : interaction.guildLocale ?? Locale.EnglishUS;

        injectedInteraction.member.locale = interactionLocale;
        injectedInteraction.member.data = await this.getUserData(injectedInteraction.member.id);

        try {
            await command.execute(injectedInteraction);
        } catch (error: unknown) {
            if (error instanceof LocalizedError) {
                const message = this.localeService.translate(`errors.${error.message}`, interactionLocale);
                const reply = injectedInteraction.replied
                    ? (msg: string) => injectedInteraction.editReply(msg)
                    : (msg: string) => injectedInteraction.reply(msg);

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
