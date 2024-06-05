import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { Computer } from '../entities/computer.entity';
import { ComputerService } from '../services/computer.service';
import { CreateStatisticsDto, ReadStatisticsDto } from '../dto/statistics.dto';
import { LogService } from '../services/log.service';
import { PeriodComputerWorkService } from '../services/period-computer-work.service';
import { DayComputerWorkService } from '../services/day-computer-work.service';
import { MonthComputerWorkService } from '../services/month-computer-work.service';
import { YearComputerWorkService } from '../services/year-computer-work.service';
import { CreateStatisticsResult, StatisticsHours, StatisticsPeriod } from '../types/statistics.options';
import { getDateDiff, getDateDiffHours, getDayNext, getDayStart, getMonthNext, getMonthStart, getYearNext, getYearStart } from '../types/date.functions';
import { AuthGuard } from '@nestjs/passport';
import { UpdateComputerDto } from '../dto/computer.dto';

@Controller('statistics')
export class StatisticsController {
  constructor(
    private readonly computerService: ComputerService,
    private readonly logService: LogService,
    private readonly periodComputerWorkService: PeriodComputerWorkService,
    private readonly dayComputerWorkService: DayComputerWorkService,
    private readonly monthComputerWorkService: MonthComputerWorkService,
    private readonly yearComputerWorkService: YearComputerWorkService,
    ){
  }

  @UseGuards(AuthGuard("jwt"))
  @Get('/periods')
  @HttpCode(HttpStatus.OK)
  getPeriodsAction(@Query() readStatisticsDto: ReadStatisticsDto): Promise<StatisticsPeriod> {
    const { computers, ...properties } = readStatisticsDto;
    let computersArray = [];
    if(computers) {
        if(typeof computers === "string") {
            computersArray.push(Number(computers));
        } else {
            computersArray = computers.map(id => Number(id));
        }
    }
    return this.periodComputerWorkService.readWorkPeriods({
        computers: computersArray,
        ...properties,
    });
  }

