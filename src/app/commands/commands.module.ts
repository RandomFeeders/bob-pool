import { DynamicModule, INestApplicationContext, Module, Provider } from '@nestjs/common';
import { DiscordBot } from '../services/discord/discord-bot';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from '../services/services.module';
import { glob } from 'glob';
import { resolve } from 'path';
import { DiscordCommand } from '../services/discord/discord-command';

@Module({})
export class CommandsModule {
    private static async getServices(): Promise<Provider[]> {
        const globRepositories = await glob('./**/*{.ts,.js}', { cwd: __dirname });
        const result: Provider[] = [];

        for (const globRepository of globRepositories) {
            const commandPath = resolve(__dirname, globRepository);
            const command: { [key: string]: Provider } = await require(commandPath);
            result.push(...Object.values(command));
        }

        return result.filter((command) => command != CommandsModule);
    }

    public async initialize(app: INestApplicationContext, discordBot: DiscordBot): Promise<void> {
        const commands = await CommandsModule.getServices();
        const commandInstances: DiscordCommand[] = await Promise.all(
            commands.map(async (command) => app.resolve(command as any))
        );

        for (const commandInstance of commandInstances) {
            discordBot.commands[commandInstance.name] = commandInstance;
        }
    }

    public static async register(): Promise<DynamicModule> {
        const commands = await this.getServices();

        return {
            module: CommandsModule,
            imports: [TypeOrmModule.forFeature(), ServicesModule],
            providers: commands,
            exports: commands,
        };
    }
}
