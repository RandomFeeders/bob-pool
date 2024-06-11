import { LocaleService } from '@app/services/locale/locale.service';
import {
    ApplicationCommandOptionBase,
    ApplicationCommandOptionType,
    LocalizationMap,
    SlashCommandAttachmentOption,
    SlashCommandBooleanOption,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandMentionableOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandUserOption,
} from 'discord.js';
import { DiscordCommandBuilder } from './discord-command';

type TypeMapper = {
    [key: number]: { type: new () => ApplicationCommandOptionBase; applier: keyof DiscordCommandBuilder };
};
type OptionChoices<T extends number | string> = { [key: string]: T };

export abstract class DiscordCommandOptionBase {
    public key: string;
    public required: boolean = false;
    public abstract readonly type: ApplicationCommandOptionType;

    public constructor(key: string, required: boolean) {
        this.key = key;
        this.required = required;
    }

    public apply(command: DiscordCommandBuilder, localeService: LocaleService) {
        const typeMapper: TypeMapper = {
            [ApplicationCommandOptionType.Attachment]: {
                type: SlashCommandAttachmentOption,
                applier: 'addAttachmentOption',
            },
            [ApplicationCommandOptionType.Boolean]: { type: SlashCommandBooleanOption, applier: 'addBooleanOption' },
            [ApplicationCommandOptionType.Channel]: { type: SlashCommandChannelOption, applier: 'addChannelOption' },
            [ApplicationCommandOptionType.Integer]: { type: SlashCommandIntegerOption, applier: 'addIntegerOption' },
            [ApplicationCommandOptionType.Mentionable]: {
                type: SlashCommandMentionableOption,
                applier: 'addMentionableOption',
            },
            [ApplicationCommandOptionType.Number]: { type: SlashCommandNumberOption, applier: 'addNumberOption' },
            [ApplicationCommandOptionType.Role]: { type: SlashCommandRoleOption, applier: 'addRoleOption' },
            [ApplicationCommandOptionType.String]: { type: SlashCommandStringOption, applier: 'addStringOption' },
            [ApplicationCommandOptionType.User]: { type: SlashCommandUserOption, applier: 'addUserOption' },
        };

        const mapper = typeMapper[this.type];
        const options = new mapper.type();

        const localizedNames = localeService.getAllTranslations(`commands.${command.key}.options.${this.key}.name`);
        const localizedDescriptions = localeService.getAllTranslations(
            `commands.${command.key}.options.${this.key}.description`
        );

        options.setName(localizedNames['en-US']);
        options.setNameLocalizations(localizedNames);
        options.setDescription(localizedDescriptions['en-US']);
        options.setDescriptionLocalizations(localizedDescriptions);
        options.setRequired(this.required);

        const translateMapper = (key: string) => localeService.getAllTranslations(`commands.${command.key}.options.${this.key}.choices.${key}`);
        this.applyOptions(options, translateMapper);

        (command as any)[mapper.applier](options);
    }

    protected abstract applyOptions(
        option: ApplicationCommandOptionBase,
        translateMapper: (key: string) => LocalizationMap
    ): void;
}

export class DiscordCommandAttachmentOption extends DiscordCommandOptionBase {
    public type: ApplicationCommandOptionType.Attachment = ApplicationCommandOptionType.Attachment;

    public constructor(key: string, required: boolean = false) {
        super(key, required);
    }

    public applyOptions(
        option: ApplicationCommandOptionBase,
        translateMapper: (key: string) => LocalizationMap
    ): void {}
}

export class DiscordCommandBooleanOption extends DiscordCommandOptionBase {
    public type: ApplicationCommandOptionType.Boolean = ApplicationCommandOptionType.Boolean;

    public constructor(key: string, required: boolean = false) {
        super(key, required);
    }

    public applyOptions(
        option: ApplicationCommandOptionBase,
        translateMapper: (key: string) => LocalizationMap
    ): void {}
}

export class DiscordCommandChannelOption extends DiscordCommandOptionBase {
    public type: ApplicationCommandOptionType.Channel = ApplicationCommandOptionType.Channel;

    public constructor(key: string, required: boolean = false) {
        super(key, required);
    }

    public applyOptions(
        option: ApplicationCommandOptionBase,
        translateMapper: (key: string) => LocalizationMap
    ): void {}
}

