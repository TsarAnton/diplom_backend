import { Module } from '@nestjs/common';

import { Computer } from './entities/computer.entity';
import { LogWindows } from './entities/log-windows.entity';

import { ComputerService } from './services/computer.service';
import { LogWindowsService } from './services/log-windows.service';

import { ComputerController } from './controllers/computer.controller';
import { LogWindowsController } from './controllers/log-windows.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
		TypeOrmModule.forFeature([Computer, LogWindows]),
	],
	controllers: [
		ComputerController,
		LogWindowsController,
	],
	providers: [
		ComputerService,
		LogWindowsService,
	],
	exports: [
		ComputerService,
		LogWindowsService,
	],
})
export class CoreModule {}