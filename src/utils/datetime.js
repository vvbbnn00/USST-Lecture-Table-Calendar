import {addDays, format} from 'date-fns';

class DatetimeUtil {
    constructor(timeInfo) {
        const {
            adjustDate: ADJUST_DATE,
            vacationDate: VACATION_DATE,
            semesterStartDateMap: SEMESTER_START_DATE_MAP,
            currentSemester: CURRENT_SEMESTER,
            currentSchoolYear: CURRENT_SCHOOL_YEAR,
            timeTable: TIME_TABLE
        } = timeInfo;
        Object.assign(this, {
            ADJUST_DATE,
            VACATION_DATE,
            SEMESTER_START_DATE_MAP,
            CURRENT_SEMESTER,
            CURRENT_SCHOOL_YEAR,
            TIME_TABLE
        });
    }

    /**
     * 计算日期
     * @param weekNum
     * @param weekday
     * @param baseDate
     * @returns {Promise<{dateStr: string, adjustDate: (*|null), adjustDateParent: null, isVacation: *, datetimeObj: Date, weekNumber: number}>}
     */
    async calcDate(weekNum, weekday, baseDate) {

        const SEMESTER_START_DATE = new Date(this.SEMESTER_START_DATE_MAP[`${this.CURRENT_SCHOOL_YEAR}-${this.CURRENT_SEMESTER}`]);
        if (!baseDate) {
            baseDate = SEMESTER_START_DATE;
        }

        weekNum = parseInt(weekNum);
        weekday = parseInt(weekday);

        const dayDelta = (weekNum - 1) * 7 + (weekday - 1);
        const date = addDays(baseDate, dayDelta);
        const dateStr = format(date, 'yyyy-MM-dd');
        let adjustDateParent = null;

        for (let key in this.ADJUST_DATE) {
            if (this.ADJUST_DATE[key] === dateStr) {
                adjustDateParent = key;
            }
        }

        return {
            datetimeObj: date,
            dateStr: dateStr,
            isVacation: this.VACATION_DATE.includes(dateStr),
            adjustDate: this.ADJUST_DATE[dateStr] || null,
            adjustDateParent: adjustDateParent,
            weekNumber: weekNum,
        };
    }

    /**
     * 计算时间
     * @param startKc
     * @param endKc
     * @returns {Promise<{start: number, end: number}>}
     */
    async calcTime(startKc, endKc) {
        const startTimetable = this.TIME_TABLE[startKc];
        const endTimetable = this.TIME_TABLE[endKc];

        const start = startTimetable.split("|")[0].split(',').map(Number);
        const end = endTimetable.split("|")[1].split(',').map(Number);

        return {
            start: start[0] * 3600000 + start[1] * 60000 + start[2] * 1000,
            end: end[0] * 3600000 + end[1] * 60000 + end[2] * 1000,
        };
    }

    /**
     * 日期转数组
     * @param date
     * @returns {(number|number)[]}
     */
    dateToArray(date) {
        const dateObj = new Date(date);

        return [
            dateObj.getFullYear(),
            dateObj.getMonth() + 1,
            dateObj.getDate(),
            dateObj.getHours(),
            dateObj.getMinutes(),
            dateObj.getSeconds(),
        ]
    }
}

export default DatetimeUtil;
