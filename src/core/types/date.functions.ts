export function getDayStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function getMonthStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getYearStart(date: Date): Date {
    return new Date(date.getFullYear(), 0, 1);
}

export function getDayNext(date: Date): Date {
    return new Date(getDayStart(date).getTime() + 86400000);
}

export function getMonthNext(date: Date): Date {
    if(date.getMonth() === 11) {
        return getYearNext(date);
    }
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

export function getYearNext(date: Date): Date {
    return new Date(date.getFullYear() + 1, 0, 1);
}

export function getDateDiffHours(dateStart: Date, dateEnd: Date): number {
    return (dateEnd.getTime() - dateStart.getTime()) / 3600000;
}

export function getDateDiff(date: Date, hours: number) {
    return new Date(date.getTime() - hours * 3600000);
}

export function getYearEnd(date: Date) {
    return new Date(date.getFullYear(), 11, 31);
}

export function getMonthEnd(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}