import { DataSource, DataSourceOptions } from 'typeorm';
import typeOrmConfig from './database-config';

const dataSource = new DataSource(typeOrmConfig as DataSourceOptions);
dataSource.initialize();

export default dataSource;
