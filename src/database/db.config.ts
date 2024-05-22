import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

const dbconfig: TypeOrmModuleOptions = {
	type: 'postgres',
	host: process.env.POSTGRES_DB_HOST || 'localhost',
	port: Number.parseInt(process.env.POSTGRES_DB_PORT || '5432', 10),
	username: process.env.POSTGRES_DB_USERNAME || 'postgres',
	password: process.env.POSTGRES_DB_PASSWORD || 'root',
	database: process.env.POSTGRES_DB_NAME || 'database',
	autoLoadEntities: true,
	synchronize: false,
  	logging: true,
  	entities: ["dist/**/*.entity{.ts,.js}"],
  	migrations: ["migrations/*{.ts,.js}"],
  	migrationsTableName: "migration_table"
};

export { dbconfig };
export const connectionSource = new DataSource({
	cli: {
		migrationsDir: 'migrations'
	},
	...dbconfig
} as DataSourceOptions);
