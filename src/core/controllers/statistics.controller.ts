import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { Computer } from '../entities/computer.entity';
import { ComputerService } from '../services/computer.service';
import { CreateStatisticsDto, ReadStatisticsDto } from '../dto/statistics.dto';
import { LogWindowsService } from '../services/log-windows.service';
import { PeriodComputerWorkService } from '../services/period-computer-work.service';
import { DayComputerWorkService } from '../services/day-computer-work.service';
import { WeekComputerWorkService } from '../services/week-computer-work.service';
import { MonthComputerWorkService } from '../services/month-computer-work.service';
import { YearComputerWorkService } from '../services/year-computer-work.service';
import { StatisticsHours, StatisticsPeriod } from '../types/statistics.options';
import { getDayNext, getDayStart, getMonthNext, getMonthStart, getWeekNext, getWeekStart, getYearNext, getYearStart } from '../types/date.functions';

@Controller('statistics')
export class ComputerController {
  constructor(
    private readonly computerService: ComputerService,
    private readonly logWindowsService: LogWindowsService,
    private readonly periodComputerWorkService: PeriodComputerWorkService,
    private readonly dayComputerWorkService: DayComputerWorkService,
    private readonly weekComputerWorkService: WeekComputerWorkService,
    private readonly monthComputerWorkService: MonthComputerWorkService,
    private readonly yearComputerWorkService: YearComputerWorkService,
    ){
  }

  @Get('/periods')
  @HttpCode(HttpStatus.OK)
  getPeriodsAction(@Query() readStatisticsDto: ReadStatisticsDto): Promise<StatisticsPeriod> {
    return this.periodComputerWorkService.readWorkPeriods(readStatisticsDto);
  }

  @Get('/hours')
  @HttpCode(HttpStatus.OK)
  async getHoursAction(@Query() readStatisticsDto: ReadStatisticsDto): Promise<StatisticsHours> {
    let { dateStart, dateEnd } = readStatisticsDto;

    //выбор часов работы по годам
    let datesYear = [];
    let nextYear = getYearNext(dateStart);
    while(nextYear.getTime() < dateEnd.getTime()) {
        datesYear.push(nextYear);
        nextYear = getYearNext(nextYear);
    }

    let computersYearWork = [];
    if(datesYear.length !== 0) {
        computersYearWork = await this.yearComputerWorkService.readWorkHours(datesYear);
        dateEnd = getYearNext(dateStart);
    }

    //выбор часов работы по оставшимся месяцам
    let datesMonth = [];
    let nextMonth = getMonthNext(dateStart);
    while(nextMonth.getTime() < dateEnd.getTime()) {
        datesMonth.push(nextMonth);
        nextMonth = getMonthNext(nextMonth);
    }

    let computersMonthWork = [];
    if(datesMonth.length !== 0) {
        computersMonthWork = await this.monthComputerWorkService.readWorkHours(datesMonth);
        dateEnd = getMonthNext(dateStart);
    }

    //выбор часов работы по оставшимся неделям
    let datesWeek = [];
    let nextWeek = getWeekNext(dateStart);
    while(nextWeek.getTime() < dateEnd.getTime()) {
        datesWeek.push(nextWeek);
        nextWeek = getWeekNext(nextWeek);
    }

    let computersWeekWork = [];
    if(datesWeek.length !== 0) {
        computersWeekWork = await this.weekComputerWorkService.readWorkHours(datesWeek);
        dateEnd = getWeekNext(dateStart);
    }

    //выбор часов работы по оставшимся дням
    let datesDay = [dateStart];
    let nextDay = getDayNext(dateStart);
    while(nextDay.getTime() < dateEnd.getTime()) {
        datesDay.push(nextDay);
        nextDay = getDayNext(nextDay);
    }

    let computersDayWork = [];
    if(datesDay.length !== 0) {
        computersDayWork = await this.dayComputerWorkService.readWorkHours(datesDay);
        dateEnd = getDayNext(dateStart);
    }

  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createStatisticsAction(@Body() properties: CreateStatisticsDto): Promise<void> {
    //получили компьютер, если такого нет - создали
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

    //запись в таблицу логов
    const logWindowsOptions = {
        computerId: computer.id,
        type: properties.type,
        loginId: properties.loginId,
        date: properties.date,
        operatingSystem: properties.operatingSystem,
    };
    this.logWindowsService.create(logWindowsOptions);


    //запись в таблицу периодов
    const periodComputerWorkOptions = {
        computerId: computer.id,
        dateStart: properties.date,
        operatingSystem: properties.operatingSystem,
        loginId: properties.loginId,
    };

    let hours = 0;
    if(properties.type) {
        this.periodComputerWorkService.create(periodComputerWorkOptions);
    } else {
        const periodComputerWorkService = await this.periodComputerWorkService.readOne(periodComputerWorkOptions);
        const updatedComputerWork = await this.periodComputerWorkService.update(periodComputerWorkService.id, { dateEnd: properties.date });
        hours = (updatedComputerWork.dateEnd.getTime() - updatedComputerWork.dateStart.getTime()) / 3600000; 
    }

    //запись в таблицы времени работы по дням/неделям/месяцам/годам
    const propertiesDate = properties.date;
    const startDayDate = getDayStart(propertiesDate);
    const startWeekDate = getWeekStart(propertiesDate);
    const startMonthDate = getMonthStart(propertiesDate);
    const startYearDate = getYearStart(propertiesDate);

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