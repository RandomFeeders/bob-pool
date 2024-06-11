import { Injectable } from '@nestjs/common';
import { Logger } from '@library/log/logger';
import { Locale } from '@app/models/locale/locale.model';
import { translations } from '@assets/translations/translations';

@Injectable()
export class LocaleService {
    private locales: { [key: string]: Locale } = {};

    public constructor() {
        this.locales = translations;
        Logger.info('Loaded locales: ' + Object.keys(this.locales).join(', '), 'Locale');
    }

    public get availableLocales(): string[] {
        return Object.keys(this.locales);
    }

    public get(locale: string): Locale {
        const validatedLocale = this.availableLocales.includes(locale) ? locale : 'en-US';
        return this.locales[validatedLocale];
    }

    public getAllTranslations(key: string): { [key: string]: string } {
        return this.availableLocales.reduce(
            (acc, locale) => {
                acc[locale] = this.translate(key, locale);
                return acc;
            },
            {} as { [key: string]: string }
        );
    }

    public translate(key: string, locale: string): string;
    public translate(key: string, locale: string, args?: { [key: string]: unknown }): string;
    public translate(key: string, locale: string, args?: { [key: string]: unknown }): string {
        const translations = this.get(locale);

        function deepSearch(properties: string[], object: any): any {
            const property = properties.shift();
            if (!property || !object) return object;
            return deepSearch(properties, object[property]);
        }

        const result = deepSearch(key?.split('.') ?? [], translations);
        if (!args || typeof result !== 'string') return result;

        return Object.keys(args).reduce((acc, key) => acc.replaceAll(`{{${key}}}`, `${args[key]}`), result);
    }
}
