import { Module } from '@nestjs/common';

import { Computer } from './entities/computer.entity';
import { Log } from './entities/log.entity';
import { MonthComputerWork } from './entities/month-computer-work.entity';

import { ComputerService } from './services/computer.service';
import { LogService } from './services/log.service';

import { ComputerController } from './controllers/computer.controller';
import { LogController } from './controllers/log-windows.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DayComputerWorkController } from './controllers/day-computer-work.controller';
import { MonthComputerWorkController } from './controllers/month-computer-work.controller';
import { YearComputerWorkController } from './controllers/year-computer-work.controller';
import { DayComputerWork } from './entities/day-computer-work.entity';
import { YearComputerWork } from './entities/year-computer-work.entity';
import { PeriodComputerWork } from './entities/period-computer-work.entity';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { PeriodComputerWorkController } from './controllers/period-computer-work.controller';
import { UserController } from './controllers/user.controller';
import { RoleController } from './controllers/role.controller';
import { StatisticsController } from './controllers/statistics.controller';
import { DayComputerWorkService } from './services/day-computer-work.service';
import { MonthComputerWorkService } from './services/month-computer-work.service';
import { YearComputerWorkService } from './services/year-computer-work.service';
import { PeriodComputerWorkService } from './services/period-computer-work.service';
import { UserService } from './services/user.service';
import { RoleService } from './services/role.service';
import { UserRole } from './entities/user-role.entity';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Computer, 
			Log,
			DayComputerWork,
			MonthComputerWork,
			YearComputerWork,
			PeriodComputerWork,
			User,
			Role,
			UserRole
		]),
	],
	controllers: [
		ComputerController,
		LogController,
		DayComputerWorkController,
		MonthComputerWorkController,
		YearComputerWorkController,
		PeriodComputerWorkController,
		UserController,
		RoleController,
		StatisticsController,
	],
	providers: [
		ComputerService,
		LogService,
		DayComputerWorkService,
		MonthComputerWorkService,
		YearComputerWorkService,
		PeriodComputerWorkService,
		UserService,
		RoleService,
		JwtService,
	],
	exports: [
		ComputerService,
		LogService,
		DayComputerWorkService,
		MonthComputerWorkService,
		YearComputerWorkService,
		PeriodComputerWorkService,
		UserService,
		RoleService,
	],
})
export class CoreModule {}