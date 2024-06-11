import { LogLevel, LoggerService } from '@nestjs/common';
import { Logger } from '@library/log/logger';

export class CustomNestLogger implements LoggerService {

    private logLevels: LogLevel[] = [];

    private isLogEnabled(level: LogLevel): boolean {
        if (!this.logLevels || this.logLevels.length === 0) return true;
        return this.logLevels.includes(level);
    }

    public log(message: any, ...optionalParams: any[]) {
        if (!this.isLogEnabled('log')) return;
        Logger.info(message, optionalParams[0] ?? 'NestJS');
    }

    public error(message: any, ...optionalParams: any[]) {
        if (!this.isLogEnabled('error')) return;
        Logger.error(message, optionalParams[0] ?? 'NestJS');
    }

    public warn(message: any, ...optionalParams: any[]) {
        if (!this.isLogEnabled('warn')) return;
        Logger.warn(message, optionalParams[0] ?? 'NestJS');
    }

    public debug?(message: any, ...optionalParams: any[]) {
        if (!this.isLogEnabled('debug')) return;
        Logger.debug(message, optionalParams[0] ?? 'NestJS');
    }

    public verbose?(message: any, ...optionalParams: any[]) {
        if (!this.isLogEnabled('verbose')) return;
        Logger.trace(message, optionalParams[0] ?? 'NestJS');
    }

    public fatal?(message: any, ...optionalParams: any[]) {
        if (!this.isLogEnabled('fatal')) return;
        Logger.error(message, optionalParams[0] ?? 'NestJS');
    }

    public setLogLevels?(levels: LogLevel[]) {
        this.logLevels = levels;
    }

}