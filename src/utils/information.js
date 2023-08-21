import makeFetchCookie from 'fetch-cookie'

import apiConfig from "@/config/api.config";
import systemConfig from "@/config/system.config";
import loginConfig from "@/config/login.config";
import {getCacheFunc} from "@/utils/cache";

const {getCache, setCache} = getCacheFunc();

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
        const res = await fetch(apiConfig.time_info, {
            cache: 'no-cache',
        });
        const data = await res.json()
        const retData = {
            schoolYearMap: data['school_year_map'],
            semesterMap: data['semester_map'],
            currentSchoolYear: data['current_school_year'],
            currentSemester: data['current_semester'],
            semesterStartDateMap: data['semester_start_date_map'],
            timeTable: data['time_table'],
            adjustDate: data['adjust_date'],
            vacationDate: data['vacation_date'],
        }

        setCache('BASIC:time_info', JSON.stringify(retData), 86400).then(() => {
            process.env.NEXT_RUNTIME === 'nodejs' && console.log('缓存时间信息成功')
        });
        return retData;
    } catch (e) {
        console.log('获取时间信息失败', e)
        throw new Error('获取时间信息失败')
    }
}


/**
 * 获取教务管理的课表信息
 * @param school_year 学年
 * @param semester 学期
 * @param cookieJar cookieJar
 * @returns {Promise<void>}
 */
export async function getRawLectureTable(school_year, semester, cookieJar) {
    const axiosInstance = makeFetchCookie(fetch, cookieJar);
    const header = {
        'User-Agent': apiConfig.edge_user_agent,
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    const requestForm = {
        xnm: school_year,
        xqm: semester,
        kzlx: 'cx'
    }

    const ret = await (await axiosInstance(apiConfig.course_table, {
        headers: header,
        method: 'POST',
        body: new URLSearchParams(requestForm),
        cache: 'no-cache',
        credentials: 'include',
    })).json();

    if (ret['kbList'] && ret['kbList'].length > 0) {
        return ret['kbList'];
    }

    throw new Error('获取课表失败');
}


/**
 * 获取课表信息，并自动缓存
 * @param school_year
 * @param semester
 * @returns {Promise<{lastUpdate: number, studentName, schoolYear, semester, lectureTable: void, schoolNumber}|any>}
 */
export async function getCachedLectureTable(school_year, semester) {
    // 检查缓存
    const cacheData = await getCache(`LECTURE_TABLE:${school_year}:${semester}`);
    if (cacheData) {
        console.log('使用缓存课表, ', school_year, semester)
        return JSON.parse(cacheData);
    }
    // 无缓存，重新获取
    console.log('获取课表中, ', school_year, semester)
    let name, cookieJar, stuInfo;
    switch (loginConfig.loginMethod) {
        case 'jwgl':
            const Jwgl_Login = require('./jwgl_login').default;
            const jwgl = new Jwgl_Login();
            [name, cookieJar, stuInfo] = await jwgl.login(loginConfig.jwgl.params.username, loginConfig.jwgl.params.password);
            break;
        case 'ids':
            const Ids6_Login = require('./ids6_login').default;
            const ids6 = new Ids6_Login();
            [name, cookieJar, stuInfo] = await ids6.loginIntoJwgl(loginConfig.ids.params.username, loginConfig.ids.params.password);
            break;
        default:
            throw new Error('未知登录方式');
    }
    console.log('登录系统成功')
    const school_number = stuInfo['xh_id'];
    // 获取课表
    const rawLectureTable = await getRawLectureTable(school_year, semester, cookieJar);
    const retData = {
        schoolYear: school_year,
        semester: semester,
        lectureTable: rawLectureTable,
        lastUpdate: Date.now(),
        schoolNumber: school_number,
        studentName: stuInfo['xm'],
    }
    console.log('获取课表成功')
    setCache(`LECTURE_TABLE:${school_year}:${semester}`, JSON.stringify(retData), systemConfig.courseTableCacheTime).then(() => {
        process.env.NEXT_RUNTIME === 'nodejs' && console.log('缓存课表成功, ', school_year, semester, '有效期', systemConfig.courseTableCacheTime, '秒')
    });
    return retData;
}