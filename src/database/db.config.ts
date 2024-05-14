import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const dbconfig: TypeOrmModuleOptions = {
	type: 'postgres',
	host: process.env.POSTGRES_DB_HOST || 'localhost',
	port: Number.parseInt(process.env.POSTGRES_DB_PORT || '5432', 10),
	username: process.env.POSTGRES_DB_USERNAME || 'postgres',
	password: process.env.POSTGRES_DB_PASSWORD || 'root',
	database: process.env.POSTGRES_DB_NAME || 'univer',
	entities: [],
	autoLoadEntities: true,
	synchronize: false,
};

export { dbconfig };
