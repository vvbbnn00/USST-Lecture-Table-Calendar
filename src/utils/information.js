import {getCache, setCache} from './redis'

import apiConfig from "@/config/api.config";

/**
 * 获取整体时间信息，包括学期信息、放假安排等
 * @returns {Promise<any>}
 */
export async function getTimeInformation() {
    const cacheData = await getCache('BASIC:time_info');
    if (cacheData) {
        return JSON.parse(cacheData);
    }
    try {
        const res = await fetch(apiConfig.time_info);
        const data = await res.json()
        const retData = {
            schoolYearMap: data.school_year_map,
            semesterMap: data.semester_map,
            currentSchoolYear: data.current_school_year,
            currentSemester: data.current_semester,
            semesterStartDateMap: data.semester_start_date_map,
            timeTable: data.time_table,
            adjustDate: data.adjust_date,
            vacationDate: data.vacation_date,
        }

        await setCache('BASIC:time_info', JSON.stringify(retData), 86400);
        return retData;
    } catch (e) {
        console.log('获取时间信息失败', e)
        throw new Error('获取时间信息失败')
    }
}