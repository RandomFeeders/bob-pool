import { JsonConverter } from '@library/json/json-converter';
import { ConsoleFormats } from './console-formats';
import { LogMessage } from './log-message';

function log<T extends LogMessage>({
    message,
    source,
    severity,
    format,
}: {
    message: T;
    source: string;
    severity: string;
    format: string;
}): void {
    try {
        const stringifier = {
            string: () => message as string,
            number: () => message.toString(),
            bigint: () => message.toString(),
            boolean: () => (message === true ? 'true' : 'false'),
            function: () => message.toString(),
            object: () => JsonConverter.stringify(message as object),
            symbol: () => message.toString(),
            undefined: () => 'undefined',
        };

        const stringifiedMessage = stringifier[typeof message]();

        const date = new Date().toLocaleString('pt-BR');
        const log = `[${date}] [${source}] ${severity}: ${stringifiedMessage}`;

        console.log(`${format}%s${ConsoleFormats.Reset}`, log);
    } catch (err: unknown) {
        console.error(err);
    }
}

export class Logger {
    public static info<T extends LogMessage>(message: T, source: string): void {
        log({
            message: message,
            source: source,
            severity: ' INFO',
            format: ConsoleFormats.FgWhite,
        });
    }

    public static success<T extends LogMessage>(message: T, source: string): void {
        log({
            message: message,
            source: source,
            severity: ' INFO',
            format: ConsoleFormats.FgGreen,
        });
    }

    public static warn<T extends LogMessage>(message: T, source: string): void {
        log({
            message: message,
            source: source,
            severity: ' WARN',
            format: ConsoleFormats.FgYellow,
        });
    }

    public static error<T extends LogMessage>(message: T, source: string): void {
        log({
            message: message,
            source: source,
            severity: 'ERROR',
            format: ConsoleFormats.Bright + ConsoleFormats.FgRed,
        });
    }

    public static debug<T extends LogMessage>(message: T, source: string): void {
        if (process.env.DEBUG !== 'true') return;

        log({
            message: message,
            source: source,
            severity: 'DEBUG',
            format: ConsoleFormats.Bright + ConsoleFormats.FgBlack,
        });
    }

    public static trace<T extends LogMessage>(message: T, source: string): void {
        log({
            message: message,
            source: source,
            severity: 'TRACE',
            format: ConsoleFormats.FgRed,
        });
    }
}
