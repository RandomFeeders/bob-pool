import { LocalizedError } from '@app/app/models/localized-error';
import { UserRepository } from '@app/app/services/database/repositories/user.repository';
import { DiscordCommand, DiscordCommandCategory, DiscordInteraction } from '@app/app/services/discord/discord-command';
import { LocaleService } from '@app/app/services/locale/locale.service';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LocaleCommand implements DiscordCommand {
    public name: string = 'locale';
    public category = DiscordCommandCategory.CONFIGURATION;

    public constructor(
        private localeService: LocaleService,
        private userRepository: UserRepository
    ) {}

    public async execute(interaction: DiscordInteraction): Promise<void> {
        const selectedLocale = interaction.options.get('locale', true);
        if (!this.localeService.availableLocales.includes(selectedLocale.value as string))
            throw new LocalizedError('errors.unknown_locale');
    }
}
