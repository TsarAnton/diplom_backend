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
import { getDateDiff, getDateDiffHours, getDayNext, getDayStart, getMonthEnd, getMonthNext, getMonthStart, getYearEnd, getYearNext, getYearStart } from '../types/date.functions';
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
    let datesDay = [];

    let nextYear = getYearNext(dateStart);
    while(nextYear.getTime() <= dateEnd.getTime()) {
        datesYear.push(nextYear);
        nextYear = getYearNext(nextYear);
    }

    if(datesYear.length !== 0) {
        const lastYear = datesYear[datesYear.length - 1];
        if(getYearEnd(lastYear).getTime() !== dateEnd.getTime()) {
            
            let currentMonth = datesYear.pop();
            while(currentMonth.getTime() <= dateEnd.getTime()) {
                datesMonth.push(currentMonth);
                currentMonth = getMonthNext(currentMonth);
            }

            if(datesMonth.length !== 0) {
                const lastMonth = datesMonth[datesMonth.length - 1];
                if(getMonthEnd(lastMonth).getTime() !== dateEnd.getTime()) {

                    let currentDay = datesMonth.pop();

                    while(currentDay.getTime() <= dateEnd.getTime()) {
                        datesDay.push(currentDay);
                        currentDay = getDayNext(currentDay);
                    }
                }
            }
        }
    }

    if(datesYear.length !== 0 || datesMonth.length !== 0 || datesDay.length !== 0) {
        dateEnd = getYearEnd(dateStart);
    }

    //выбор часов работы по оставшимся месяцам
    if(getYearStart(dateStart).getTime() === dateStart.getTime() && getYearEnd(dateEnd).getTime() === dateEnd.getTime()) {
        datesYear.push(dateStart);
    } else {
        let nextMonth = getMonthNext(dateStart);
        while(nextMonth.getTime() <= dateEnd.getTime()) {
            datesMonth.push(nextMonth);
            nextMonth = getMonthNext(nextMonth);
        }

        if(dateEnd.getTime() === dateEndCopy.getTime()) {
            const lastMonth = datesMonth[datesMonth.length - 1];
            if(getMonthEnd(lastMonth).getTime() !== dateEnd.getTime()) {
                let currentDay = datesMonth.pop();
                while(currentDay.getTime() <= dateEnd.getTime()) {
                    datesDay.push(currentDay);
                    currentDay = getDayNext(currentDay);
                }
            }
        }

        if(getMonthStart(dateStart).getTime() !== dateStart.getTime()) {
            if(datesMonth.length !== 0) {
                dateEnd = getMonthNext(dateStart);
            }
            datesDay.push(dateStart);
            let nextDay = getDayNext(dateStart);
            while(nextDay.getTime() <= dateEnd.getTime()) {
                datesDay.push(nextDay);
                nextDay = getDayNext(nextDay);
            }
            datesDay.pop();
        } else {
            datesMonth.push(dateStart);
        }
    }

    const computersWork = await this.dayComputerWorkService.readWorkHours({
        datesDay: datesDay,
        datesMonth: datesMonth,
        datesYear: datesYear,
        dateStart: dateStart,
        dateEnd: dateEnd,
        operatingSystem: readStatisticsDto.operatingSystem,
        computerIds: computersArray,
        sorting: readStatisticsDto.sorting,
        pagination: readStatisticsDto.pagination,
    });

    return computersWork;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createStatisticsAction(@Body() packet: CreateStatisticsDto): Promise<CreateStatisticsResult> {
    //получили компьютер, если такого нет - создали
    packet.type = Boolean(packet.type);
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

    //запись в таблицу логов
    const logOptions = {
        computerId: computer.id,
        type: packet.type,
        loginId: packet.loginId,
        date: packet.date,
        operatingSystem: packet.operatingSystem,
    };
    this.logService.create(logOptions);

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

        if(existingPeriodComputerWork == null) {
            throw new NotFoundException(`periodComputerWork with loginId=${packet.loginId}, operatingSystem=${packet.operatingSystem}, computerId=${computer.id} does not exist`);
        }
        
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
            let lastYear = dateStart;
            let nextYear = getYearNext(dateStart);
            while(nextYear < dateEnd) {
                yearHours.push({ hours: getDateDiffHours(lastYear, nextYear), year: getYearStart(lastYear) });
                lastYear = nextYear;
                nextYear = getYearNext(lastYear);
            }
            yearHours.push({ hours: getDateDiffHours(lastYear, dateEnd), year: lastYear });
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
            let hoursFixed = Number(Number(el.hours).toFixed(4));
            await this.dayComputerWorkService.update(dayComputerWork.id, { hours: dayComputerWork.hours + hoursFixed });
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
            let hoursFixed = Number(Number(el.hours).toFixed(4));
            await this.monthComputerWorkService.update(monthComputerWork.id, { hours: monthComputerWork.hours + hoursFixed });
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
            let hoursFixed = Number(Number(el.hours).toFixed(4));
            await this.yearComputerWorkService.update(yearComputerWork.id, { hours: yearComputerWork.hours + hoursFixed });
        }
    }
    return { status: "OK" };
  }
}