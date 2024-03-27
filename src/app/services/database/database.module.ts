import { DynamicModule, Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { glob } from 'glob';
import { resolve } from 'path';

@Module({})
export class DatabaseModule {
    private static async getServices(): Promise<Provider[]> {
        const globRepositories = await glob('./repositories/**/*.repository{.ts,.js}', { cwd: __dirname });
        const result: Provider[] = [];

        for (const globRepository of globRepositories) {
            const repositoryPath = resolve(__dirname, globRepository);
            const repository: { [key: string]: Provider } = await require(repositoryPath);
            result.push(...Object.values(repository));
        }

        return result;
    }

    public static async register(): Promise<DynamicModule> {
        const services = await this.getServices();

        return {
            module: DatabaseModule,
            imports: [TypeOrmModule.forFeature()],
            providers: services,
            exports: services,
        };
    }
}
