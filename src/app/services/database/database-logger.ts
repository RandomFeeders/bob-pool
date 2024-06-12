import { AbstractLogger, LogLevel, LogMessage, QueryRunner } from 'typeorm';
import { Logger } from '@library/log/logger';

export class DatabaseLogger extends AbstractLogger {
    protected writeLog(
        level: LogLevel,
        message: string | number | LogMessage | (string | number | LogMessage)[],
        queryRunner?: QueryRunner | undefined
    ): void {
        const loggerFuncMapper = {
            info: Logger.info,
            error: Logger.error,
            log: Logger.debug,
            migration: Logger.debug,
            query: Logger.debug,
            schema: Logger.debug,
            warn: Logger.warn,
        };

        loggerFuncMapper[level](message, 'Database');
        queryRunner;
    }
}
