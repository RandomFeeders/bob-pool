import { Injectable } from '@nestjs/common';
import { glob } from 'glob';
import { Logger } from '../logger';
import { Locale } from './locale.model';
import { resolve as pathResolve, parse as pathParse } from 'path';

@Injectable()
export class LocaleService {
    private isInitialized: boolean = false;
    private locales: { [key: string]: Locale } = {};

    public get availableLocales(): string[] {
        return Object.keys(this.locales);
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        const foundLocales = await glob('*.json', { cwd: __dirname + '/translations' });
        const result: string[] = [];

        for (const foundLocale of foundLocales) {
            const locale = await require(pathResolve(__dirname, 'translations', foundLocale));
            const localeName = pathParse(foundLocale).name;
            this.locales[localeName] = locale;
            result.push(localeName);
        }

        Logger.debug('Loaded locales: ' + result.join(', '), 'Locale');
        this.isInitialized = true;
    }

    public translate(key: string, locale: string): string;
    public translate(key: string, locale: string, args?: { [key: string]: unknown }): string;
    public translate(key: string, locale: string, args?: { [key: string]: unknown }): string {
        if (!this.isInitialized) throw new Error('The locale service was not initialized before hand!');

        const validatedLocale = this.availableLocales.includes(locale) ? locale : 'en-US';
        const translations = this.locales[validatedLocale];

        function deepSearch(properties: string[], object: any): any {
            const property = properties.shift();
            if (!property) return object;
            return deepSearch(properties, object[property]);
        }

        const result = deepSearch(key?.split('.') ?? [], translations);
        if (!args || typeof result !== 'string') return result;

        return Object.keys(args).reduce((acc, key) => acc.replaceAll(`{{${key}}}`, `${args[key]}`), result);
    }
}
