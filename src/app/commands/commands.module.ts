import { DynamicModule, INestApplicationContext, Module, Provider } from '@nestjs/common';
import { DiscordBot } from '@app/services/discord/discord-bot';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from '@app/services/services.module';
import { glob } from 'glob';
import { resolve } from 'path';
import { DiscordCommand, DiscordSubCommand } from '@app/models/discord/discord-command';

type ResolvedDiscordCommand = (DiscordCommand & { parent: undefined }) | DiscordSubCommand;

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
        const commandInstances: ResolvedDiscordCommand[] = await Promise.all(
            commands.map(async (command) => app.resolve(command as any))
        );

        for (const commandInstance of commandInstances) {
            if (!!commandInstance.parent) {
                discordBot.subCommands[commandInstance.parent] ??= {};
                discordBot.subCommands[commandInstance.parent][commandInstance.name] = commandInstance;
                continue;
            }
            
            discordBot.commands[commandInstance.name] = commandInstance as DiscordCommand;
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
