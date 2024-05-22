import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { Computer } from '../entities/computer.entity';
import { ComputerService } from '../services/computer.service';
import { CreateStatisticsDto, ReadStatisticsDto } from '../dto/statistics.dto';
import { LogWindowsService } from '../services/log-windows.service';
import { PeriodComputerWorkService } from '../services/period-computer-work.service';
import { DayComputerWorkService } from '../services/day-computer-work.service';
import { MonthComputerWorkService } from '../services/month-computer-work.service';
import { YearComputerWorkService } from '../services/year-computer-work.service';
import { StatisticsHours, StatisticsPeriod } from '../types/statistics.options';
import { getDateDiffHours, getDayNext, getDayStart, getMonthNext, getMonthStart, getYearNext, getYearStart } from '../types/date.functions';

@Controller('statistics')
export class StatisticsController {
  constructor(
    private readonly computerService: ComputerService,
    private readonly logWindowsService: LogWindowsService,
    private readonly periodComputerWorkService: PeriodComputerWorkService,
    private readonly dayComputerWorkService: DayComputerWorkService,
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

    let datesYear = [];
    let datesMonth = [];
    let datesDay = [dateStart];

    let nextYear = getYearNext(dateStart);
    while(nextYear.getTime() < dateEnd.getTime()) {
        datesYear.push(nextYear);
        nextYear = getYearNext(nextYear);
    }

    let computersYearWork = [];
    if(datesYear.length !== 0) {
        const currentYear = datesYear.pop()
        let currentMonth = currentYear;
        while(currentMonth.getTime() < dateEnd.getTime()) {
            datesMonth.push(currentMonth);
            currentMonth = getMonthNext(currentMonth);
        }
        let currentDay = currentYear;
        if(datesMonth.length !== 0) {
            currentDay = datesMonth.pop();
        }
        while(currentDay.getTime() < dateEnd.getTime()) {
            datesDay.push(currentDay);
            currentDay = getDayNext(currentDay);
        }
        computersYearWork = await this.yearComputerWorkService.readWorkHours(datesYear, readStatisticsDto.computers);
        dateEnd = getYearNext(dateStart);
    }

    //выбор часов работы по оставшимся месяцам
    let nextMonth = getMonthNext(dateStart);
    while(nextMonth.getTime() < dateEnd.getTime()) {
        datesMonth.push(nextMonth);
        nextMonth = getMonthNext(nextMonth);
    }

    let computersMonthWork = [];
    if(datesMonth.length !== 0) {
        computersMonthWork = await this.monthComputerWorkService.readWorkHours(datesMonth, readStatisticsDto.computers);
        dateEnd = getMonthNext(dateStart);
    }

    let nextDay = getDayNext(dateStart);
    while(nextDay.getTime() < dateEnd.getTime()) {
        datesDay.push(nextDay);
        nextDay = getDayNext(nextDay);
    }

    let computersDayWork = [];
    if(datesDay.length !== 0) {
        computersDayWork = await this.dayComputerWorkService.readWorkHours(datesDay, readStatisticsDto.computers);
        dateEnd = getDayNext(dateStart);
    }

    //суммируем часы работы по компьютерам
    let computersMap = new Map();
    for(let el of computersDayWork) {
        if(computersMap.get(el.computer.id) == undefined) {
            computersMap.set(el.computer.id, { computer: el.computer, hours: el.hours });
        } else {
            computersMap.set(el.computer.id, { computer: el.computer, hours: el.hours + computersMap.get(el.computer.id).hours });
        }
    }
    for(let el of computersMonthWork) {
        if(computersMap.get(el.computer.id) == undefined) {
            computersMap.set(el.computer.id, { computer: el.computer, hours: el.hours });
        } else {
            computersMap.set(el.computer.id, { computer: el.computer, hours: el.hours + computersMap.get(el.computer.id).hours });
        }
    }
    for(let el of computersYearWork) {
        if(computersMap.get(el.computer.id) == undefined) {
            computersMap.set(el.computer.id, { computer: el.computer, hours: el.hours });
        } else {
            computersMap.set(el.computer.id, { computer: el.computer, hours: el.hours + computersMap.get(el.computer.id).hours });
        }
    }
    
    return {
        dateStart: dateStart,
        dateEnd:readStatisticsDto.dateEnd,
        computers: Array.from(computersMap, ([name, value]) => (value)),
    }

  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createStatisticsAction(@Body() packet: CreateStatisticsDto): Promise<void> {
    //получили компьютер, если такого нет - создали
    const computerOptions = { 
        name: packet.computerName, 
        macAddress: packet.macAddress, 
        ipAddress: packet.ipAddress, 
        audince: packet.audince,
    };
    let computer = await this.computerService.readOne(computerOptions);
    if(computer == null) {
        computer = await this.computerService.create(computerOptions);
    }

    //запись в таблицу логов
    const logWindowsOptions = {
        computerId: computer.id,
        type: packet.type,
        loginId: packet.loginId,
        date: packet.date,
        operatingSystem: packet.operatingSystem,
    };
    this.logWindowsService.create(logWindowsOptions);

    //запись в таблицу периодов
    const periodComputerWorkOptions = {
        computerId: computer.id,
        dateStart: packet.date,
        operatingSystem: packet.operatingSystem,
        loginId: packet.loginId,
    };

    let dayHours = [];
    let monthHours = [];
    let yearHours = [];

    if(packet.type) {
        const createdPeriodComputerWork = await this.periodComputerWorkService.create(periodComputerWorkOptions);
        const dateStart = new Date(createdPeriodComputerWork.dateStart);
        dayHours.push({ day: getDayStart(dateStart), hours: 0 });
        monthHours.push({ month: getMonthStart(dateStart), hours: 0 });
        yearHours.push({ year: getYearStart(dateStart), hours: 0 });
    } else {
        const existingPeriodComputerWork = await this.periodComputerWorkService.readOne({
            computerId: computer.id,
            operatingSystem: packet.operatingSystem,
            loginId: packet.loginId,
        });
        const updatedComputerWork = await this.periodComputerWorkService.update(existingPeriodComputerWork.id, { dateEnd: packet.date });
        const dateStart = new Date(updatedComputerWork.dateStart);
        const dateEnd = new Date(updatedComputerWork.dateEnd);
        if(getDayStart(dateStart).getTime() !== getDayStart(dateEnd).getTime()) {
            let currentDay = dateStart;
            let nextDay = getDayNext(dateStart);
            while(nextDay < dateEnd) {
                dayHours.push({ hours: getDateDiffHours(currentDay, nextDay), day: getDayStart(currentDay) });
                currentDay = nextDay;
                nextDay = getDayNext(currentDay);
            }
            dayHours.push({ hours: getDateDiffHours(currentDay, dateEnd), day: currentDay });
        } else {
            dayHours.push({ hours: getDateDiffHours(dateStart, dateEnd), day: getDayStart(dateStart) });
        }
        if(getMonthStart(dateStart).getTime() !== getMonthStart(dateEnd).getTime()) {
            let currentMonth = dateStart;
            let nextMonth = getMonthNext(dateStart);
            while(nextMonth < dateEnd) {
                monthHours.push({ hours: getDateDiffHours(currentMonth, nextMonth), month: getMonthStart(currentMonth) });
                currentMonth = nextMonth;
                nextMonth = getMonthNext(currentMonth);
            }
            monthHours.push({ hours: getDateDiffHours(currentMonth, dateEnd), month: currentMonth });
        } else {
            monthHours.push({ hours: getDateDiffHours(dateStart, dateEnd), month: getMonthStart(dateStart) });
        }
        if(getYearStart(dateStart).getTime() !== getYearStart(dateEnd).getTime()) {
            let currentYear = dateStart;
            let nextYear = getYearNext(dateStart);
            while(nextYear < dateEnd) {
                yearHours.push({ hours: getDateDiffHours(currentYear, nextYear), year: getYearStart(currentYear) });
                currentYear = nextYear;
                nextYear = getYearNext(currentYear);
            }
            yearHours.push({ hours: getDateDiffHours(currentYear, dateEnd), year: currentYear });
        } else {
            yearHours.push({ hours: getDateDiffHours(dateStart, dateEnd), year: getYearStart(dateStart) });
        }
        //hours = getDateDiffHours(updatedComputerWork.dateStart, updatedComputerWork.dateEnd);
    }

    //запись в таблицы времени работы по дням/неделям/месяцам/годам
    for(let el of dayHours) {
        const dayComputerWorkOptions = {
            date: el.day,
            computerId: computer.id,
            operatingSystem: packet.operatingSystem,
        }
        let dayComputerWork = await this.dayComputerWorkService.readOne(dayComputerWorkOptions);
        if(dayComputerWork == null) {
            dayComputerWork = await this.dayComputerWorkService.create({
                hours: 0,
                ...dayComputerWorkOptions,
            });
        }
        if(!packet.type) {
            await this.dayComputerWorkService.update(dayComputerWork.id, { hours: dayComputerWork.hours + el.hours });
        }
    }
    for(let el of monthHours) {
        const monthComputerWorkOptions = {
            date: el.month,
            computerId: computer.id,
            operatingSystem: packet.operatingSystem,
        }
        let monthComputerWork = await this.monthComputerWorkService.readOne(monthComputerWorkOptions);
        if(monthComputerWork == null) {
            monthComputerWork = await this.monthComputerWorkService.create({
                hours: 0,
                ...monthComputerWorkOptions,
            });
        }
        if(!packet.type) {
            await this.monthComputerWorkService.update(monthComputerWork.id, { hours: monthComputerWork.hours + el.hours });
        }
    }
    for(let el of yearHours) {
        const yearComputerWorkOptions = {
            date: el.year,
            computerId: computer.id,
            operatingSystem: packet.operatingSystem,
        }
        let yearComputerWork = await this.yearComputerWorkService.readOne(yearComputerWorkOptions);
        if(yearComputerWork == null) {
            yearComputerWork = await this.yearComputerWorkService.create({
                hours: 0,
                ...yearComputerWorkOptions,
            });
        }
        if(!packet.type) {
            await this.yearComputerWorkService.update(yearComputerWork.id, { hours: yearComputerWork.hours + el.hours });
        }
    }
  }
}