  @UseGuards(AuthGuard("jwt"))
  @Get('/hours')
  @HttpCode(HttpStatus.OK)
  async getHoursAction(@Query() readStatisticsDto: ReadStatisticsDto): Promise<StatisticsHours> {
    let computersArray = [];
    if(readStatisticsDto.computers) {
        if(typeof readStatisticsDto.computers === "string") {
            computersArray.push(Number(readStatisticsDto.computers));
        } else {
            computersArray = readStatisticsDto.computers.map(id => Number(id));
        }
    }

    let dateStart = new Date(readStatisticsDto.dateStart);
    let dateEnd = new Date(readStatisticsDto.dateEnd);
    const dateEndCopy = new Date(dateEnd.getTime());

    let datesYear = [];
    let datesMonth = [];
    let datesDay = [dateStart];

    let nextYear = getYearNext(dateStart);
    while(nextYear.getTime() <= dateEnd.getTime()) {
        datesYear.push(nextYear);
        nextYear = getYearNext(nextYear);
    }

    let computersYearWork = [];
    if(datesYear.length !== 0) {
        const currentYear = datesYear.pop()
        let currentMonth = currentYear;
        while(currentMonth.getTime() <= dateEnd.getTime()) {
            datesMonth.push(currentMonth);
            currentMonth = getMonthNext(currentMonth);
        }
        let currentDay = currentYear;
        if(datesMonth.length !== 0) {
            currentDay = datesMonth.pop();
        }
        while(currentDay.getTime() <= dateEnd.getTime()) {
            datesDay.push(currentDay);
            currentDay = getDayNext(currentDay);
        }
        if(datesYear.length !== 0) {
            computersYearWork = await this.yearComputerWorkService.readWorkHours(datesYear, computersArray, readStatisticsDto.operatingSystem);
        }
        dateEnd = getYearNext(dateStart);
    }

    //выбор часов работы по оставшимся месяцам
    let nextMonth = getMonthNext(dateStart);
    while(nextMonth.getTime() <= dateEnd.getTime()) {
        datesMonth.push(nextMonth);
        nextMonth = getMonthNext(nextMonth);
    }

    let computersMonthWork = [];
    if(datesMonth.length !== 0) {
        computersMonthWork = await this.monthComputerWorkService.readWorkHours(datesMonth, computersArray, readStatisticsDto.operatingSystem);
        dateEnd = getMonthNext(dateStart);
    }

    let nextDay = getDayNext(dateStart);
    while(nextDay.getTime() <= dateEnd.getTime()) {
        datesDay.push(nextDay);
        nextDay = getDayNext(nextDay);
    }

    let computersDayWork = [];
    if(datesDay.length !== 0) {
        computersDayWork = await this.dayComputerWorkService.readWorkHours(datesDay, computersArray, readStatisticsDto.operatingSystem);
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
    
    let statisticsHours = new StatisticsHours;
    statisticsHours.dateStart = dateStart;
    statisticsHours.dateEnd = dateEndCopy;
    statisticsHours.computers = Array.from(computersMap, ([name, value]) => (value));
    //statisticsHours.meta = null;
    if(readStatisticsDto.sorting) {
        const buff = readStatisticsDto.sorting.column.split(".");
        const sortColumn = buff[0];
        if(buff.length == 2) {
            const sortProp = buff[1];
            if(sortColumn === "computer") {
                statisticsHours.computers.sort(function(a, b) {
                    if(a.computer[sortProp] > b.computer[sortProp]) {
                        return readStatisticsDto.sorting.direction === "ASC" ? 1 : -1;
                    } else if(a.computer[sortProp] < b.computer[sortProp]) {
                        return readStatisticsDto.sorting.direction === "ASC" ? -1 : 1;
                    }
                    return 0;
                });
            }
        } else if(sortColumn === "hours") {
            statisticsHours.computers.sort(function(a, b) {
                if(a.hours > b.hours) {
                    return readStatisticsDto.sorting.direction === "ASC" ? 1 : -1;
                } else if(a.hours < b.hours) {
                    return readStatisticsDto.sorting.direction === "ASC" ? -1 : 1;
                }
                return 0;
            });
        }
    }

    const entitiesCount = statisticsHours.computers.length;
	if(readStatisticsDto.pagination) {
		const pageCount = Math.floor(entitiesCount / readStatisticsDto.pagination.size) - ((entitiesCount % +readStatisticsDto.pagination.size === 0) ? 1: 0);
		const pos = readStatisticsDto.pagination.page * readStatisticsDto.pagination.size;
		statisticsHours.computers = statisticsHours.computers.slice(pos, pos + readStatisticsDto.pagination.size);
		statisticsHours.meta = {
			page: +readStatisticsDto.pagination.page,
			maxPage: pageCount,
			entitiesCount: pageCount === +readStatisticsDto.pagination.page ? (entitiesCount % +readStatisticsDto.pagination.size) : +readStatisticsDto.pagination.size,
		};
	} else {
		statisticsHours.meta = null;
	}
    
    return statisticsHours;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createStatisticsAction(@Body() packet: CreateStatisticsDto): Promise<CreateStatisticsResult> {
    //получили компьютер, если такого нет - создали
    const readComputerOptions = { 
        macAddress: packet.macAddress,
    };
    let computer = await this.computerService.readOne(readComputerOptions);
    if(computer == null) {
        computer = await this.computerService.create({
            macAddress: packet.macAddress,
            ipAddress: packet.ipAddress,
            name: packet.computerName,
        });
    } else {
        let updateComputerDto = new UpdateComputerDto;
        if(computer.name !== packet.computerName) {
            updateComputerDto.name = packet.computerName;
        }
        if(computer.ipAddress !== packet.ipAddress) {
            updateComputerDto.ipAddress = packet.ipAddress;
        }
        if(updateComputerDto.ipAddress || updateComputerDto.name) {
            computer = await this.computerService.update(computer.id, updateComputerDto);
        }
    }

    const isWindows = packet.operatingSystem.includes("Windows");

    if(isWindows) {
    //запись в таблицу логов
        const logOptions = {
            computerId: computer.id,
            type: packet.type,
            loginId: packet.loginId,
            date: packet.date,
            operatingSystem: packet.operatingSystem,
        };
        this.logService.create(logOptions);
    } else {
        const logOptions = {
            computerId: computer.id,
            type: packet.type,
            loginId: "0",
            date: packet.date,
            operatingSystem: packet.operatingSystem,
        };
        this.logService.create(logOptions);
    }

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
        let dateStart = null;
        let dateEnd = null;
        if(isWindows) {
            const existingPeriodComputerWork = await this.periodComputerWorkService.readOne({
                computerId: computer.id,
                operatingSystem: packet.operatingSystem,
                loginId: packet.loginId,
            });
            if(existingPeriodComputerWork == null) {
                throw new NotFoundException(`periodComputerWork with loginId=${packet.loginId}, operatingSystem=${packet.operatingSystem}, computerId=${computer.id} does not exist`);
            }
            const updatedComputerWork = await this.periodComputerWorkService.update(existingPeriodComputerWork.id, { dateEnd: packet.date });
            dateStart = new Date(updatedComputerWork.dateStart);
            dateEnd = new Date(updatedComputerWork.dateEnd);
        } else {
            dateStart = getDateDiff(new Date(packet.date), packet.time);
            dateEnd = new Date(packet.date);
            await this.periodComputerWorkService.create({
                dateStart: dateStart,
                dateEnd: dateEnd,
                operatingSystem: packet.operatingSystem,
                computerId: computer.id,
                loginId: '0',
            });
        }
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
    return { status: "OK" };
  }
}