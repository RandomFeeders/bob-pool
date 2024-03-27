import 'dotenv/config';
import { ConnectionString } from '@app/library/database/connection-string';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseLogger } from './database-logger';

const connectionString = new ConnectionString(process.env.CONNECTION_STRING!);

const options: TypeOrmModuleOptions = {
    ...connectionString,
    ...connectionString.args,
    synchronize: false,
    entities: [__dirname + '/entities/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    migrationsTableName: '_migrations',
    logger: new DatabaseLogger(),
};

export default options;
