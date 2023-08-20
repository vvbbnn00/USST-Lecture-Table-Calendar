import {addDays, format} from 'date-fns';
import {getTimeInformation} from "@/utils/information";

process.env.TZ = 'Asia/Shanghai' // 设置时区

export async function calcDate(weekNum, weekday, baseDate) {
    const {
        adjustDate: ADJUST_DATE,
        vacationDate: VACATION_DATE,
        semesterStartDateMap: SEMESTER_START_DATE_MAP,
        currentSemester: CURRENT_SEMESTER,
        currentSchoolYear: CURRENT_SCHOOL_YEAR
    } = await getTimeInformation();
    const SEMESTER_START_DATE = new Date(SEMESTER_START_DATE_MAP[`${CURRENT_SCHOOL_YEAR}-${CURRENT_SEMESTER}`]);
    if (!baseDate) {
        baseDate = SEMESTER_START_DATE;
    }

    weekNum = parseInt(weekNum);
    weekday = parseInt(weekday);

    const dayDelta = (weekNum - 1) * 7 + (weekday - 1);
    const date = addDays(baseDate, dayDelta);
    const dateStr = format(date, 'yyyy-MM-dd');
    let adjustDateParent = null;

    for (let key in ADJUST_DATE) {
        if (ADJUST_DATE[key] === dateStr) {
            adjustDateParent = key;
        }
    }

    return {
        datetimeObj: date,
        dateStr: dateStr,
        isVacation: VACATION_DATE.includes(dateStr),
        adjustDate: ADJUST_DATE[dateStr] || null,
        adjustDateParent: adjustDateParent,
        weekNumber: weekNum,
    };
}

export async function calcTime(startKc, endKc) {
    const {
        timeTable: TIME_TABLE
    } = await getTimeInformation();

    const startTimetable = TIME_TABLE[startKc];
    const endTimetable = TIME_TABLE[endKc];

    const start = startTimetable.split("|")[0].split(',').map(Number);
    const end = endTimetable.split("|")[1].split(',').map(Number);

    return {
        start: start[0] * 3600000 + start[1] * 60000 + start[2] * 1000,
        end: end[0] * 3600000 + end[1] * 60000 + end[2] * 1000,
    };
}

export function dateToArray(date) {
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