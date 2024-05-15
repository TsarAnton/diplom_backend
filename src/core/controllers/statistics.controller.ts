import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { Computer } from '../entities/computer.entity';
import { ComputerService } from '../services/computer.service';
import { CreateStatisticsDto } from '../dto/statistics.dto';
import { LogWindowsService } from '../services/log-windows.service';
import { PeriodComputerWorkService } from '../services/period-computer-work.service';
import { DayComputerWorkService } from '../services/day-computer-work.service';
import { WeekComputerWorkService } from '../services/week-computer-work.service';
import { MonthComputerWorkService } from '../services/month-computer-work.service';
import { YearComputerWorkService } from '../services/year-computer-work.service';

@Controller('statistics')
export class ComputerController {
  constructor(
    private readonly computerService: ComputerService,
    private readonly logWindowsService: LogWindowsService,
    private readonly periodComputerWork: PeriodComputerWorkService,
    private readonly dayComputerWorkService: DayComputerWorkService,
    private readonly weekComputerWorkService: WeekComputerWorkService,
    private readonly monthComputerWorkService: MonthComputerWorkService,
    private readonly yearComputerWorkService: YearComputerWorkService,
    ){
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createStatisticsAction(@Body() properties: CreateStatisticsDto): Promise<void>{
    const computerOptions = { 
        name: properties.computerName, 
        macAddress: properties.macAddress, 
        ipAddress: properties.ipAddress, 
        audince: properties.audince,
    };
    let computer = await this.computerService.readOne(computerOptions);
    if(computer == null) {
        computer = await this.computerService.create(computerOptions);
    }

    const logWindowsOptions = {
        computerId: computer.id,
        type: properties.type,
        loginId: properties.loginId,
        date: properties.date,
        operatingSystem: properties.operatingSystem,
    };
    this.logWindowsService.create(logWindowsOptions);

    const periodComputerWorkOptions = {
        computerId: computer.id,
        dateStart: properties.date,
        operatingSystem: properties.operatingSystem,
        loginId: properties.loginId,
    };

    let hours = 0;
    if(properties.type) {
        this.periodComputerWork.create(periodComputerWorkOptions);
    } else {
        const periodComputerWork = await this.periodComputerWork.readOne(periodComputerWorkOptions);
        const updatedComputerWork = await this.periodComputerWork.update(periodComputerWork.id, { dateEnd: properties.date });
        hours = (updatedComputerWork.dateEnd.getTime() - updatedComputerWork.dateStart.getTime()) / 3600000; 
    }

    const propertiesDate = properties.date;
    const startDayDate = new Date(propertiesDate.getFullYear(), propertiesDate.getMonth(), propertiesDate.getDate(), 0, 0, 0, 0);
    const startWeekDate = new Date(startDayDate.getTime() - (startDayDate.getDay() === 0 ? 6 : (startDayDate.getDay() - 1)) * 86400000);
    const startMonthDate = new Date(startDayDate.getFullYear(), propertiesDate.getMonth(), 1);
    const startYearDate = new Date(startDayDate.getFullYear(), 0, 1);

    const dayComputerWorkOptions = {
        date: startDayDate,
        computerId: computer.id,
        operatingSystem: properties.operatingSystem,
        hours: hours,
    }
    const weekComputerWorkOptions = {
        date: startWeekDate,
        computerId: computer.id,
        operatingSystem: properties.operatingSystem,
        hours: hours,
    }
    const monthComputerWorkOptions = {
        date: startMonthDate,
        computerId: computer.id,
        operatingSystem: properties.operatingSystem,
        hours: hours,
    }
    const yearComputerWorkOptions = {
        date: startYearDate,
        computerId: computer.id,
        operatingSystem: properties.operatingSystem,
        hours: hours,
    }


    let dayComputerWork = await this.dayComputerWorkService.readOne(dayComputerWorkOptions);
    let weekComputerWork = await this.weekComputerWorkService.readOne(weekComputerWorkOptions);
    let monthComputerWork = await this.monthComputerWorkService.readOne(monthComputerWorkOptions);
    let yearComputerWork = await this.yearComputerWorkService.readOne(yearComputerWorkOptions);
    if(properties.type) {
        if(dayComputerWork == null) {
            dayComputerWork = await this.dayComputerWorkService.create(dayComputerWorkOptions);
        }
        if(weekComputerWork == null) {
            weekComputerWork = await this.weekComputerWorkService.create(weekComputerWorkOptions);
        }
        if(monthComputerWork == null) {
            monthComputerWork = await this.monthComputerWorkService.create(monthComputerWorkOptions);
        }
        if(yearComputerWork == null) {
            yearComputerWork = await this.yearComputerWorkService.create(yearComputerWorkOptions);
        }
    } else {
        this.dayComputerWorkService.update(dayComputerWork.id, { hours: dayComputerWork.hours + hours });
        this.weekComputerWorkService.update(weekComputerWork.id, { hours: weekComputerWork.hours + hours });
        this.monthComputerWorkService.update(monthComputerWork.id, { hours: monthComputerWork.hours + hours });
        this.yearComputerWorkService.update(yearComputerWork.id, { hours: yearComputerWork.hours + hours });
    }
  }
}