export class DiscordCommandIntegerOption extends DiscordCommandOptionBase {
    public type: ApplicationCommandOptionType.Integer = ApplicationCommandOptionType.Integer;
    public max?: number;
    public min?: number;
    public choices?: OptionChoices<number>;

    public constructor(
        key: string,
        required: boolean = false,
        extras?: { min?: number; max?: number; choices?: OptionChoices<number> }
    ) {
        super(key, required);

        this.min = extras?.min;
        this.max = extras?.max;
        this.choices = extras?.choices;
    }

    public applyOptions(option: SlashCommandIntegerOption, translateMapper: (key: string) => LocalizationMap): void {
        if (!!this.min) option.setMinValue(this.min);
        if (!!this.max) option.setMinValue(this.max);
        if (!!this.choices && Object.keys(this.choices).length !== 0) {
            const choices = Object.keys(this.choices).map((key) => ({
                name: key,
                value: this.choices![key],
                name_localizations: translateMapper(key),
            }));

            option.setChoices(...choices);
        }
    }
}

export class DiscordCommandMentionableOption extends DiscordCommandOptionBase {
    public type: ApplicationCommandOptionType.Mentionable = ApplicationCommandOptionType.Mentionable;

    public constructor(key: string, required: boolean = false) {
        super(key, required);
    }

    public applyOptions(
        option: ApplicationCommandOptionBase,
        translateMapper: (key: string) => LocalizationMap
    ): void {}
}

export class DiscordCommandNumberOption extends DiscordCommandOptionBase {
    public type: ApplicationCommandOptionType.Number = ApplicationCommandOptionType.Number;
    public max?: number;
    public min?: number;
    public choices?: OptionChoices<number>;

    public constructor(
        key: string,
        required: boolean = false,
        extras?: { min?: number; max?: number; choices?: OptionChoices<number> }
    ) {
        super(key, required);

        this.min = extras?.min;
        this.max = extras?.max;
        this.choices = extras?.choices;
    }

    public applyOptions(option: SlashCommandNumberOption, translateMapper: (key: string) => LocalizationMap): void {
        if (!!this.min) option.setMinValue(this.min);
        if (!!this.max) option.setMinValue(this.max);
        if (!!this.choices && Object.keys(this.choices).length !== 0) {
            const choices = Object.keys(this.choices).map((key) => ({
                name: key,
                value: this.choices![key],
                name_localizations: translateMapper(key),
            }));

            option.setChoices(...choices);
        }
    }
}

export class DiscordCommandRoleOption extends DiscordCommandOptionBase {
    public type: ApplicationCommandOptionType.Role = ApplicationCommandOptionType.Role;

    public constructor(key: string, required: boolean = false) {
        super(key, required);
    }

    public applyOptions(
        option: ApplicationCommandOptionBase,
        translateMapper: (key: string) => LocalizationMap
    ): void {}
}

export class DiscordCommandStringOption extends DiscordCommandOptionBase {
    public type: ApplicationCommandOptionType.String = ApplicationCommandOptionType.String;
    public maxLength?: number;
    public minLength?: number;
    public choices?: OptionChoices<string>;

    public constructor(
        key: string,
        required: boolean = false,
        extras?: { minLength?: number; maxLength?: number; choices?: OptionChoices<string> }
    ) {
        super(key, required);

        this.minLength = extras?.minLength;
        this.maxLength = extras?.maxLength;
        this.choices = extras?.choices;
    }

    public applyOptions(option: SlashCommandStringOption, translateMapper: (key: string) => LocalizationMap): void {
        if (!!this.minLength) option.setMinLength(this.minLength);
        if (!!this.maxLength) option.setMaxLength(this.maxLength);
        if (!!this.choices && Object.keys(this.choices).length !== 0) {
            const choices = Object.keys(this.choices).map((key) => ({
                name: key,
                value: this.choices![key],
                name_localizations: translateMapper(key),
            }));

            option.setChoices(...choices);
        }
    }
}

export class DiscordCommandUserOption extends DiscordCommandOptionBase {
    public type: ApplicationCommandOptionType.User = ApplicationCommandOptionType.User;

    public constructor(key: string, required: boolean = false) {
        super(key, required);
    }

    public applyOptions(
        option: ApplicationCommandOptionBase,
        translateMapper: (key: string) => LocalizationMap
    ): void {}
}
